import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

const users = [
    {
        email: 'contributor', // strictly matching the current frontend expectations where username is typed
        password_hash: 'contributor',
        role: 'Log Contributor'
    },
    {
        email: 'analyst',
        password_hash: 'analyst',
        role: 'Security Analyst'
    },
    {
        email: 'manager',
        password_hash: 'manager',
        role: 'Security Manager'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        await User.insertMany(users);
        console.log('🌱 Seeded users successfully');

        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
