import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { generateAIReport } from '../services/aiReporting.js';
import AIReport from '../models/AIReport.js';

const router = express.Router();

// Use memory storage — no temp files written to disk
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Convert an array of result objects → CSV string (base columns)
// ─────────────────────────────────────────────────────────────────────────────
function toCSV(results) {
    const headers = ['IP', 'Timestamp', 'Method', 'URL', 'Status', 'Bytes', 'Is_Anomaly', 'Anomaly_Score', 'Reasons'];
    const escape = (v) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    };
    const rows = results.map((r) => [
        r.ip, r.timestamp, r.method, r.url,
        r.status, r.bytes, r.is_anomaly, r.anomaly_score,
        Array.isArray(r.reasons) ? r.reasons.join(' | ') : (r.reasons ?? ''),
    ].map(escape).join(','));
    return [headers.join(','), ...rows].join('\r\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build an Expert CSV that merges raw data with LLM commentary
// ─────────────────────────────────────────────────────────────────────────────
function toExpertCSV(results, aiReport) {
    const headers = [
        'IP', 'Timestamp', 'Method', 'URL', 'Status', 'Bytes',
        'Is_Anomaly', 'Anomaly_Score', 'Reasons',
        'Expert_Commentary', 'Remediation_Steps', 'Risk_Level',
    ];
    const escape = (v) => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    };

    const riskLevel      = aiReport?.riskLevel    ?? 'UNKNOWN';
    const remediationStr = aiReport?.remediations?.join(' | ') ?? '';

    const rows = results.map((r) => {
        // Attach the AI commentary only to anomalous rows
        const commentary = r.is_anomaly
            ? (aiReport?.summary ?? 'No AI commentary — set HUGGINGFACE_API_KEY in .env')
            : 'Benign traffic — no expert commentary required';
        return [
            r.ip, r.timestamp, r.method, r.url,
            r.status, r.bytes, r.is_anomaly, r.anomaly_score,
            Array.isArray(r.reasons) ? r.reasons.join(' | ') : (r.reasons ?? ''),
            commentary,
            r.is_anomaly ? remediationStr : '',
            r.is_anomaly ? riskLevel : 'N/A',
        ].map(escape).join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared: parse multipart upload, forward to Python ML service, get results
// ─────────────────────────────────────────────────────────────────────────────
async function processLogFile(req, res) {
    if (!req.file) {
        res.status(400).json({ error: 'No log file uploaded. Send a multipart field named "logfile".' });
        return null;
    }

    const rawText = req.file.buffer.toString('utf-8');
    const logs = rawText
        .split(/\r?\n/)
        .map((l) => l.replace(/\r$/, '').trim())
        .filter((l) => l.length > 0);

    if (logs.length === 0) {
        res.status(400).json({ error: 'Uploaded file contains no log lines.' });
        return null;
    }

    // ── Forward to Python microservice ────────────────────────────────────────
    const payload = JSON.stringify({ logs: Array.from(logs) });

    let pyResponse;
    try {
        pyResponse = await fetch('http://localhost:5001/analyze', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    payload,
        });
    } catch (networkErr) {
        console.error('❌ Could not reach Python microservice:', networkErr.message);
        res.status(503).json({
            error: 'ML microservice is unreachable. Make sure the Python service is running on port 5001.',
        });
        return null;
    }

    if (!pyResponse.ok) {
        const errBody = await pyResponse.text();
        console.error('❌ Python microservice error:', errBody);
        res.status(502).json({ error: 'ML service returned an error.', detail: errBody });
        return null;
    }

    const pyData  = await pyResponse.json();
    const results = pyData.results ?? [];

    if (results.length === 0) {
        res.status(422).json({
            error: 'No parseable log lines found. Ensure the file uses Apache/Nginx Combined Log Format.',
        });
        return null;
    }

    return { results, pyData };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analysis/process  (original — raw CSV, no AI)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/process', upload.single('logfile'), async (req, res) => {
    const outcome = await processLogFile(req, res);
    if (!outcome) return; // already responded with an error

    const { results, pyData } = outcome;
    const csv = toCSV(results);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="analysis_results.csv"');
    res.setHeader('X-Total-Lines',    String(pyData.total   ?? results.length));
    res.setHeader('X-Total-Anomalies', String(pyData.anomalies ?? 0));
    res.send(csv);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analysis/process-ai  (AI-augmented — Expert_Security_Report.csv)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/process-ai', upload.single('logfile'), async (req, res) => {
    const outcome = await processLogFile(req, res, true);
    if (!outcome) return;

    const { results, pyData } = outcome;
    const filename = req.file?.originalname ?? 'unknown.log';

    // ── Call the LLM (may return null if key absent or API fails) ──────────────
    let aiReport = null;
    try {
        aiReport = await generateAIReport(results);
    } catch (err) {
        console.error('❌ AI report generation error:', err.message);
    }

    // ── Build Expert CSV ───────────────────────────────────────────────────────
    const expertCsv = toExpertCSV(results, aiReport);

    // ── Persist to MongoDB ─────────────────────────────────────────────────────
    let savedReport = null;
    try {
        const anomalyCount = results.filter((r) => r.is_anomaly).length;
        savedReport = await AIReport.create({
            filename,
            summary:         aiReport?.summary      ?? 'AI analysis unavailable — set HUGGINGFACE_API_KEY.',
            riskLevel:       aiReport?.riskLevel     ?? 'MEDIUM',
            remediations:    aiReport?.remediations  ?? [],
            rawAnomalyCount: anomalyCount,
            totalLines:      results.length,
            expertCsvBase64: Buffer.from(expertCsv).toString('base64'),
        });
        console.log('✅ AIReport saved to MongoDB:', savedReport._id);
    } catch (dbErr) {
        console.error('⚠️  Could not save AIReport to MongoDB:', dbErr.message);
    }

    // ── Send Enhanced CSV ──────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Expert_Security_Report.csv"');
    res.setHeader('X-Total-Lines',     String(pyData.total    ?? results.length));
    res.setHeader('X-Total-Anomalies', String(pyData.anomalies ?? 0));
    res.setHeader('X-AI-Enabled',      aiReport ? 'true' : 'false');
    if (savedReport) {
        res.setHeader('X-AI-Report-Id', String(savedReport._id));
    }
    res.send(expertCsv);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analysis/generate-ai-report
// Accepts: JSON body { results: [...], filename: "name.log" }
// Returns: JSON { summary, riskLevel, remediations, anomalyCount, totalLines,
//                 aiEnabled, reportId, generatedAt }
// Expert CSV is saved to MongoDB; downloadable via /ai-reports/:id/download
// ─────────────────────────────────────────────────────────────────────────────
router.post('/generate-ai-report', async (req, res) => {
    const { results, filename = 'analysis.log' } = req.body ?? {};

    if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ error: 'Request body must contain a non-empty "results" array.' });
    }

    const anomalyCount = results.filter((r) => r.is_anomaly).length;

    // Only call LLM when there are actual anomalies to analyse
    let aiReport = null;
    if (anomalyCount > 0) {
        try {
            aiReport = await generateAIReport(results);
        } catch (err) {
            console.error('❌ AI report generation error:', err.message);
        }
    }

    // Graceful fallbacks
    const summary = aiReport?.summary
        ?? (anomalyCount === 0
            ? 'Analysis complete. No anomalous traffic was detected in this log sample. All requests fall within normal operational parameters. Continue routine monitoring and schedule the next audit within 7 days.'
            : 'AI analysis unavailable. Please set HUGGINGFACE_API_KEY in your .env file to enable LLM-powered expert commentary.');

    const riskLevel    = aiReport?.riskLevel ?? (anomalyCount === 0 ? 'LOW' : 'MEDIUM');
    const remediations = aiReport?.remediations ?? (anomalyCount === 0
        ? ['Maintain current monitoring cadence.', 'Schedule next full log audit within 7 days.', 'Verify firewall rules are current and comprehensive.']
        : ['Review flagged source IPs at the edge firewall.', 'Enable rate limiting on authentication endpoints.', 'Rotate API credentials on any affected services.']);

    // Build Expert CSV with UTF-8 BOM (fixes Excel encoding for special chars)
    const expertCsv = '\uFEFF' + toExpertCSV(results, { summary, riskLevel, remediations });

    // Persist to MongoDB
    let savedReport = null;
    try {
        savedReport = await AIReport.create({
            filename,
            summary,
            riskLevel,
            remediations,
            rawAnomalyCount: anomalyCount,
            totalLines:      results.length,
            expertCsvBase64: Buffer.from(expertCsv).toString('base64'),
        });
        console.log('✅ AIReport saved to MongoDB:', savedReport._id);
    } catch (dbErr) {
        console.error('⚠️  Could not save AIReport to MongoDB:', dbErr.message);
    }

    // Return JSON — frontend renders the briefing panel
    res.json({
        summary,
        riskLevel,
        remediations,
        anomalyCount,
        totalLines:  results.length,
        aiEnabled:   !!aiReport,
        reportId:    savedReport?._id?.toString() ?? null,
        filename,
        generatedAt: new Date().toISOString(),
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analysis/ai-reports  — Manager view: list all stored AI reports
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ai-reports', async (_req, res) => {
    try {
        // Exclude the heavy base64 field from the list view
        const reports = await AIReport.find({}, '-expertCsvBase64')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(reports);
    } catch (err) {
        console.error('❌ Failed to fetch AI reports:', err.message);
        res.status(500).json({ error: 'Failed to retrieve AI reports.' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analysis/ai-reports/:id/download  — re-download stored Expert CSV
// ─────────────────────────────────────────────────────────────────────────────
router.get('/ai-reports/:id/download', async (req, res) => {
    try {
        const report = await AIReport.findById(req.params.id, 'filename expertCsvBase64');
        if (!report) return res.status(404).json({ error: 'Report not found.' });

        const csvBuffer = Buffer.from(report.expertCsvBase64, 'base64');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="Expert_Security_Report_${report._id}.csv"`);
        res.send(csvBuffer);
    } catch (err) {
        console.error('❌ Failed to download report:', err.message);
        res.status(500).json({ error: 'Failed to download report.' });
    }
});

export default router;
