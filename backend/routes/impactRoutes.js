const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

router.get('/stories', impactController.getAllStories);
router.get('/stories/:id', impactController.getStoryById);

module.exports = router;
