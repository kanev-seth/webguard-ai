import mongoose from 'mongoose';

/**
 * AIReport — persists the LLM-generated expert analysis so Managers
 * can view the intelligence summary without re-running the analysis.
 */
const AIReportSchema = new mongoose.Schema({
    filename: {
        type:     String,
        required: true,
    },
    summary: {
        type:    String,
        default: '',
    },
    riskLevel: {
        type:    String,
        enum:    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
    },
    remediations: {
        type:    [String],
        default: [],
    },
    rawAnomalyCount: {
        type:    Number,
        default: 0,
    },
    totalLines: {
        type:    Number,
        default: 0,
    },
    // Base64-encoded Expert CSV so Manager can re-download without re-processing
    expertCsvBase64: {
        type:    String,
        default: '',
    },
    createdAt: {
        type:    Date,
        default: Date.now,
    },
});

export default mongoose.model('AIReport', AIReportSchema);
