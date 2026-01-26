import mongoose from 'mongoose';

const AnomalyResultSchema = new mongoose.Schema({
    log_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log',
        required: true
    },
    anomaly_score: {
        type: Number, // 0-1 or scaled
        required: true
    },
    prediction: {
        type: String,
        enum: ['benign', 'suspicious', 'malicious'],
        required: true
    },
    generated_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AnomalyResult', AnomalyResultSchema);
