const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/activity/need
router.post('/need', protect, authorize('ngo'), activityController.submitNeed);

// POST /api/activity/campaign
router.post('/campaign', protect, authorize('ngo'), activityController.createCampaign);

// GET /api/activity/my-activities
router.get('/my-activities', protect, authorize('ngo'), activityController.getMyActivities);

// GET /api/activity/pending (Admin)
router.get('/pending', protect, authorize('admin'), activityController.getPendingReviews);

// PATCH /api/activity/review/:id (Admin)
router.patch('/review/:id', protect, authorize('admin'), activityController.reviewItem);

// GET /api/activity/needs/live
router.get('/needs/live', activityController.getLiveNeeds);

// GET /api/activity/campaigns/live
router.get('/campaigns/live', activityController.getLiveCampaigns);

module.exports = router;
