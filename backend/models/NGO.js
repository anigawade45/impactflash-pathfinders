const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ngoSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    impactScore: { type: Number, default: 0, min: 0, max: 100 },
    suspensionReason: { type: String },
    adminFeedback: { type: String },
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
        aadhaarVerified: { type: Boolean, default: false },
        pennyDropSuccessful: { type: Boolean, default: false },
        visionAuthentic: { type: Boolean, default: false },
        addressMatched: { type: Boolean, default: false }
    },
    lastReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

ngoSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

ngoSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('NGO', ngoSchema);
