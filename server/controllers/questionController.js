const Question = require('../models/Question');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

// @desc    Get all questions for logged in user
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { topic, difficulty, platform, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty.toUpperCase();
    if (platform) query.platform = platform;
    if (search) query.title = { $regex: search, $options: 'i' };

    const questions = await Question.find(query).sort({ solvedDate: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private
const addQuestion = async (req, res) => {
  try {
    const { title, topic, difficulty, platform, notes } = req.body;

    const question = await Question.create({
      userId: req.user._id,
      title,
      topic,
      difficulty: difficulty.toUpperCase(),
      platform,
      notes,
    });

    // Update Analytics
    let analytics = await Analytics.findOne({ userId: req.user._id });
    if (!analytics) {
       analytics = await Analytics.create({ userId: req.user._id });
    }

    // Update difficulty stats
    const diffLower = difficulty.toLowerCase();
    analytics.difficultyStats[diffLower] += 1;

    // Update topic stats
    let topicData = analytics.topicStats.get(topic) || { solved: 0, easy: 0, medium: 0, hard: 0 };
    topicData.solved += 1;
    topicData[diffLower] += 1;
    analytics.topicStats.set(topic, topicData);

    await analytics.save();
    
    // Update Streak (simplified logic)
    const user = await User.findById(req.user._id);
    const today = new Date().setHours(0,0,0,0);
    const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate).setHours(0,0,0,0) : null;
    
    if (lastSolved !== today) {
        if (lastSolved === today - 86400000) {
            user.streak += 1;
        } else {
            user.streak = 1;
        }
        user.lastSolvedDate = new Date();
        await user.save();
    }

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Optionally: Update analytics by decrementing counts (skipped for brevity)
    
    await question.deleteOne();
    res.json({ message: 'Question removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, addQuestion, updateQuestion, deleteQuestion };
