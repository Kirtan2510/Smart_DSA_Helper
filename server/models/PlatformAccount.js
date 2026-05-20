const mongoose = require('mongoose');

const platformAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'codeforces', 'gfg'],
  },
  username: {
    type: String,
    required: true,
  },
  isConnected: {
    type: Boolean,
    default: true,
  },
  lastSyncAt: {
    type: Date,
    default: null,
  },
  syncStatus: {
    type: String,
    enum: ['idle', 'syncing', 'success', 'error'],
    default: 'idle',
  },
  syncError: {
    type: String,
    default: null,
  },
  // Cached platform stats
  stats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    rank: { type: String, default: '' },
    contestsAttended: { type: Number, default: 0 },
  },
  submissionCalendar: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, { timestamps: true });

// Ensure one platform per user
platformAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('PlatformAccount', platformAccountSchema);
