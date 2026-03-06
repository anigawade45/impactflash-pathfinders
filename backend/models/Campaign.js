const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    story: { type: String, required: true },
    emotionalAppeal: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    photos: [{ type: String }],
    aiScore: { type: Number, default: 0 },
    fraudFlag: { type: Boolean, default: false },
    explanation: { type: String },
    aiVerdict: { type: String },
    aiWhyHigh: { type: String },
    aiWhyNotHigher: { type: String },
    aiFraudStatus: { type: String },
    aiOneFlag: { type: String },
    aiSuggestion: { type: String },
    isSpotCheck: { type: Boolean, default: false }, // Layer 4: 5% random check
    lastReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvals: [
        {
            adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
            date: { type: Date, default: Date.now }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'live', 'in_review', 'rejected', 'completed'],
        default: 'pending'
    },
    fundsRaised: { type: Number, default: 0 },
    fundStatus: {
        type: String,
        enum: ['active', 'locked', 'frozen', 'refunded'],
        default: 'active'
    },
    milestones: [
        {
            level: { type: Number, enum: [1, 2, 3] }, // 1: 40%, 2: 40%, 3: 20%
            title: { type: String },
            description: { type: String },
            percentage: { type: Number },
            status: { type: String, enum: ['pending', 'submitted', 'verified', 'rejected'], default: 'pending' },
            proof: { type: String },
            outcomeReport: { type: String },
            adminFeedback: { type: String },
            releasedAt: { type: Date }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
