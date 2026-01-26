import express from 'express';
import AnalystReview from '../models/AnalystReview.js';
import AnomalyResult from '../models/AnomalyResult.js';

const router = express.Router();

// Submit a Review
router.post('/', async (req, res) => {
    const { result_id, analyst_id, notes } = req.body;

    const review = new AnalystReview({
        result_id,
        analyst_id,
        notes
    });

    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get Reviews for a specific Anomaly Result
router.get('/result/:resultId', async (req, res) => {
    try {
        const reviews = await AnalystReview.find({ result_id: req.params.resultId }).populate('analyst_id', 'email');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get anomalies (Mock endpoint to fetch anomalies to review)
router.get('/anomalies', async (req, res) => {
    try {
        const anomalies = await AnomalyResult.find().populate('log_id');
        res.json(anomalies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
