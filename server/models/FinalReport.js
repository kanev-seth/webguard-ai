import mongoose from 'mongoose';

const FinalReportSchema = new mongoose.Schema({
    result_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnomalyResult',
        required: true
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    final_decision: {
        type: String,
        enum: ['Approved', 'Rejected', 'Escalate', 'False Positive', 'Confirmed Incident'],
        required: true
    },
    recommendation: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('FinalReport', FinalReportSchema);
