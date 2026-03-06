const Donation = require('../models/Donation');
const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const Donor = require('../models/Donor');
const NGO = require('../models/NGO');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

exports.suggestSplit = async (req, res) => {
    try {
        const donor = await Donor.findById(req.userId);
        if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

        const needs = await Need.find({ status: 'live' }).populate('ngoId', 'name');
        const campaigns = await Campaign.find({ status: 'live' }).populate('ngoId', 'name');

        let candidates = [...needs.map(n => ({ ...n._doc, type: 'Need' })), ...campaigns.map(c => ({ ...c._doc, type: 'Campaign' }))];

        if (donor.causes && donor.causes.length > 0) {
            candidates = candidates.filter(c => donor.causes.includes(c.category));
        }

        if (candidates.length === 0) {
            return res.status(200).json({ success: true, suggestion: [], message: 'No active causes found matching your interests.' });
        }

        // Call AI Engine for Optimal Split
        try {
            const aiResponse = await axios.post('http://localhost:8000/api/suggest-split', {
                amount: 1000, // Normalized for suggesting percentages
                candidates: candidates.slice(0, 5) // Send top 5 to AI
            });
            return res.status(200).json({ success: true, suggestion: aiResponse.data.splits });
        } catch (aiErr) {
            console.error('AI Suggestion Error:', aiErr.message);
            // Fallback to basic top 2
            const selected = candidates.slice(0, 2);
            const suggestion = selected.map((item, index) => ({
                targetId: item._id,
                targetType: item.type,
                title: item.title,
                ngoId: item.ngoId._id,
                ngoName: item.ngoId.name,
                percentage: index === 0 ? 60 : 40,
                reason: item.urgency === 'high' ? 'High urgency requirement' : `High impact AI Score (${item.aiScore})`
            }));
            return res.status(200).json({ success: true, suggestion });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.initiateDonation = async (req, res) => {
    try {
        const { items, totalAmount, visibility, panCard } = req.body;
        const donorId = req.userId;

        const donor = await Donor.findById(donorId);
        if (panCard && !donor.panCard) {
            donor.panCard = panCard;
            await donor.save();
        }

        // 1. Layer 3: Fraud Prevention
        for (const item of items) {
            // 1a. Self-dealing check
            const ngo = await NGO.findById(item.ngoId);
            if (ngo && donor.panCard && donor.panCard === ngo.panCard) {
                return res.status(403).json({ success: false, message: `Self-Dealing Alert: Your tax ID matches the NGO. Transaction blocked.` });
            }
        }

        // 1b. Identity-based conflict (Donor's explicit list)
        for (const item of items) {
            if (donor.conflicts && donor.conflicts.includes(item.ngoId)) {
                return res.status(403).json({ success: false, message: `Conflict detected: You are associated with this NGO.` });
            }
        }

        // 1c. Circular Ring Detection via AI engine
        try {
            // Get last 100 successful donations to build graph
            const recentDonations = await Donation.find({ paymentStatus: 'completed' }).limit(100);
            const transactions = recentDonations.map(d => ({
                donor_id: d.donorId.toString(),
                ngo_id: d.items[0].ngoId.toString(),
                amount: d.totalAmount
            }));
            // Add current proposed transaction
            transactions.push({ donor_id: donorId.toString(), ngo_id: items[0].ngoId.toString(), amount: totalAmount });

            const aiFraudRes = await axios.post('http://localhost:8000/api/fraud/ring-check', { transactions });
            if (!aiFraudRes.data.isSafe) {
                return res.status(403).json({
                    success: false,
                    message: `Fraud Flag: Suspicious circular donation pattern detected by AI network analysis.`
                });
            }
        } catch (aiErr) {
            console.error('AI Fraud Check failed, proceeding with manual safety checks:', aiErr.message);
        }

        // 2. Create Razorpay Order
        let rzpOrder;
        const amountInPaise = totalAmount * 100;

        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_mock_id') {
            // Mocking order for development without keys
            console.log('[MOCK] Creating mock Razorpay order...');
            rzpOrder = {
                id: 'order_mock_' + Date.now(),
                amount: amountInPaise
            };
        } else {
            const options = {
                amount: amountInPaise,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`
            };
            rzpOrder = await razorpay.orders.create(options);
        }

        // 3. Save pending donation
        const donation = new Donation({
            donorId,
            items,
            totalAmount,
            razorpayOrderId: rzpOrder.id,
            visibility,
            isSmartDonate: items.length > 1
        });

        await donation.save();

        res.status(201).json({
            success: true,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            donationId: donation._id
        });

    } catch (error) {
        console.error('Donation Initiation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified
            const donation = await Donation.findById(donationId);
            donation.paymentStatus = 'completed';
            donation.razorpayPaymentId = razorpay_payment_id;
            donation.razorpaySignature = razorpay_signature;
            donation.receiptGenerated = true; // 80G generation triggered
            await donation.save();

            res.status(200).json({
                success: true,
                message: "Payment verified and receipt generated.",
                receiptUrl: `/api/donations/receipt/${donationId}` // Mock URL
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donorId', 'name email address')
            .populate('items.ngoId', 'name address fcraNumber');

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation record not found' });
        }

        // Security: Ensure only the donor themselves can see the receipt
        if (donation.donorId._id.toString() !== req.userId && req.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (donation.paymentStatus !== 'completed') {
            return res.status(400).json({ success: false, message: 'Payment not completed yet' });
        }

        // Return structured data for receipt generation
        res.status(200).json({
            success: true,
            data: {
                receiptNumber: `80G-${donation._id.toString().substring(0, 8).toUpperCase()}`,
                donor: donation.donorId,
                items: donation.items,
                totalAmount: donation.totalAmount,
                date: donation.updatedAt,
                certificateType: '80G Tax Benefit'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.userId })
            .populate('items.ngoId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: donations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
