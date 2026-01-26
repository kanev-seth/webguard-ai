import mongoose from 'mongoose';

const LogEntrySchema = new mongoose.Schema({
    log_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log',
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    source_ip: {
        type: String,
        required: true
    },
    dest_ip: {
        type: String,
        required: true
    },
    protocol: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    bytes_transferred: {
        type: Number,
        required: true
    }
});

export default mongoose.model('LogEntry', LogEntrySchema);
