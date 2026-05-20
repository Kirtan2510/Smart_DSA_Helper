const Question = require('../models/Question');
const User = require('../models/User');
const PlatformAccount = require('../models/PlatformAccount');

const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard summary stats
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Trigger background auto-sync without await (non-blocking) to keep dashboard responsive
    const { autoSyncUserPlatforms } = require('./platformController');
    autoSyncUserPlatforms(userId).catch(err => 
      console.error('[Background Auto-Sync Failed]:', err.message)
    );

    const questions = await Question.find({ userId });

    let totalVal = questions.length;
    let easyVal = questions.filter(q => q.difficulty === 'EASY').length;
    let mediumVal = questions.filter(q => q.difficulty === 'MEDIUM').length;
    let hardVal = questions.filter(q => q.difficulty === 'HARD').length;

    const accounts = await PlatformAccount.find({ userId, isConnected: true });

    accounts.forEach(account => {
      if (account.stats) {
        const platformName = account.platform === 'leetcode' ? 'LeetCode' : 
                             account.platform === 'codeforces' ? 'Codeforces' : 'GFG';

        const platformQuestions = questions.filter(q => q.platform === platformName);
        const localPlatformTotal = platformQuestions.length;
        const localPlatformEasy = platformQuestions.filter(q => q.difficulty === 'EASY').length;
        const localPlatformMedium = platformQuestions.filter(q => q.difficulty === 'MEDIUM').length;
        const localPlatformHard = platformQuestions.filter(q => q.difficulty === 'HARD').length;

        const profileTotal = account.stats.totalSolved || 0;
        const profileEasy = account.stats.easySolved || 0;
        const profileMedium = account.stats.mediumSolved || 0;
        const profileHard = account.stats.hardSolved || 0;

        const deltaTotal = Math.max(0, profileTotal - localPlatformTotal);
        const deltaEasy = Math.max(0, profileEasy - localPlatformEasy);
        const deltaMedium = Math.max(0, profileMedium - localPlatformMedium);
        const deltaHard = Math.max(0, profileHard - localPlatformHard);

        totalVal += deltaTotal;
        easyVal += deltaEasy;
        mediumVal += deltaMedium;
        hardVal += deltaHard;
      }
    });

    // Topic stats
    const topicMap = {};
    questions.forEach(q => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { solved: 0, easy: 0, medium: 0, hard: 0 };
      topicMap[q.topic].solved++;
      topicMap[q.topic][q.difficulty.toLowerCase()]++;
    });

    // Sort topics by solved count descending
    const topicStats = Object.entries(topicMap)
      .map(([topic, stats]) => ({ topic, ...stats }))
      .sort((a, b) => b.solved - a.solved);

    // Weak topics = lowest solved count
    const weakTopics = [...topicStats].sort((a, b) => a.solved - b.solved).slice(0, 3).map(t => ({
      topic: t.topic,
      solved: t.solved,
      accuracy: Math.round((t.solved / (totalVal || 1)) * 100),
      suggestion: `Focus on ${t.topic} — practice more ${t.hard > t.easy ? 'hard' : 'medium'} problems to strengthen your skills.`
    }));

    // Fetch connected leetcode account to get year-wide submission calendar
    const leetcodeAccount = await PlatformAccount.findOne({ userId, platform: 'leetcode', isConnected: true });
    const leetcodeCalendar = leetcodeAccount?.submissionCalendar || {};

    // 1. Calculate available active years across all platforms and manual logs
    const yearsSet = new Set();
    yearsSet.add(new Date().getFullYear()); // Always show current year at least

    questions.forEach(q => {
      if (q.solvedDate) {
        yearsSet.add(new Date(q.solvedDate).getFullYear());
      }
    });

    Object.keys(leetcodeCalendar).forEach(dateStr => {
      const yr = parseInt(dateStr.split('-')[0]);
      if (!isNaN(yr)) yearsSet.add(yr);
    });

    const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

    // 2. Build yearly heatmaps and stats dynamically
    const yearlyData = {};

    // A. "current" view (last 365 days)
    const currentHeatmap = [];
    let currentSubmissions = 0;
    const currentActiveDaysSet = new Set();

    for (let i = 364; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const dateKey = getLocalDateString(date);
      
      const dbCount = questions.filter(q => 
        q.platform !== 'LeetCode' && 
        getLocalDateString(q.solvedDate) === dateKey
      ).length;

      const localLeetcodeCount = questions.filter(q => 
        q.platform === 'LeetCode' && 
        getLocalDateString(q.solvedDate) === dateKey
      ).length;

      const leetcodeCount = leetcodeCalendar[dateKey] || 0;
      const count = dbCount + Math.max(leetcodeCount, localLeetcodeCount);

      if (count > 0) {
        currentActiveDaysSet.add(dateKey);
        currentSubmissions += count;
      }
      currentHeatmap.push({ date: dateKey, count });
    }

    yearlyData['current'] = {
      heatmap: currentHeatmap,
      totalSubmissions: currentSubmissions,
      activeDays: currentActiveDaysSet.size,
    };

    // B. Year-by-year calendars (Jan 1 to Dec 31 of each year)
    for (const year of availableYears) {
      const yearHeatmap = [];
      let yearSubmissions = 0;
      const yearActiveDaysSet = new Set();

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        const dateKey = getLocalDateString(date);

        const dbCount = questions.filter(q => 
          q.platform !== 'LeetCode' && 
          getLocalDateString(q.solvedDate) === dateKey
        ).length;

        const localLeetcodeCount = questions.filter(q => 
          q.platform === 'LeetCode' && 
          getLocalDateString(q.solvedDate) === dateKey
        ).length;

        const leetcodeCount = leetcodeCalendar[dateKey] || 0;
        const count = dbCount + Math.max(leetcodeCount, localLeetcodeCount);

        if (count > 0) {
          yearActiveDaysSet.add(dateKey);
          yearSubmissions += count;
        }
        yearHeatmap.push({ date: dateKey, count });
      }

      yearlyData[year.toString()] = {
        heatmap: yearHeatmap,
        totalSubmissions: yearSubmissions,
        activeDays: yearActiveDaysSet.size,
      };
    }

    // 3. Calculate True All-Time Metrics
    const allTimeActiveDaysSet = new Set();
    
    questions.forEach(q => {
      const dateKey = getLocalDateString(q.solvedDate);
      allTimeActiveDaysSet.add(dateKey);
    });

    const platformAccounts = await PlatformAccount.find({ userId, isConnected: true });
    
    let leetcodeSubmissionsCount = 0;
    platformAccounts.forEach(account => {
      if (account.submissionCalendar) {
        Object.entries(account.submissionCalendar).forEach(([dateKey, count]) => {
          if (count > 0) {
            allTimeActiveDaysSet.add(dateKey);
            if (account.platform === 'leetcode') {
              leetcodeSubmissionsCount += count;
            }
          }
        });
      }
    });

    const nonLeetcodeDBCount = questions.filter(q => q.platform !== 'LeetCode').length;
    const allTimeSubmissionsVal = Math.max(totalVal, nonLeetcodeDBCount + leetcodeSubmissionsCount);
    const allTimeActiveDaysVal = Math.max(allTimeActiveDaysSet.size, questions.length > 0 ? 1 : 0);

    // Recent 5 questions
    const recent = questions.sort((a, b) => new Date(b.solvedDate) - new Date(a.solvedDate)).slice(0, 5);

    // Streak
    const user = await User.findById(userId);

    res.json({
      total: totalVal,
      easy: easyVal,
      medium: mediumVal,
      hard: hardVal,
      topicStats,
      weakTopics,
      heatmap: currentHeatmap,
      recent,
      streak: user.streak || 0,
      allTimeSubmissions: allTimeSubmissionsVal,
      allTimeActiveDays: allTimeActiveDaysVal,
      availableYears,
      yearlyData,
    });
  } catch (error) {
    console.error('Analytics Summary Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary };
