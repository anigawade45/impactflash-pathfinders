const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Initializing CORS with origin: http://localhost:5173');
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection (placeholder)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/impactflash';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const ngoRoutes = require('./routes/ngoRoutes');
const activityRoutes = require('./routes/activityRoutes');
const donorRoutes = require('./routes/donorRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const escrowRoutes = require('./routes/escrowRoutes');
const impactRoutes = require('./routes/impactRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Basic route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend' });
});

// API Routes
app.use('/api/ngos', ngoRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});