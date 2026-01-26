import express from 'express';
import Log from '../models/Log.js';
import LogEntry from '../models/LogEntry.js';

const router = express.Router();

// Get all logs (for Analyst/Manager)
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find().populate('uploaded_by', 'email');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload Log Metadata (Mock Upload)
router.post('/', async (req, res) => {
    const { uploaded_by, log_type, source } = req.body;

    const log = new Log({
        uploaded_by,
        log_type,
        source
    });

    try {
        const newLog = await log.save();
        res.status(201).json(newLog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get recent logs by user (Contributor View) 
router.get('/user/:userId', async (req, res) => {
    try {
        const logs = await Log.find({ uploaded_by: req.params.userId }).sort({ uploaded_at: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
