import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // In a real app, use password hashing comparison here
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password_hash !== password) { // Simple comparison for now
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user info (excluding password)
        res.json({
            user_id: user._id,
            email: user.email,
            role: user.role,
            name: user.email.split('@')[0] // Simple name derivation
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register Route
router.post('/register', async (req, res) => {
    const { email, password, role, name } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            email,
            password_hash: password, // In production, hash this!
            role
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user_id: newUser._id,
            email: newUser.email,
            role: newUser.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
