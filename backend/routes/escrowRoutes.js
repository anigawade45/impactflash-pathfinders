const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');
const { protect, authorize } = require('../middleware/authMiddleware');

// NGO Routes
router.post('/submit-proof', protect, authorize('ngo'), escrowController.submitMilestoneProof);

// Admin Routes
router.post('/verify', protect, authorize('admin'), escrowController.verifyMilestone);
router.post('/freeze', protect, authorize('admin'), escrowController.freezeEscrow);
router.post('/refund', protect, authorize('admin'), escrowController.processRefunds);
router.post('/check-overdue', protect, authorize('admin'), escrowController.checkOverdueMilestones);

module.exports = router;
