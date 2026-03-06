const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

const { protect } = require('../middleware/authMiddleware');

router.post('/suggest', protect, donationController.suggestSplit);
router.get('/my-donations', protect, donationController.getMyDonations);
router.post('/initiate', protect, donationController.initiateDonation);
router.post('/verify', protect, donationController.verifyPayment);
router.get('/receipt/:id', protect, donationController.getReceipt);

module.exports = router;