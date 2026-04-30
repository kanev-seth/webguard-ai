/**
 * aiReporting.js — WebGuard AI threat reporting engine
 *
 * Two-tier approach:
 *  1. HuggingFace Mistral-7B  (if HUGGINGFACE_API_KEY is present)
 *  2. Deterministic local engine  (always works, produces genuine expert analysis)
 */

const HF_API_URL =
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

// =============================================================================
//  LOCAL EXPERT ANALYSIS ENGINE
//  Produces genuine, data-driven security briefings without any external API.
// =============================================================================

/** Derive the primary threat category from a reason string */
function categoriseReason(reason) {
    const r = reason.toLowerCase();
    if (r.includes('sql') || r.includes('injection'))         return 'SQL Injection';
    if (r.includes('traversal') || r.includes('/etc/')
        || r.includes('sensitive file'))                      return 'Path Traversal / LFI';
    if (r.includes('xss') || r.includes('cross-site'))        return 'Cross-Site Scripting';
    if (r.includes('command') || r.includes('rce'))           return 'Command Injection';
    if (r.includes('brute') || r.includes('auth')
        || r.includes('credential'))                          return 'Credential Brute-Force';
    if (r.includes('scanner') || r.includes('attack tool')
        || r.includes('sqlmap') || r.includes('nikto'))       return 'Automated Scanner';
    if (r.includes('scan') || r.includes('enumeration')
        || r.includes('recon'))                               return 'Reconnaissance';
    if (r.includes('exfil') || r.includes('backup')
        || r.includes('credential file'))                     return 'Data Exfiltration';
    if (r.includes('automated') || r.includes('non-browser')) return 'Automated Scripting';
    if (r.includes('behavioural') || r.includes('ml'))        return 'Statistical Anomaly';
    return 'Suspicious Activity';
}

function localExpertAnalysis(anomalies) {
    const all      = anomalies;
    const threats  = anomalies.filter((r) => r.is_anomaly);
    const total    = all.length;
    const tCount   = threats.length;
    const rate     = total ? ((tCount / total) * 100).toFixed(1) : '0.0';

    // ── Threat category frequency ─────────────────────────────────────────────
    const catFreq = {};
    for (const t of threats) {
        const reasons = Array.isArray(t.reasons) ? t.reasons : [String(t.reasons ?? '')];
        const cat = reasons.length > 0 ? categoriseReason(reasons[0]) : 'Suspicious Activity';
        catFreq[cat] = (catFreq[cat] ?? 0) + 1;
    }
    const sortedCats = Object.entries(catFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);
    const topCat  = sortedCats[0] ?? 'Suspicious Activity';
    const catList = sortedCats.slice(0, 3).join(', ');

    // ── Attacking IP intelligence ─────────────────────────────────────────────
    const ipFreq = {};
    for (const t of threats) {
        ipFreq[t.ip] = (ipFreq[t.ip] ?? 0) + 1;
    }
    const topIPs = Object.entries(ipFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([ip, n]) => `${ip} (${n} request${n > 1 ? 's' : ''})`);
    const ipSentence = topIPs.length
        ? `Primary threat actors: ${topIPs.join(', ')}.`
        : '';

    // ── Status code analysis ─────────────────────────────────────────────────
    const s5xx = threats.filter((r) => r.status >= 500).length;
    const s4xx = threats.filter((r) => r.status >= 400 && r.status < 500).length;

    // ── Risk level ────────────────────────────────────────────────────────────
    const rateNum = parseFloat(rate);
    let riskLevel;
    const hasCritical = sortedCats.some((c) =>
        ['SQL Injection','Command Injection','Data Exfiltration','Path Traversal / LFI'].includes(c)
    );
    if (tCount === 0) {
        riskLevel = 'LOW';
    } else if (hasCritical || rateNum >= 30 || tCount >= 10) {
        riskLevel = 'CRITICAL';
    } else if (rateNum >= 15 || tCount >= 5) {
        riskLevel = 'HIGH';
    } else if (rateNum >= 5 || tCount >= 2) {
        riskLevel = 'MEDIUM';
    } else {
        riskLevel = 'LOW';
    }

    // ── Executive Summary ─────────────────────────────────────────────────────
    let summary;
    if (tCount === 0) {
        summary =
            `WebGuard AI completed analysis of ${total.toLocaleString()} log entries. ` +
            `No anomalous activity was detected; all requests fall within expected operational parameters. ` +
            `System posture is nominal — continue routine monitoring and schedule the next audit within 7 days.`;
    } else {
        const s500Note = s5xx > 0
            ? ` ${s5xx} request${s5xx > 1 ? 's' : ''} returned HTTP 5xx, indicating possible successful probe execution.`
            : '';
        summary =
            `WebGuard AI detected ${tCount} threat${tCount > 1 ? 's' : ''} out of ` +
            `${total.toLocaleString()} analysed log entries (${rate}% anomaly rate), ` +
            `with ${topCat} as the dominant attack vector.` +
            (catList !== topCat ? ` Additional categories: ${sortedCats.slice(1, 3).join(', ')}.` : '') +
            ` ${ipSentence}` +
            (s5xx > 0 ? s500Note : '') +
            ` Immediate containment of confirmed threat actors is recommended.`;
    }

    // ── Remediation Steps (category-aware) ───────────────────────────────────
    const remediationMap = {
        'SQL Injection': [
            'Deploy a Web Application Firewall (WAF) rule set targeting OWASP SQL Injection signatures and block all detected source IPs immediately.',
            'Audit all database queries in the application for parameterised statement compliance; prioritise endpoints surfaced in the log analysis.',
            'Enable detailed query logging on the database server and set up anomaly alerts for unusual SELECT/UNION patterns.',
        ],
        'Path Traversal / LFI': [
            'Block the identified source IPs at the edge firewall and patch any file inclusion endpoints to enforce strict path whitelist validation.',
            'Audit server configuration to ensure sensitive system files (/etc/passwd, .env, config.*) are not accessible via the web root.',
            'Deploy server-side input validation that canonicalises file paths and rejects any sequence containing "../" or absolute path prefixes.',
        ],
        'Credential Brute-Force': [
            'Immediately enable account lockout (5 failed attempts) and CAPTCHA on all authentication endpoints identified in the log.',
            'Enforce IP-based rate limiting (max 10 auth requests/minute) at the load balancer for all /login, /api/auth, and /admin paths.',
            'Rotate all service credentials and API keys for accounts that received repeated 401/403 responses during the attack window.',
        ],
        'Automated Scanner': [
            'Block all source IPs associated with known scanner user-agents at the network perimeter and add them to your threat intelligence feed.',
            'Enable bot-detection middleware (e.g. Cloudflare Bot Management or AWS WAF Bot Control) to fingerprint and challenge non-browser traffic.',
            'Review server error logs for any 200 responses to scanner probes, which may indicate undisclosed vulnerabilities successfully located.',
        ],
        'Reconnaissance': [
            'Block source IPs performing directory enumeration and configure the web server to return 403 (not 404) on restricted paths to reduce information leakage.',
            'Remove or relocate admin panels, configuration files, and backup archives from publicly accessible directories.',
            'Enable honeypot trap paths (e.g. /admin-old, /backup.zip) to automatically trigger IP blocks when accessed.',
        ],
        'Command Injection': [
            'Immediately isolate the affected server instance and conduct a forensic review to determine if any commands were successfully executed.',
            'Patch all API parameters and form inputs that interact with system-level calls; enforce strict allow-list validation on all shell-adjacent inputs.',
            'Review OS-level audit logs (auditd / Windows Event Log) for evidence of unauthorised process execution during the attack window.',
        ],
        'Data Exfiltration': [
            'Block source IPs and audit all outbound data transfers from the server during the attack window for evidence of sensitive data access.',
            'Immediately rotate all credentials, API keys, and secrets that may have been accessible via the probed file paths.',
            'Implement DLP (Data Loss Prevention) rules to alert on large-volume downloads or access to credential/backup file types.',
        ],
        'Cross-Site Scripting': [
            'Implement a Content Security Policy (CSP) header to restrict inline script execution and report violations to your SOC.',
            'Audit all input reflection points in the application and enforce output encoding using context-aware escaping libraries.',
            'Deploy WAF rules targeting XSS payloads and monitor for stolen session tokens in your authentication logs.',
        ],
    };

    const remediations =
        remediationMap[topCat] ??
        [
            `Block the ${topIPs.length ? topIPs[0].split(' ')[0] : 'identified'} source IP(s) at the edge firewall and investigate the full request context.`,
            'Review application logs for any successful exploitation indicators and patch all affected endpoints.',
            'Enable enhanced logging, set up real-time anomaly alerts, and schedule a penetration test within 30 days.',
        ];

    return { summary, riskLevel, remediations, aiEnabled: false };
}

// =============================================================================
//  HUGGINGFACE INTEGRATION  (used when API key is present)
// =============================================================================

function buildPrompt(anomalies) {
    const anomalyOnly  = anomalies.filter((r) => r.is_anomaly);
    const total        = anomalies.length;
    const anomalyCount = anomalyOnly.length;
    const anomalyRate  = ((anomalyCount / total) * 100).toFixed(1);

    const topRows = anomalyOnly.slice(0, 20).map((r, i) =>
        `${i + 1}. IP=${r.ip} URL=${r.url} Status=${r.status} Score=${Number(r.anomaly_score).toFixed(4)} Reasons=[${Array.isArray(r.reasons) ? r.reasons.join('; ') : r.reasons}]`
    ).join('\n');

    return `<s>[INST] You are a Senior SOC Lead conducting an expert post-incident analysis.

Log Analysis Summary:
- Total log entries analysed: ${total}
- Anomalies detected: ${anomalyCount} (${anomalyRate}% of traffic)

Top Anomalous Requests:
${topRows}

Reply STRICTLY in this format:
SUMMARY: <your 2-3 sentence executive summary>
RISK_LEVEL: <LOW|MEDIUM|HIGH|CRITICAL>
REMEDIATION:
1. <step one>
2. <step two>
3. <step three>
[/INST]`;
}

function parseHFResponse(text) {
    try {
        const cleaned          = text.replace(/\[INST\].*?\[\/INST\]/s, '').trim();
        const summaryMatch     = cleaned.match(/SUMMARY:\s*(.+?)(?=\nRISK_LEVEL:|$)/s);
        const riskMatch        = cleaned.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i);
        const remediationMatch = cleaned.match(/REMEDIATION:\s*([\s\S]+)/i);

        return {
            summary:      summaryMatch?.[1]?.trim()    ?? null,
            riskLevel:    riskMatch?.[1]?.toUpperCase() ?? null,
            remediations: remediationMatch?.[1]
                ?.split(/\n\s*\d+\.\s*/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
                ?? null,
            aiEnabled: true,
        };
    } catch {
        return null;
    }
}

async function tryHuggingFace(anomalies) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey || apiKey === 'your_hf_token_here') return null;

    try {
        const response = await fetch(HF_API_URL, {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs:     buildPrompt(anomalies),
                parameters: { max_new_tokens: 512, temperature: 0.3, return_full_text: false },
            }),
            signal: AbortSignal.timeout(45_000),
        });

        if (!response.ok) { console.warn(`HuggingFace API ${response.status}`); return null; }

        const json = await response.json();
        const text = Array.isArray(json) ? json[0]?.generated_text ?? '' : json.generated_text ?? '';
        if (!text) return null;

        const parsed = parseHFResponse(text);
        if (!parsed?.summary) return null;

        console.log('[WebGuard] LLM report generated via HuggingFace.');
        return parsed;
    } catch (err) {
        console.warn('[WebGuard] HuggingFace unavailable:', err.message);
        return null;
    }
}

// =============================================================================
//  MAIN EXPORT
// =============================================================================
/**
 * Generates an expert security report.
 * Tries HuggingFace first; falls back to the deterministic local engine.
 * NEVER returns null — always produces a full report.
 *
 * @param {Array} anomalies - full results array from the ML microservice
 * @returns {Promise<{summary, riskLevel, remediations, aiEnabled}>}
 */
export async function generateAIReport(anomalies) {
    // Try LLM first (no-op if key missing)
    const hfResult = await tryHuggingFace(anomalies);
    if (hfResult) return hfResult;

    // Always falls back to local expert engine
    console.log('[WebGuard] Using local expert analysis engine.');
    return localExpertAnalysis(anomalies);
}
