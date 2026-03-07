const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stories', impactController.getAllStories);
router.get('/stories/:id', impactController.getStoryById);

// Authenticated routes for Dashboards
router.get('/donor-stories', protect, impactController.getStoriesByDonor);
router.get('/ngo-stories', protect, authorize('ngo', 'admin'), impactController.getStoriesByNgo);
router.get('/ngo-stories/:ngoId', impactController.getStoriesByNgo);

module.exports = router;