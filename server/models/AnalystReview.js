import mongoose from 'mongoose';

const AnalystReviewSchema = new mongoose.Schema({
    result_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnomalyResult',
        required: true
    },
    analyst_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    reviewed_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AnalystReview', AnalystReviewSchema);
