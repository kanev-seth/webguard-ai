import os
import polars as pl
import numpy as np
import joblib
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# ─────────────────────────────────────────────────────────────────────────────
# GLOBAL MODEL LOADING
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model      = joblib.load(os.path.join(BASE_DIR, "isolation_forest_model.pkl"))
scaler     = joblib.load(os.path.join(BASE_DIR, "robust_scaler.pkl"))
ip_profile = joblib.load(os.path.join(BASE_DIR, "ip_profile_train.pkl"))

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────────────────────
# TEAMMATE'S ORIGINAL LOGIC 
# ─────────────────────────────────────────────────────────────────────────────
def parse_log_line(log_line: str) -> dict | None:
    pattern = re.compile(
        r'(?P<ip>\S+)'
        r'.+?'
        r'\[(?P<time>[^\]]+)\]'
        r'\s+"(?P<method>\S+)'
        r'\s+(?P<url>\S+)'
        r'\s+(?P<protocol>[^"]+)"'
        r'\s+(?P<status>\d{3})'
        r'\s+(?P<size>\d+)'
        r'\s+"(?P<referrer>[^"]*)"'
        r'\s+"(?P<user_agent>[^"]*)"'
    )
    match = pattern.match(log_line.strip())
    if not match:
        return None
    d = match.groupdict()
    return {
        "ip"        : d["ip"],
        "time"      : d["time"],
        "method"    : d["method"],
        "url"       : d["url"],
        "protocol"  : d["protocol"].strip(),
        "status"    : int(d["status"]),
        "size"      : int(d["size"]),
        "referrer"  : d["referrer"],
        "user_agent": d["user_agent"],
    }

MOBILE_PATTERN  = r"(?i)(android|iphone|ipad|mobile|windows phone)"
BROWSER_PATTERN = r"(?i)mozilla"
BOT_PATTERN     = r"(?i)(curl|python|scrapy|bot|crawler|wget|java|go-http|nikto|nmap|masscan|sqlmap)"

def engineer_features(parsed: dict, ip_profile: pl.DataFrame) -> np.ndarray:
    ip  = parsed["ip"]
    ua  = parsed["user_agent"]
    url = parsed["url"]

    try:
        time_parsed = pl.Series([parsed["time"]]).str.strptime(
            pl.Datetime, format="%Y-%m-%d %H:%M:%S%z", strict=False
        )[0]
        hour_of_day = time_parsed.hour if time_parsed is not None else 12
    except Exception:
        hour_of_day = 12

    try:
        ip_row = ip_profile.filter(pl.col("ip") == ip)
        if len(ip_row) > 0:
            ip_request_count = int(ip_row["ip_request_count"][0])
            ip_error_rate    = float(ip_row["ip_error_rate"][0])
            ip_unique_urls   = int(ip_row["ip_unique_urls"][0])
        else:
            ip_request_count = 0
            ip_error_rate    = 0.0
            ip_unique_urls   = 0
    except Exception:
        ip_request_count = 0
        ip_error_rate    = 0.0
        ip_unique_urls   = 0

    requests_per_minute = 1
    url_length          = len(url)
    very_long_url       = int(url_length > 200)

    ua_clean      = ua if ua and ua != "-" else ""
    ua_is_mobile  = int(bool(re.search(MOBILE_PATTERN,  ua_clean)))
    ua_is_browser = int(
        bool(re.search(BROWSER_PATTERN, ua_clean)) and
        not bool(re.search(BOT_PATTERN, ua_clean))
    )
    ua_is_script       = int(ua_is_browser == 0 and ua_is_mobile == 0)
    rpm_to_total_ratio = requests_per_minute / (ip_request_count + 1)
    high_error_ip      = int(ip_error_rate > 0.1)
    night_script       = int(hour_of_day in range(1, 6) and ua_is_browser == 0)

    return np.array([
        hour_of_day, requests_per_minute, ip_request_count,
        ip_error_rate, ip_unique_urls, url_length,
        ua_is_mobile, ua_is_browser, rpm_to_total_ratio,
        high_error_ip, very_long_url, ua_is_script, night_script,
    ], dtype=np.float32).reshape(1, -1)

def explain(parsed: dict, features: np.ndarray) -> list[str]:
    reasons = []
    f = features[0]
    hour         = int(f[0])
    err_rate     = float(f[3])
    url_len      = int(f[5])
    ua_mobile    = int(f[6])
    high_err     = int(f[9])
    long_url     = int(f[10])
    ua_script    = int(f[11])
    night_sc     = int(f[12])
    status       = parsed["status"]
    ua           = parsed["user_agent"]
    url          = parsed["url"]

    if night_sc:
        reasons.append(f"Non-browser traffic at {hour:02d}:xx (night-time script activity)")
    if ua_script and not ua_mobile:
        reasons.append(f"User-agent looks like a script/tool: '{ua[:60]}'")
    if long_url:
        reasons.append(f"Unusually long URL ({url_len} chars) — possible injection or traversal")
    if high_err:
        reasons.append(f"IP has high historical error rate ({err_rate:.1%})")
    if status in (400, 403, 404, 500):
        reasons.append(f"HTTP {status} response — request was blocked or failed")
    if any(kw in url.lower() for kw in ["passwd", "etc/", "admin", "wp-login", "cmd=", "exec", "select", "union", ".env", "config"]):
        reasons.append(f"URL contains suspicious keyword: '{url[:80]}'")
    if not reasons:
        reasons.append("Combination of low-signal features pushed score below threshold")
    return reasons

def analyze_logs(raw_logs: list[str]) -> list[dict]:
    results = []
    parsed_list  = []
    feature_list = []
    valid_indices = []

    for i, line in enumerate(raw_logs):
        parsed = parse_log_line(line)
        if parsed is None:
            continue
        features = engineer_features(parsed, ip_profile)
        parsed_list.append(parsed)
        feature_list.append(features)
        valid_indices.append(i)

    if not feature_list:
        return []

    X         = np.vstack(feature_list)
    X_scaled  = scaler.transform(X)
    preds     = model.predict(X_scaled)
    scores    = model.decision_function(X_scaled)

    for idx, pred, score, parsed, features in zip(valid_indices, preds, scores, parsed_list, feature_list):
        is_anomaly = bool(pred == -1)
        reasons    = explain(parsed, features) if is_anomaly else []
        
        results.append({
            "ip":            parsed.get("ip", ""),
            "timestamp":     parsed.get("time", ""),
            "method":        parsed.get("method", ""),
            "url":           parsed.get("url", ""),
            "status":        parsed.get("status", 0),
            "bytes":         parsed.get("size", 0),
            "is_anomaly":    is_anomaly,
            "anomaly_score": float(score),
            "reasons":       reasons,
        })
    return results

# ─────────────────────────────────────────────────────────────────────────────
# API ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True, silent=True)
    if not data or "logs" not in data:
        return jsonify({"error": "Request body must be JSON with a 'logs' key."}), 400

    raw_logs = data["logs"]
    if isinstance(raw_logs, str):
        raw_logs = raw_logs.split("\n")
    if not isinstance(raw_logs, list):
        return jsonify({"error": "'logs' must be an array of strings."}), 400

    raw_logs = [line.rstrip("\r").strip() for line in raw_logs if line.strip()]
    if len(raw_logs) == 0:
        return jsonify({"results": [], "total": 0, "anomalies": 0})

    try:
        results   = analyze_logs(raw_logs)
        anomalies = sum(1 for r in results if r["is_anomaly"])
        return jsonify({
            "total":     len(results),
            "anomalies": anomalies,
            "results":   results,
        })
    except Exception as e:
        traceback.print_exc() # Prints exact error to Terminal 1
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 WebGuard AI — ML Microservice starting on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=False)