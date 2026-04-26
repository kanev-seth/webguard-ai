/**
 * aiReporting.js — Hugging Face LLM integration for WebGuard AI
 *
 * Exports generateAIReport(anomalies) which sends structured anomaly data
 * to a Hugging Face Inference API model and returns a parsed expert report.
 *
 * Falls back gracefully (returns null) if the API key is missing or the call fails.
 */

const HF_API_URL =
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(anomalies) {
    const anomalyOnly = anomalies.filter((r) => r.is_anomaly);
    const total       = anomalies.length;
    const anomalyCount = anomalyOnly.length;
    const anomalyRate  = ((anomalyCount / total) * 100).toFixed(1);

    // Compact summary rows (avoid blowing up the context window)
    const topRows = anomalyOnly.slice(0, 20).map((r, i) =>
        `${i + 1}. IP=${r.ip} URL=${r.url} Status=${r.status} Score=${Number(r.anomaly_score).toFixed(4)} Reasons=[${Array.isArray(r.reasons) ? r.reasons.join('; ') : r.reasons}]`
    ).join('\n');

    return `<s>[INST] You are a Senior SOC (Security Operations Center) Lead conducting an expert post-incident analysis.

Log Analysis Summary:
- Total log entries analysed: ${total}
- Anomalies detected: ${anomalyCount} (${anomalyRate}% of traffic)

Top Anomalous Requests:
${topRows}

Your task:
1. Write a concise EXECUTIVE SUMMARY (2-3 sentences) describing the overall threat posture.
2. Assign an overall RISK LEVEL: one of [LOW, MEDIUM, HIGH, CRITICAL].
3. List exactly 3 REMEDIATION STEPS as numbered action items.

Reply STRICTLY in this format (no extra text):
SUMMARY: <your summary here>
RISK_LEVEL: <LOW|MEDIUM|HIGH|CRITICAL>
REMEDIATION:
1. <step one>
2. <step two>
3. <step three>
[/INST]`;
}

// ── Response parser ───────────────────────────────────────────────────────────
function parseResponse(text) {
    try {
        // Strip the prompt echo if the model repeats it
        const cleaned = text.replace(/\[INST\].*?\[\/INST\]/s, '').trim();

        const summaryMatch     = cleaned.match(/SUMMARY:\s*(.+?)(?=\nRISK_LEVEL:|$)/s);
        const riskMatch        = cleaned.match(/RISK_LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i);
        const remediationMatch = cleaned.match(/REMEDIATION:\s*([\s\S]+)/i);

        const summary      = summaryMatch?.[1]?.trim()    ?? 'Analysis complete. Review anomaly data for details.';
        const riskLevel    = riskMatch?.[1]?.toUpperCase() ?? 'MEDIUM';
        const remediations = remediationMatch?.[1]
            ?.split(/\n\s*\d+\.\s*/)
            .map(s => s.trim())
            .filter(Boolean)
            .slice(0, 3)
            ?? ['Review flagged IPs and enforce firewall rules.', 'Audit authentication endpoints for credential stuffing.', 'Enable rate limiting on high-volume paths.'];

        return { summary, riskLevel, remediations };
    } catch {
        return {
            summary:      'Automated analysis complete. Manual review of flagged anomalies is recommended.',
            riskLevel:    'MEDIUM',
            remediations: [
                'Block flagged IPs at the edge firewall.',
                'Enable rate limiting on the authentication endpoint.',
                'Rotate API keys and credentials on affected services.',
            ],
        };
    }
}

// ── Main exported function ────────────────────────────────────────────────────
/**
 * @param {Array} anomalies - Full array of result objects from the ML microservice
 * @returns {Promise<{summary: string, riskLevel: string, remediations: string[]} | null>}
 */
export async function generateAIReport(anomalies) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey || apiKey === 'your_hf_token_here') {
        console.warn('⚠️  HUGGINGFACE_API_KEY not set — skipping LLM enrichment.');
        return null;
    }

    const prompt = buildPrompt(anomalies);

    let response;
    try {
        response = await fetch(HF_API_URL, {
            method:  'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type':  'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens:  512,
                    temperature:     0.3,
                    return_full_text: false,
                },
            }),
            // 45-second timeout — free-tier models can be slow
            signal: AbortSignal.timeout(45_000),
        });
    } catch (err) {
        console.error('❌ HuggingFace API network error:', err.message);
        return null;
    }

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(`❌ HuggingFace API returned ${response.status}:`, body.slice(0, 200));
        return null;
    }

    let json;
    try {
        json = await response.json();
    } catch {
        console.error('❌ Failed to parse HuggingFace API response as JSON.');
        return null;
    }

    // The Inference API wraps output in an array
    const generatedText =
        Array.isArray(json) ? json[0]?.generated_text ?? ''
                            : json.generated_text     ?? '';

    if (!generatedText) {
        console.error('❌ HuggingFace returned empty generated_text.');
        return null;
    }

    console.log('✅ LLM report generated successfully.');
    return parseResponse(generatedText);
}
