const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['EASY', 'MEDIUM', 'HARD'],
  },
  platform: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  solvedDate: {
    type: Date,
    default: Date.now,
  },
  revisionDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['SOLVED', 'NEEDS_REVISION'],
    default: 'SOLVED',
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
