const express = require('express');
const router = express.Router();
const {
  getBehaviorAnalysis,
  getRecommendedPlaylists,
  getPlaylistVideos,
  searchPlaylists,
  getTopicVideos,
  getLearningResources,
} = require('../controllers/learnController');
const { protect } = require('../middleware/auth');

router.get('/behavior', protect, getBehaviorAnalysis);
router.get('/playlists', protect, getRecommendedPlaylists);
router.get('/playlist/:playlistId/videos', protect, getPlaylistVideos);
router.get('/search', protect, searchPlaylists);
router.get('/videos/:topic', protect, getTopicVideos);
router.get('/resources', protect, getLearningResources);

module.exports = router;
