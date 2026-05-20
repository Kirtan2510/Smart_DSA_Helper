const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getQuestions)
  .post(protect, addQuestion);

router.route('/:id')
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

module.exports = router;
