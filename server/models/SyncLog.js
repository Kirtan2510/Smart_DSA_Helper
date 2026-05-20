const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true,
  },
  questionsAdded: {
    type: Number,
    default: 0,
  },
  questionsUpdated: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  duration: {
    type: Number, // ms
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('SyncLog', syncLogSchema);
