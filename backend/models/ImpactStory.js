const mongoose = require('mongoose');

const impactStorySchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Need or Campaign ID
    itemType: { type: String, enum: ['Need', 'Campaign'], required: true },
    title: { type: String, required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    summary: { type: String, required: true }, // e.g., "500 children vaccinated in Sangli"
    content: { type: String },
    photos: [{ type: String }],
    financialBreakdown: {
        totalRaised: { type: Number },
        totalSpent: { type: Number },
        adminFee: { type: Number, default: 0 }
    },
    beneficiaryCount: { type: Number },
    proofOfWork: { type: String }, // Final report URL
    donors: [{
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
        name: { type: String },
        isAnonymous: { type: Boolean, default: true }
    }],
    aiValidation: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('ImpactStory', impactStorySchema);