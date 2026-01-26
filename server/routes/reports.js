import express from 'express';
import FinalReport from '../models/FinalReport.js';

const router = express.Router();

// Create Final Report
router.post('/', async (req, res) => {
    const { result_id, manager_id, final_decision, recommendation } = req.body;

    const report = new FinalReport({
        result_id,
        manager_id,
        final_decision,
        recommendation
    });

    try {
        const newReport = await report.save();
        res.status(201).json(newReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get All Reports (History)
router.get('/', async (req, res) => {
    try {
        const reports = await FinalReport.find()
            .populate('manager_id', 'email')
            .populate({
                path: 'result_id',
                populate: { path: 'log_id' }
            })
            .sort({ created_at: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
