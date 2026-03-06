const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['ngo'], default: 'ngo' },
    ngoId: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    isFcraRegistered: { type: Boolean, default: false },
    fcraNumber: { type: String, unique: true, sparse: true },
    panCard: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    website: { type: String },
    workingAreas: [{ type: String }],
    registrationCertificate: { type: String, required: true },
    bankAccount: {
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        bankName: { type: String, required: true }
    },
    representative: {
        name: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'in_review', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    suspensionReason: { type: String },
    aiVerdict: { type: String },
    aiWhyHigh: { type: String },
    aiWhyNotHigher: { type: String },
    aiFraudStatus: { type: String },
    aiOneFlag: { type: String },
    aiSuggestion: { type: String },
    trustHistory: [
        {
            change: { type: Number },
            reason: { type: String },
            date: { type: Date, default: Date.now }
        }
    ],
    automatedChecks: {
        fcraVerified: { type: Boolean, default: false },
        panVerified: { type: Boolean, default: false },
        pennyDropSuccessful: { type: Boolean, default: false },
        visionAuthentic: { type: Boolean, default: false },
        addressMatched: { type: Boolean, default: false }
    },
    lastReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('NGO', ngoSchema);
