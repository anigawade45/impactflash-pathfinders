const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    items: [{
        targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
        targetType: { type: String, enum: ['Need', 'Campaign'], required: true },
        title: { type: String },
        category: { type: String },
        amount: { type: Number, required: true },
        ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true }
    }],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
<<<<<<< HEAD
=======
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
>>>>>>> af802fe1bd5d81bc50fa91971fdf151ee33a15dd
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    visibility: {
        type: String,
        enum: ['public', 'anonymous', 'ngo_only'],
        default: 'anonymous'
    },
    isSmartDonate: { type: Boolean, default: false },
    receiptGenerated: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
