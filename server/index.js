import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import reviewRoutes from './routes/reviews.js';
import reportRoutes from './routes/reports.js';
import analysisRoutes from './routes/analysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware — explicit CORS for Vite dev server
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
    res.send('WebGuard AI Backend is Running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analysis', analysisRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
