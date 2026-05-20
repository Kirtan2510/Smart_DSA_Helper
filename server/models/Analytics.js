const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  topicStats: {
    type: Map,
    of: {
      solved: { type: Number, default: 0 },
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    default: {}
  },
  difficultyStats: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },
  weeklyProgress: [{
    date: { type: Date },
    count: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
