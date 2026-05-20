const express = require('express');
const router = express.Router();
const {
  getPlatforms,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  syncAll,
  getSyncLogs,
} = require('../controllers/platformController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPlatforms);
router.post('/connect', protect, connectPlatform);
router.delete('/:platform', protect, disconnectPlatform);
router.post('/sync/:platform', protect, syncPlatform);
router.post('/sync-all', protect, syncAll);
router.get('/sync-logs', protect, getSyncLogs);

module.exports = router;
