import os
import math
import polars as pl
import numpy as np
import joblib
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# =============================================================================
#  WEBGUARD AI  -  ML Microservice  (port 5001)
# =============================================================================

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
model      = joblib.load(os.path.join(BASE_DIR, "isolation_forest_model.pkl"))
scaler     = joblib.load(os.path.join(BASE_DIR, "robust_scaler.pkl"))
ip_profile = joblib.load(os.path.join(BASE_DIR, "ip_profile_train.pkl"))

app = Flask(__name__)
CORS(app)

# =============================================================================
#  LOG PARSING
#  The key fix: URL uses `.+?` (lazy match for ANY chars including spaces)
#  anchored by `\s+HTTP/` to capture full payloads like
#  "/index.php?id=1' UNION SELECT username,password FROM users--"
# =============================================================================
LOG_PATTERN = re.compile(
    r'(?P<ip>\S+)'                      # IP address
    r'.+?'                               # ident / user (skip)
    r'\[(?P<time>[^\]]+)\]'             # [timestamp]
    r'\s+"(?P<method>[A-Z]+)'           # "METHOD
    r'\s+(?P<url>.+?)'                  # URL — lazy, captures spaces too
    r'\s+(?P<protocol>HTTP/[\d.]+)"'    # HTTP/1.x"
    r'\s+(?P<status>\d{3})'             # status code
    r'\s+(?P<size>\d+|-)'               # bytes (or "-")
    r'(?:\s+"(?P<referrer>[^"]*)")?'    # optional referrer
    r'(?:\s+"(?P<user_agent>[^"]*)")?'  # optional user-agent
)

def parse_log_line(line: str) -> dict | None:
    m = LOG_PATTERN.match(line.strip())
    if not m:
        return None
    g = m.groupdict()
    size_raw = g.get("size", "0") or "0"
    return {
        "ip":         g["ip"],
        "time":       g["time"],
        "method":     g["method"],
        "url":        g["url"],          # ← now contains the FULL URL with spaces
        "protocol":   g["protocol"],
        "status":     int(g["status"]),
        "size":       0 if size_raw == "-" else int(size_raw),
        "referrer":   g.get("referrer", "") or "",
        "user_agent": g.get("user_agent", "") or "",
    }

# =============================================================================
#  RULE-BASED THREAT DETECTION ENGINE
#  Deterministic signatures — always override the ML model when triggered.
#  Each rule returns a human-readable reason string.
# =============================================================================

# ── Threat category definitions ────────────────────────────────────────────────
THREAT_RULES: list[dict] = [

    # ── SQL Injection ──────────────────────────────────────────────────────────
    {
        "category": "SQL Injection",
        "field":    "url",
        "patterns": [
            r"(?i)(union\s+select)",
            r"(?i)(select\s+.{0,40}\s+from\s)",
            r"(?i)(insert\s+into\s)",
            r"(?i)(drop\s+table\s)",
            r"(?i)(exec\s*\(|xp_cmdshell|xp_exec)",
            r"(?i)(information_schema|sysobjects|syscolumns)",
            r"(?i)(or\s*'?1'?\s*=\s*'?1|and\s*'?1'?\s*=\s*'?1)",
            r"(?i)(or\s+1\s*=\s*1|and\s+1\s*=\s*1)",
            r"(?i)(sleep\s*\(|benchmark\s*\(|waitfor\s+delay|pg_sleep)",
            r"(?i)('?\s*--\s*(-|$)|'?\s*#\s*$)",
            r"(?i)(char\s*\(\s*\d|ascii\s*\(|hex\s*\(|0x[0-9a-f]{4,})",
            r"(?i)('\s*or\s*'[^']*'\s*=\s*')",
        ],
        "severity": "CRITICAL",
        "message":  "SQL Injection attack detected",
    },

    # ── Path Traversal / LFI ──────────────────────────────────────────────────
    {
        "category": "Path Traversal",
        "field":    "url",
        "patterns": [
            r"(\.\./|%2e%2e/|%252e%252e/|\.\.\\)",
            r"(?i)(/etc/passwd|/etc/shadow|/etc/hosts|/proc/self)",
            r"(?i)(/var/log|/windows/system32|/boot\.ini|/win\.ini)",
            r"(?i)(\.env\b|\.env\.local|\.env\.prod)",
            r"(?i)(config\.php|wp-config\.php|configuration\.php|web\.config|app\.config)",
            r"(?i)(backup\.(sql|zip|tar|gz|db)|dump\.(sql|zip))",
            r"(?i)(database\.(yml|json|env)|db\.sqlite|\.sqlite3)",
        ],
        "severity": "HIGH",
        "message":  "Path traversal / sensitive file access attempt",
    },

    # ── Reconnaissance / Scanner Probes ──────────────────────────────────────
    {
        "category": "Reconnaissance",
        "field":    "url",
        "patterns": [
            r"(?i)(wp-login\.php|wp-admin|xmlrpc\.php|wp-content/)",
            r"(?i)(phpmyadmin|pma/|myadmin/|mysql-admin/)",
            r"(?i)(/server-status|/server-info|/phpinfo\.php)",
            r"(?i)(\.git/|\.svn/|\.hg/|\.DS_Store)",
            r"(?i)(admin\.php|admin/config|/manager/html|/console)",
            r"(?i)(/actuator/|/metrics|/health|/env\b|/trace\b)",
        ],
        "severity": "MEDIUM",
        "message":  "Reconnaissance / admin panel probe detected",
    },

    # ── Known Attack Tool User-Agents ─────────────────────────────────────────
    {
        "category": "Attack Tool",
        "field":    "user_agent",
        "patterns": [
            r"(?i)(sqlmap)",
            r"(?i)(nikto)",
            r"(?i)(nmap\s|nmap/)",
            r"(?i)(masscan|zgrab|zmap)",
            r"(?i)(dirbuster|gobuster|dirb\b|wfuzz|ffuf)",
            r"(?i)(hydra|medusa|patator)",
            r"(?i)(burpsuite|burp\s+suite)",
            r"(?i)(acunetix|nessus|openvas|qualys)",
            r"(?i)(metasploit|meterpreter)",
            r"(?i)(python-requests/|go-http-client/|libwww-perl/)",
            r"(?i)(wget/[0-9]|curl/[0-9])(?!.*Mozilla)",
        ],
        "severity": "HIGH",
        "message":  "Known attack tool / scanner user-agent identified",
    },

    # ── XSS ───────────────────────────────────────────────────────────────────
    {
        "category": "XSS",
        "field":    "url",
        "patterns": [
            r"(?i)(<script[\s>]|</script>|javascript\s*:)",
            r"(?i)(onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=)",
            r"(?i)(alert\s*\(|confirm\s*\(|prompt\s*\()",
            r"(?i)(%3cscript|%3c%2fscript|%22%3e%3cscript)",
            r"(?i)(document\.cookie|document\.write|window\.location)",
        ],
        "severity": "HIGH",
        "message":  "Cross-Site Scripting (XSS) payload detected in request",
    },

    # ── Command Injection ─────────────────────────────────────────────────────
    {
        "category": "Command Injection",
        "field":    "url",
        "patterns": [
            r"(?i)(;|\||&&|\$\(|`).{0,30}(ls|cat|pwd|id|whoami|wget|curl|bash|sh|cmd|powershell)",
            r"(?i)(cmd=|exec=|command=|shell=|system\(|passthru\(|popen\()",
            r"(?i)(%60|%7c|%26%26).{0,20}(ls|cat|id|wget)",
        ],
        "severity": "CRITICAL",
        "message":  "Remote command injection attempt detected",
    },

    # ── Brute Force ───────────────────────────────────────────────────────────
    # Applied with IP-based rate detection in analyze_logs()
    {
        "category": "Brute Force",
        "field":    "url",
        "patterns": [
            r"(?i)(/admin/login|/admin/auth)",
            r"(?i)(/api/auth/login|/api/auth/token|/api/login|/api/v[0-9]/auth)",
            r"(?i)(/login|/signin|/sign-in|/wp-login\.php)",
        ],
        "severity": "HIGH",
        "message":  "Repeated authentication failure — credential brute-force suspected",
        "_brute_only": True,   # Only fire when status is 401 or 403
    },

    # ── Sensitive Credential / Backup Exfiltration ────────────────────────────
    {
        "category": "Data Exfiltration",
        "field":    "url",
        "patterns": [
            r"(?i)(secret/|secrets/|private/|credentials?/)",
            r"(?i)(/backup|/bak/|/old/|/archive/)",
            r"(?i)(\.(bak|old|orig|save|tmp|swp)$)",
            r"(?i)(password|passwd|shadow|credentials?).*\.(txt|sql|csv|json|xml)$",
        ],
        "severity": "CRITICAL",
        "message":  "Possible sensitive data / credential file access attempt",
    },

    # ── Suspicious HTTP Method + Status combinations ──────────────────────────
    {
        "category": "Anomalous Request",
        "field":    "url",
        "patterns": [
            r"(?i)(TRACE|CONNECT|PROPFIND|PROPPATCH|MKCOL|COPY|MOVE|LOCK|UNLOCK)",
        ],
        "severity": "MEDIUM",
        "message":  "Unusual HTTP method used — possible server-side request forgery or WebDAV probe",
    },
]

# ── IP-level intelligence (built per-batch) ───────────────────────────────────
def build_ip_intel(parsed_list: list[dict]) -> dict[str, dict]:
    """
    For each IP compute:  total_requests, error_count, auth_failures,
    unique_urls, is_rapid (>= 5 requests).
    """
    intel: dict[str, dict] = {}
    for p in parsed_list:
        ip = p["ip"]
        if ip not in intel:
            intel[ip] = {"total": 0, "errors": 0, "auth_failures": 0, "urls": set()}
        intel[ip]["total"] += 1
        if p["status"] >= 400:
            intel[ip]["errors"] += 1
        if p["status"] in (401, 403) and re.search(r"(?i)(login|auth|signin)", p["url"]):
            intel[ip]["auth_failures"] += 1
        intel[ip]["urls"].add(p["url"])
    # Convert sets to counts
    for ip in intel:
        intel[ip]["unique_urls"]    = len(intel[ip]["urls"])
        intel[ip]["error_rate"]     = intel[ip]["errors"] / max(1, intel[ip]["total"])
        intel[ip]["is_rapid"]       = intel[ip]["total"] >= 5
        del intel[ip]["urls"]
    return intel


def rule_based_detect(parsed: dict, ip_intel: dict) -> tuple[bool, str | None, list[str]]:
    """
    Returns (is_threat, category, [reasons]).
    Runs ALL applicable rules; collects all matching reasons.
    """
    url    = parsed.get("url", "")
    ua     = parsed.get("user_agent", "")
    status = parsed.get("status", 200)
    method = parsed.get("method", "GET")
    ip     = parsed.get("ip", "")
    intel  = ip_intel.get(ip, {})

    matched_categories: list[str] = []
    reasons: list[str] = []

    for rule in THREAT_RULES:
        field_val = url if rule["field"] == "url" else ua

        # Brute-force rule only fires on 401/403
        if rule.get("_brute_only"):
            if status not in (401, 403):
                continue
            if intel.get("auth_failures", 0) < 2:
                continue

        for pat in rule["patterns"]:
            if re.search(pat, field_val):
                cat = rule["category"]
                matched_categories.append(cat)
                reasons.append(f"[{cat}] {rule['message']}: '{field_val[:90]}'")
                break   # one match per rule block is enough

    # ── Additional behavioural signals ────────────────────────────────────────

    # Rapid scan: same IP hit >= 5 requests in the batch with high error rate
    if intel.get("is_rapid") and intel.get("error_rate", 0) >= 0.4:
        reasons.append(
            f"[Scanning] Rapid request burst from {ip} "
            f"({intel['total']} reqs, {intel['error_rate']:.0%} error rate)"
        )
        matched_categories.append("Scanning")

    # High volume of unique URL paths from one IP (probing/discovery)
    if intel.get("unique_urls", 0) >= 5 and intel.get("error_rate", 0) >= 0.3:
        reasons.append(
            f"[Enumeration] IP accessed {intel['unique_urls']} unique paths "
            f"with {intel['error_rate']:.0%} error rate — directory enumeration suspected"
        )
        matched_categories.append("Enumeration")

    # Non-browser UA at unusual hours touching error-prone paths
    if re.search(r"(?i)(curl|wget|python|go-http|libwww)", ua):
        if status in (400, 403, 404, 500) and not re.search(r"(?i)mozilla", ua):
            reasons.append(
                f"[Automated] Non-browser tool ({ua[:50]}) received HTTP {status}"
            )
            matched_categories.append("Automated")

    # HTTP 500 on a request that also has a suspicious URL pattern
    if status == 500 and any(kw in url.lower() for kw in
            ["select", "union", "exec", "insert", "drop", "script", "../"]):
        reasons.append(
            f"[Probe Success?] HTTP 500 on suspicious URL — server may have processed attack payload"
        )
        matched_categories.append("Probe")

    is_threat = len(reasons) > 0
    primary   = matched_categories[0] if matched_categories else None
    return is_threat, primary, reasons


# =============================================================================
#  ML FEATURE ENGINEERING  (kept for anomaly_score output)
# =============================================================================
MOBILE_PATTERN  = r"(?i)(android|iphone|ipad|mobile|windows phone)"
BROWSER_PATTERN = r"(?i)mozilla"
BOT_PATTERN     = r"(?i)(curl|python|scrapy|bot|crawler|wget|java|go-http|nikto|nmap|masscan|sqlmap)"

def engineer_features(parsed: dict, ip_profile: pl.DataFrame) -> np.ndarray:
    ip  = parsed["ip"]
    ua  = parsed["user_agent"]
    url = parsed["url"]

    try:
        # Apache/Nginx Combined Log Format: "06/Mar/2026:09:01:12 +0000"
        time_parsed = pl.Series([parsed["time"]]).str.strptime(
            pl.Datetime, format="%d/%b/%Y:%H:%M:%S %z", strict=False
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


# =============================================================================
#  MAIN ANALYSIS PIPELINE
# =============================================================================
def analyze_logs(raw_logs: list[str]) -> list[dict]:
    # ── Step 1: Parse all lines ───────────────────────────────────────────────
    parsed_list:  list[dict]       = []
    feature_list: list[np.ndarray] = []

    for line in raw_logs:
        p = parse_log_line(line)
        if p is None:
            continue
        parsed_list.append(p)
        feature_list.append(engineer_features(p, ip_profile))

    if not parsed_list:
        return []

    # ── Step 2: ML batch scoring ──────────────────────────────────────────────
    X        = np.vstack(feature_list)
    X_scaled = scaler.transform(X)
    ml_preds = model.predict(X_scaled)          # -1 = anomaly, 1 = normal
    ml_score = model.decision_function(X_scaled)

    # ── Step 3: Build per-batch IP intelligence ───────────────────────────────
    ip_intel = build_ip_intel(parsed_list)

    # ── Step 4: Per-row decision (rules ALWAYS take priority over ML) ─────────
    results: list[dict] = []
    for parsed, features, ml_pred, score in zip(
        parsed_list, feature_list, ml_preds, ml_score
    ):
        rule_threat, rule_category, rule_reasons = rule_based_detect(parsed, ip_intel)
        ml_anomaly = bool(ml_pred == -1)

        is_anomaly = rule_threat or ml_anomaly

        # Compile final reasons
        if rule_reasons:
            final_reasons = rule_reasons
            if ml_anomaly:
                final_reasons = final_reasons + ["[ML] Isolation Forest flagged as statistical anomaly"]
        elif ml_anomaly:
            # Fall back to ML explanation
            final_reasons = _ml_explain(parsed, features)
            if not final_reasons:
                final_reasons = ["[ML] Anomalous feature combination detected by Isolation Forest"]
        else:
            final_reasons = []

        # Determine threat category label
        category = rule_category or ("Anomaly" if ml_anomaly else "Benign")

        results.append({
            "ip":            parsed["ip"],
            "timestamp":     parsed["time"],
            "method":        parsed["method"],
            "url":           parsed["url"],
            "status":        parsed["status"],
            "bytes":         parsed["size"],
            "is_anomaly":    is_anomaly,
            "anomaly_score": 0.0 if math.isnan(float(score)) else float(score),
            "reasons":       final_reasons,
            "category":      category,
        })

    return results


def _ml_explain(parsed: dict, features: np.ndarray) -> list[str]:
    """Human-readable ML feature explanation (fallback only)."""
    reasons = []
    f       = features[0]
    hour    = int(f[0])
    ua      = parsed.get("user_agent", "")
    url     = parsed.get("url", "")
    status  = parsed.get("status", 200)

    if int(f[12]):  # night_script
        reasons.append(f"[Behavioural] Non-browser traffic at {hour:02d}:xx (off-hours script activity)")
    if int(f[11]) and not int(f[6]):  # ua_is_script and not mobile
        reasons.append(f"[Behavioural] Scripted user-agent: '{ua[:60]}'")
    if int(f[10]):  # very_long_url
        reasons.append(f"[Behavioural] Unusually long URL ({int(f[5])} chars) — possible injection attempt")
    if int(f[9]):   # high_error_ip
        reasons.append(f"[Behavioural] IP has elevated historical error rate ({float(f[3]):.1%})")
    if status in (400, 403, 404, 500):
        reasons.append(f"[Behavioural] HTTP {status} — request was blocked or caused an error")
    return reasons


# =============================================================================
#  FLASK API
# =============================================================================
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

    raw_logs = [ln.rstrip("\r").strip() for ln in raw_logs if ln.strip()]
    if not raw_logs:
        return jsonify({"results": [], "total": 0, "anomalies": 0})

    try:
        results   = analyze_logs(raw_logs)
        anomalies = sum(1 for r in results if r["is_anomaly"])
        return jsonify({"total": len(results), "anomalies": anomalies, "results": results})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "WebGuard AI ML Microservice"})


if __name__ == "__main__":
    print("[WebGuard AI] ML Microservice starting on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=False)