import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    log_type: {
        type: String,
        enum: ['server', 'application', 'firewall', 'IDS'],
        required: true
    },
    source: {
        type: String, // Filename or system identifier
        required: true
    },
    uploaded_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Log', LogSchema);
