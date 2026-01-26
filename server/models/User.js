import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String, // In a real app, this should be password_hash
        required: true
    },
    role: {
        type: String,
        enum: ['Security Analyst', 'Security Manager', 'Log Contributor'],
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', UserSchema);
