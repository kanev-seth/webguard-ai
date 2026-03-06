import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';

const router = express.Router();

// Use memory storage — no temp files written to disk
const upload = multer({ storage: multer.memoryStorage() });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Convert an array of result objects → CSV string
// ─────────────────────────────────────────────────────────────────────────────
function toCSV(results) {
    const headers = ['IP', 'Timestamp', 'Method', 'URL', 'Status', 'Bytes', 'Is_Anomaly', 'Anomaly_Score', 'Reasons'];
    const escape = (v) => {
        const s = String(v ?? '');
        // Wrap in quotes if it contains comma, quote, or newline
        return s.includes(',') || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
    };

    const rows = results.map((r) => [
        r.ip,
        r.timestamp,
        r.method,
        r.url,
        r.status,
        r.bytes,
        r.is_anomaly,
        r.anomaly_score,
        Array.isArray(r.reasons) ? r.reasons.join(' | ') : (r.reasons ?? ''),
    ].map(escape).join(','));

    return [headers.join(','), ...rows].join('\r\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analysis/process
// Accepts: multipart/form-data with a "logfile" field
// Returns: CSV attachment
// ─────────────────────────────────────────────────────────────────────────────
router.post('/process', upload.single('logfile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No log file uploaded. Send a multipart field named "logfile".' });
    }

    // Explicitly decode buffer as UTF-8, then split on both Windows (\r\n)
    // and Unix (\n) line endings.  Strip any residual \r per line, then drop blanks.
    const rawText = req.file.buffer.toString('utf-8');
    const logs = rawText
        .split(/\r?\n/)
        .map((l) => l.replace(/\r$/, '').trim())
        .filter((l) => l.length > 0);

    if (logs.length === 0) {
        return res.status(400).json({ error: 'Uploaded file contains no log lines.' });
    }

    // ── Forward to Python microservice ────────────────────────────────────────
    // Build the payload explicitly so we always send {"logs": ["line1", ...]}
    const payload = JSON.stringify({ logs: Array.from(logs) });

    let pyResponse;
    try {
        pyResponse = await fetch('http://localhost:5001/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
        });
    } catch (networkErr) {
        console.error('❌ Could not reach Python microservice:', networkErr.message);
        return res.status(503).json({
            error: 'ML microservice is unreachable. Make sure the Python service is running on port 5001.',
        });
    }

    if (!pyResponse.ok) {
        const errBody = await pyResponse.text();
        console.error('❌ Python microservice error:', errBody);
        return res.status(502).json({ error: 'ML service returned an error.', detail: errBody });
    }

    const pyData = await pyResponse.json();
    const results = pyData.results ?? [];

    if (results.length === 0) {
        return res.status(422).json({
            error: 'No parseable log lines found. Ensure the file uses Apache/Nginx Combined Log Format.',
        });
    }

    // ── Convert to CSV and send ───────────────────────────────────────────────
    const csv = toCSV(results);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="analysis_results.csv"');
    res.setHeader('X-Total-Lines',   String(pyData.total ?? results.length));
    res.setHeader('X-Total-Anomalies', String(pyData.anomalies ?? 0));
    res.send(csv);
});

export default router;
