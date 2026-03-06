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
        const { amount } = req.body;
        const donationAmount = Math.max(100, amount || 1000); // Minimum ₹100

        const donor = await Donor.findById(req.userId);
        if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

        const needs = await Need.find({ status: 'live' }).populate('ngoId', 'name');
        const campaigns = await Campaign.find({ status: 'live' }).populate('ngoId', 'name');

        let rawCandidates = [...needs.map(n => ({ ...n._doc, type: 'Need' })), ...campaigns.map(c => ({ ...c._doc, type: 'Campaign' }))];

        // Filter by donor causes if available
        let filtered = rawCandidates;
        if (donor.causes && donor.causes.length > 0) {
            filtered = rawCandidates.filter(c => donor.causes.includes(c.category));
        }

        const candidates = (filtered.length > 0 ? filtered : rawCandidates)
            .sort((a, b) => b.aiScore - a.aiScore)
            .slice(0, 5)
            .map(c => ({
                _id: c._id,
                aiScore: c.aiScore,
                urgency: c.urgency,
                type: c.type,
                title: c.title,
                ngoId: c.ngoId._id,
                ngoName: c.ngoId.name,
                category: c.category,
                funding_gap: Math.max(0, (c.amount || c.targetAmount) - (c.fundsRaised || 0))
            }));

        if (candidates.length === 0) {
            return res.status(200).json({ success: true, suggestion: [], message: 'No active causes found.' });
        }

        // Call AI Engine for Optimal Split
        try {
            const aiResponse = await axios.post('http://localhost:8000/api/suggest-split', {
                amount: donationAmount,
                candidates: candidates,
                donor_causes: donor.causes || []
            });
            return res.status(200).json({ success: true, suggestion: aiResponse.data.splits });
        } catch (aiErr) {
            console.error('AI Suggestion Error:', aiErr.message);
            // Fallback (Simple Split)
            const suggestion = candidates.slice(0, 2).map((item, index) => {
                const amount = index === 0 ? donationAmount * 0.6 : donationAmount * 0.4;
                return {
                    targetId: item._id,
                    targetType: item.type,
                    title: item.title,
                    ngoId: item.ngoId,
                    ngoName: item.ngoName,
                    amount: Math.min(amount, item.funding_gap),
                    percentage: index === 0 ? 60 : 40,
                    reason: "High priority requirement matched to your profile."
                };
            });
            return res.status(200).json({ success: true, suggestion });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

exports.initiateDonation = async (req, res) => {
    try {
        const { items, totalAmount, visibility, panCard } = req.body;
        const donorId = req.userId;

        const donor = await Donor.findById(donorId);
        if (panCard && !donor.panCard) {
            donor.panCard = panCard;
            await donor.save();
        }

        // 1. Layer 3: Fraud Prevention (Self-Dealing Checks)
        for (const item of items) {
            const ngo = await NGO.findById(item.ngoId);
            if (!ngo) continue;

            // 1a. PAN match check
            if (donor.panCard && donor.panCard === ngo.panCard) {
                return res.status(403).json({ success: false, message: `Self-Dealing Alert: Your tax ID matches the NGO ${ngo.name}. Transaction blocked.` });
            }

            // 1b. Email match check
            if (donor.email.toLowerCase() === ngo.email.toLowerCase()) {
                return res.status(403).json({ success: false, message: `Self-Dealing Alert: Your email matches NGO ${ngo.name}. Identity conflict detected.` });
            }

            // 1c. Explicit conflict list check
            if (donor.conflicts && donor.conflicts.includes(item.ngoId)) {
                return res.status(403).json({ success: false, message: `Conflict detected: You are associated with NGO ${ngo.name}.` });
            }
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `Donation to ${item.title}`,
                        description: `Support for ${item.category}`,
                    },
                    unit_amount: item.amount * 100, // Stripe expects amount in paise (cents equivalent)
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor-dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore?canceled=true`,
            metadata: {
                donorId: donorId.toString(),
                visibility,
                items: JSON.stringify(items.map(i => ({
                    targetId: i.targetId,
                    targetType: i.targetType,
                    amount: i.amount,
                    ngoId: i.ngoId,
                    title: i.title,
                    category: i.category
                })))
            }
        });

        // 3. Save pending donation
        const donation = new Donation({
            donorId,
            items,
            totalAmount,
            stripeSessionId: session.id,
            visibility: visibility || donor.defaultVisibility || 'anonymous',
            isSmartDonate: items.length > 1
        });

        await donation.save();

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Donation Initiation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { session_id } = req.body;

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const donation = await Donation.findOne({ stripeSessionId: session_id });
            if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

            if (donation.paymentStatus !== 'completed') {
                donation.paymentStatus = 'completed';
                donation.stripePaymentIntentId = session.payment_intent;
                donation.receiptGenerated = true;
                await donation.save();

                // Trigger Escrow logic
                await updateEscrowAndFunds(donation);
            }

            res.status(200).json({
                success: true,
                message: "Payment verified successfully.",
                receiptUrl: `/api/donations/receipt/${donation._id}`
            });
        } else {
            res.status(400).json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Internal function to handle the 40-40-20 automatic escrow release logic
const updateEscrowAndFunds = async (donation) => {
    const Need = require('../models/Need');
    const Campaign = require('../models/Campaign');

    for (const item of donation.items) {
        const Model = item.targetType === 'Need' ? Need : Campaign;
        const project = await Model.findById(item.targetId);
        if (!project) continue;

        project.fundsRaised += item.amount;

        const targetAmount = project.amount || project.targetAmount;
        const progress = (project.fundsRaised / targetAmount) * 100;

        // Tranche 1: 40% Release at 40% reach
        if (progress >= 40 && !project.milestones.find(m => m.level === 1 && m.status === 'verified')) {
            let m1 = project.milestones.find(m => m.level === 1);
            if (!m1) {
                project.milestones.push({ level: 1, title: 'Initial Impact Funds (40%)', percentage: 40, status: 'verified', releasedAt: new Date() });
            } else {
                m1.status = 'verified';
                m1.releasedAt = new Date();
            }
        }

        // Tranche 2: 40% Release at 80% reach
        if (progress >= 80 && !project.milestones.find(m => m.level === 2 && m.status === 'verified')) {
            let m2 = project.milestones.find(m => m.level === 2);
            if (!m2) {
                project.milestones.push({ level: 2, title: 'Operational Funds (40%)', percentage: 40, status: 'verified', releasedAt: new Date() });
            } else {
                m2.status = 'verified';
                m2.releasedAt = new Date();
            }
        }

        // Final Completion Check
        if (progress >= 100 && project.status !== 'completed') {
            project.status = 'completed';
        }

        await project.save();
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const donation = await Donation.findOne({ stripeSessionId: session.id });

        if (donation && donation.paymentStatus !== 'completed') {
            donation.paymentStatus = 'completed';
            donation.stripePaymentIntentId = session.payment_intent;
            donation.receiptGenerated = true;
            await donation.save();
            await updateEscrowAndFunds(donation);
        }
    }

    res.json({ received: true });
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