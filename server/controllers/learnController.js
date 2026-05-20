const Question = require('../models/Question');
const Analytics = require('../models/Analytics');
const youtubeService = require('../services/youtubeService');
const learningResources = require('../services/learningResourcesService');

// ========================================
// @desc    Get behavior analysis — deep dive into user's solving patterns
// @route   GET /api/learn/behavior
// @access  Private
// ========================================
const getBehaviorAnalysis = async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user._id }).sort({ solvedDate: -1 });
    const now = new Date();

    if (questions.length < 5) {
      return res.json({
        behavior: null,
        message: 'Solve at least 5 problems to get behavior analysis.',
        suggestions: ['Connect your coding platforms and sync to get started!'],
      });
    }

    // === 1. SOLVING PATTERN ANALYSIS ===
    const dailyCounts = {};
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0); // 0=Sunday
    const monthlyTrend = {};

    questions.forEach(q => {
      const d = new Date(q.solvedDate);
      const dateKey = d.toISOString().split('T')[0];
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      hourCounts[d.getHours()]++;
      dayCounts[d.getDay()]++;

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    // Peak solving hour
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHourFormatted = peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`;

    // Peak solving day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))];

    // === 2. CONSISTENCY SCORE ===
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last30Days.push(dailyCounts[key] || 0);
    }
    const activeDays = last30Days.filter(c => c > 0).length;
    const consistencyScore = Math.round((activeDays / 30) * 100);

    // === 3. DIFFICULTY PROGRESSION ANALYSIS ===
    const recentQuestions = questions.slice(0, 30); // most recent
    const olderQuestions = questions.slice(Math.max(0, questions.length - 30)); // oldest
    const recentDiffAvg = recentQuestions.reduce((s, q) => s + (q.difficulty === 'EASY' ? 1 : q.difficulty === 'MEDIUM' ? 2 : 3), 0) / recentQuestions.length;
    const olderDiffAvg = olderQuestions.reduce((s, q) => s + (q.difficulty === 'EASY' ? 1 : q.difficulty === 'MEDIUM' ? 2 : 3), 0) / olderQuestions.length;
    const difficultyTrend = recentDiffAvg > olderDiffAvg ? 'improving' : recentDiffAvg < olderDiffAvg ? 'declining' : 'stable';

    // === 4. TOPIC DIVERSITY ===
    const topicCounts = {};
    questions.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });
    const topicDiversity = Object.keys(topicCounts).length;
    const dominantTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
    const neglectedTopics = ['Array', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking']
      .filter(t => !topicCounts[t] || topicCounts[t] < 3);

    // === 5. SOLVING VELOCITY ===
    const last7DaysCount = last30Days.slice(0, 7).reduce((a, b) => a + b, 0);
    const prev7DaysCount = last30Days.slice(7, 14).reduce((a, b) => a + b, 0);
    const velocityTrend = last7DaysCount > prev7DaysCount ? 'accelerating' : last7DaysCount < prev7DaysCount ? 'slowing' : 'steady';
    const avgDailyRate = (last7DaysCount / 7).toFixed(1);

    // === 6. PLATFORM DISTRIBUTION ===
    const platformCounts = {};
    questions.forEach(q => {
      const p = q.platform || 'Manual';
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    });

    // === 7. SOLVING STREAKS ===
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = Object.keys(dailyCounts).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        currentStreak = diff <= 1 ? currentStreak + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    // === 8. GENERATE BEHAVIORAL INSIGHTS (AI-style) ===
    const insights = [];

    // Consistency insight
    if (consistencyScore >= 70) {
      insights.push({ type: 'strength', icon: '🔥', title: 'Highly Consistent', message: `You solved problems on ${activeDays}/30 days. Outstanding discipline!` });
    } else if (consistencyScore >= 40) {
      insights.push({ type: 'improve', icon: '📈', title: 'Build More Consistency', message: `Active only ${activeDays}/30 days. Try to solve at least 1 problem daily.` });
    } else {
      insights.push({ type: 'warning', icon: '⚠️', title: 'Irregular Practice', message: `Only ${activeDays} active days in last month. Consistency is key to mastering DSA.` });
    }

    // Difficulty insight
    if (difficultyTrend === 'improving') {
      insights.push({ type: 'strength', icon: '⬆️', title: 'Difficulty Level Increasing', message: 'You\'re progressively tackling harder problems. Great growth mindset!' });
    } else if (difficultyTrend === 'declining') {
      insights.push({ type: 'warning', icon: '⬇️', title: 'Staying in Comfort Zone', message: 'You\'re solving easier problems lately. Push yourself with harder challenges!' });
    }

    // Topic diversity insight
    if (topicDiversity >= 7) {
      insights.push({ type: 'strength', icon: '🌐', title: 'Well-Rounded Practice', message: `Covering ${topicDiversity} different topics. Excellent breadth!` });
    } else if (topicDiversity <= 3) {
      insights.push({ type: 'warning', icon: '🎯', title: 'Too Narrow Focus', message: `Only practicing ${topicDiversity} topics. Branch out to ${neglectedTopics.slice(0, 3).join(', ')} for better interview prep.` });
    }

    // Peak time insight
    insights.push({ type: 'info', icon: '⏰', title: 'Peak Productivity', message: `You solve most problems at ${peakHourFormatted} on ${peakDay}s. Schedule your practice around this time!` });

    // Velocity insight
    if (velocityTrend === 'accelerating') {
      insights.push({ type: 'strength', icon: '🚀', title: 'Momentum Building', message: `${last7DaysCount} problems this week vs ${prev7DaysCount} last week. You're picking up speed!` });
    } else if (velocityTrend === 'slowing') {
      insights.push({ type: 'improve', icon: '🐢', title: 'Pace Slowing Down', message: `${last7DaysCount} problems this week vs ${prev7DaysCount} last week. Try to maintain your previous pace.` });
    }

    // Neglected topics
    if (neglectedTopics.length > 0) {
      insights.push({ type: 'improve', icon: '📚', title: 'Topics to Explore', message: `You haven't practiced enough: ${neglectedTopics.slice(0, 4).join(', ')}. These are crucial for interviews!` });
    }

    res.json({
      behavior: {
        totalSolved: questions.length,
        activeDaysLast30: activeDays,
        consistencyScore,
        avgDailyRate: parseFloat(avgDailyRate),
        peakHour: peakHourFormatted,
        peakDay,
        maxStreak,
        difficultyTrend,
        velocityTrend,
        topicDiversity,
        dominantTopic: dominantTopic ? { name: dominantTopic[0], count: dominantTopic[1] } : null,
        neglectedTopics: neglectedTopics.slice(0, 5),
        platformDistribution: platformCounts,
        hourlyDistribution: hourCounts,
        weekdayDistribution: dayCounts.map((c, i) => ({ day: dayNames[i], count: c })),
        monthlyTrend: Object.entries(monthlyTrend).sort().map(([month, count]) => ({ month, count })),
      },
      insights,
    });
  } catch (error) {
    console.error('Behavior analysis error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get recommended YouTube playlists based on user's weak topics
// @route   GET /api/learn/playlists
// @access  Private
// ========================================
const getRecommendedPlaylists = async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user._id });

    // Build topic stats
    const topicCounts = {};
    questions.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });

    // Find weak topics (least practiced)
    const allTopics = ['Array', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking'];
    const sortedTopics = allTopics.sort((a, b) => (topicCounts[a] || 0) - (topicCounts[b] || 0));
    const weakTopics = sortedTopics.slice(0, 4);

    // Calculate skill level
    const totalScore = questions.reduce((s, q) => s + (q.difficulty === 'EASY' ? 1 : q.difficulty === 'MEDIUM' ? 3 : 6), 0);
    const skillLevel = totalScore >= 1000 ? 'Master' : totalScore >= 600 ? 'Expert' : totalScore >= 300 ? 'Advanced' : totalScore >= 100 ? 'Intermediate' : 'Beginner';

    const apiKey = process.env.YOUTUBE_API_KEY || '';

    // Get recommended playlists enriched with real YouTube thumbnails
    const recommended = await youtubeService.getRecommendedPlaylists(weakTopics, skillLevel, apiKey);

    // Get all topic playlists enriched (batch API call)
    const allPlaylists = await youtubeService.getAllPlaylistsEnriched(apiKey);

    res.json({
      recommended,
      weakTopics,
      skillLevel,
      allPlaylists,
      generalPlaylists: allPlaylists['_general'] || youtubeService.getCuratedPlaylists('_general'),
    });
  } catch (error) {
    console.error('Playlists error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get videos for a specific playlist
// @route   GET /api/learn/playlist/:playlistId/videos
// @access  Private
// ========================================
const getPlaylistVideos = async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const videos = await youtubeService.getPlaylistVideos(req.params.playlistId, apiKey);
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Search YouTube playlists
// @route   GET /api/learn/search?q=topic
// @access  Private
// ========================================
const searchPlaylists = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });

    const apiKey = process.env.YOUTUBE_API_KEY;
    const results = await youtubeService.searchPlaylists(q, apiKey);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get curated videos for a specific topic
// @route   GET /api/learn/videos/:topic
// @access  Private
// ========================================
const getTopicVideos = async (req, res) => {
  try {
    const { topic } = req.params;
    const videos = youtubeService.getCuratedVideos(topic);
    res.json({ videos, topic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get learning platform resources based on user profile
// @route   GET /api/learn/resources
// @access  Private
// ========================================
const getLearningResources = async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user._id });

    // Find weak topics
    const topicCounts = {};
    questions.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });

    const allTopics = ['Array', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking'];
    const weakTopics = allTopics.sort((a, b) => (topicCounts[a] || 0) - (topicCounts[b] || 0)).slice(0, 4);

    // Skill level
    const totalScore = questions.reduce((s, q) => s + (q.difficulty === 'EASY' ? 1 : q.difficulty === 'MEDIUM' ? 3 : 6), 0);
    const skillLevel = totalScore >= 1000 ? 'Master' : totalScore >= 600 ? 'Expert' : totalScore >= 300 ? 'Advanced' : totalScore >= 100 ? 'Intermediate' : 'Beginner';

    const personalized = learningResources.getPersonalizedResources(weakTopics, skillLevel);
    const platforms = learningResources.LEARNING_PLATFORMS;

    // Get resources per topic
    const topicResources = {};
    for (const topic of allTopics) {
      topicResources[topic] = learningResources.getTopicResources(topic, skillLevel.toLowerCase());
    }

    res.json({
      personalized,
      platforms,
      topicResources,
      weakTopics,
      skillLevel,
    });
  } catch (error) {
    console.error('Resources error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBehaviorAnalysis,
  getRecommendedPlaylists,
  getPlaylistVideos,
  searchPlaylists,
  getTopicVideos,
  getLearningResources,
};
