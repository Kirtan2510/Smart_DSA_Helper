const express = require('express');
const router = express.Router();
const { getWeakTopics, getRecommendations, getRoadmap } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/weak-topics', protect, getWeakTopics);
router.get('/recommendations', protect, getRecommendations);
router.get('/roadmap', protect, getRoadmap);

module.exports = router;
