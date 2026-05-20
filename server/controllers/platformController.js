const PlatformAccount = require('../models/PlatformAccount');
const SyncLog = require('../models/SyncLog');
const Question = require('../models/Question');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

const leetcodeService = require('../services/leetcodeService');
const codeforcesService = require('../services/codeforcesService');
const gfgService = require('../services/gfgService');

// @desc    Get all connected platforms for user
// @route   GET /api/platforms
// @access  Private
const getPlatforms = async (req, res) => {
  try {
    const platforms = await PlatformAccount.find({ userId: req.user._id });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connect a new platform
// @route   POST /api/platforms/connect
// @access  Private
const connectPlatform = async (req, res) => {
  const { platform, username } = req.body;

  if (!platform || !username) {
    return res.status(400).json({ message: 'Platform and username are required' });
  }

  if (!['leetcode', 'codeforces', 'gfg'].includes(platform)) {
    return res.status(400).json({ message: 'Invalid platform. Use: leetcode, codeforces, gfg' });
  }

  try {
    // Verify the username exists on the platform
    let profileData;
    let calendarData = {};
    if (platform === 'leetcode') {
      profileData = await leetcodeService.fetchUserProfile(username);
      calendarData = await leetcodeService.fetchUserCalendar(username);
    } else if (platform === 'codeforces') {
      const info = await codeforcesService.fetchUserInfo(username);
      profileData = { ...info, totalSolved: 0 };
    } else if (platform === 'gfg') {
      profileData = await gfgService.fetchUserProfile(username);
    }

    // Create or update platform account
    const account = await PlatformAccount.findOneAndUpdate(
      { userId: req.user._id, platform },
      {
        username,
        isConnected: true,
        syncStatus: 'idle',
        syncError: null,
        stats: {
          totalSolved: profileData.totalSolved || 0,
          easySolved: profileData.easySolved || 0,
          mediumSolved: profileData.mediumSolved || 0,
          hardSolved: profileData.hardSolved || 0,
          rating: profileData.rating || 0,
          rank: profileData.rank || '',
        },
        submissionCalendar: calendarData
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: `Successfully connected to ${platform}`,
      account,
    });
  } catch (error) {
    console.error(`Platform connect error (${platform}):`, error.message);
    res.status(400).json({
      message: `Failed to verify ${platform} username: ${error.message}`,
    });
  }
};

// @desc    Disconnect a platform
// @route   DELETE /api/platforms/:platform
// @access  Private
const disconnectPlatform = async (req, res) => {
  try {
    const result = await PlatformAccount.findOneAndDelete({
      userId: req.user._id,
      platform: req.params.platform,
    });

    if (!result) {
      return res.status(404).json({ message: 'Platform not connected' });
    }

    res.json({ message: `Disconnected from ${req.params.platform}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync problems from a specific platform
// @route   POST /api/platforms/sync/:platform
// @access  Private
const syncPlatform = async (req, res) => {
  const { platform } = req.params;
  const userId = req.user._id;
  const startTime = Date.now();

  try {
    const account = await PlatformAccount.findOne({ userId, platform });
    if (!account || !account.isConnected) {
      return res.status(400).json({ message: `${platform} is not connected` });
    }

    // Update sync status
    account.syncStatus = 'syncing';
    await account.save();

    let questionsAdded = 0;
    let questionsUpdated = 0;

    if (platform === 'leetcode') {
      const result = await syncLeetCode(userId, account.username);
      questionsAdded = result.added;
      questionsUpdated = result.updated;

      // Update stats
      const profile = await leetcodeService.fetchUserProfile(account.username);
      const calendar = await leetcodeService.fetchUserCalendar(account.username);
      account.stats = {
        totalSolved: profile.totalSolved,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        rating: profile.ranking || 0,
        rank: '',
      };
      account.submissionCalendar = calendar;
    } else if (platform === 'codeforces') {
      const result = await syncCodeforces(userId, account.username);
      questionsAdded = result.added;
      questionsUpdated = result.updated;

      // Update stats
      const info = await codeforcesService.fetchUserInfo(account.username);
      const submissions = await codeforcesService.fetchSubmissions(account.username);
      const solved = codeforcesService.getUniqueSolvedProblems(submissions);
      const easy = solved.filter(s => codeforcesService.ratingToDifficulty(s.rating) === 'EASY').length;
      const medium = solved.filter(s => codeforcesService.ratingToDifficulty(s.rating) === 'MEDIUM').length;
      const hard = solved.filter(s => codeforcesService.ratingToDifficulty(s.rating) === 'HARD').length;

      account.stats = {
        totalSolved: solved.length,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        rating: info.rating,
        rank: info.rank,
        contestsAttended: 0,
      };
    } else if (platform === 'gfg') {
      const result = await syncGFG(userId, account.username);
      questionsAdded = result.added;
      questionsUpdated = result.updated;

      // Update stats
      const profile = await gfgService.fetchUserProfile(account.username);
      account.stats = {
        totalSolved: profile.totalSolved,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        rating: profile.codingScore || 0,
        rank: profile.instituteRank || '',
      };
    }

    account.syncStatus = 'success';
    account.lastSyncAt = new Date();
    account.syncError = null;
    await account.save();

    // Update analytics
    await updateAnalytics(userId);

    // Update streak
    await updateStreak(userId);

    // Log sync
    await SyncLog.create({
      userId,
      platform,
      status: 'success',
      questionsAdded,
      questionsUpdated,
      duration: Date.now() - startTime,
    });

    res.json({
      message: `Sync complete! ${questionsAdded} new, ${questionsUpdated} updated`,
      questionsAdded,
      questionsUpdated,
      stats: account.stats,
    });
  } catch (error) {
    console.error(`Sync error (${platform}):`, error.message);

    // Update account status
    await PlatformAccount.findOneAndUpdate(
      { userId, platform },
      { syncStatus: 'error', syncError: error.message }
    );

    // Log error
    await SyncLog.create({
      userId,
      platform,
      status: 'error',
      errorMessage: error.message,
      duration: Date.now() - startTime,
    });

    res.status(500).json({ message: `Sync failed: ${error.message}` });
  }
};

// @desc    Sync all connected platforms
// @route   POST /api/platforms/sync-all
// @access  Private
const syncAll = async (req, res) => {
  try {
    const accounts = await PlatformAccount.find({ userId: req.user._id, isConnected: true });

    if (accounts.length === 0) {
      return res.json({ message: 'No platforms connected', results: [] });
    }

    const results = [];
    for (const account of accounts) {
      try {
        // Simulate calling syncPlatform for each
        const startTime = Date.now();
        let questionsAdded = 0;

        if (account.platform === 'leetcode') {
          const result = await syncLeetCode(req.user._id, account.username);
          questionsAdded = result.added;
          const profile = await leetcodeService.fetchUserProfile(account.username);
          const calendar = await leetcodeService.fetchUserCalendar(account.username);
          account.stats = {
            totalSolved: profile.totalSolved,
            easySolved: profile.easySolved,
            mediumSolved: profile.mediumSolved,
            hardSolved: profile.hardSolved,
            rating: profile.ranking || 0,
          };
          account.submissionCalendar = calendar;
        } else if (account.platform === 'codeforces') {
          const result = await syncCodeforces(req.user._id, account.username);
          questionsAdded = result.added;
          const info = await codeforcesService.fetchUserInfo(account.username);
          account.stats.rating = info.rating;
          account.stats.rank = info.rank;
        } else if (account.platform === 'gfg') {
          const result = await syncGFG(req.user._id, account.username);
          questionsAdded = result.added;
        }

        account.syncStatus = 'success';
        account.lastSyncAt = new Date();
        account.syncError = null;
        await account.save();

        results.push({ platform: account.platform, status: 'success', questionsAdded });
      } catch (err) {
        account.syncStatus = 'error';
        account.syncError = err.message;
        await account.save();
        results.push({ platform: account.platform, status: 'error', error: err.message });
      }
    }

    // Update analytics after all syncs
    await updateAnalytics(req.user._id);
    await updateStreak(req.user._id);

    res.json({ message: 'Sync complete', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sync history logs
// @route   GET /api/platforms/sync-logs
// @access  Private
const getSyncLogs = async (req, res) => {
  try {
    const logs = await SyncLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// === SYNC HELPER FUNCTIONS ===

async function syncLeetCode(userId, username) {
  const submissions = await leetcodeService.fetchRecentSubmissions(username, 150);
  let added = 0;
  let updated = 0;

  for (const sub of submissions) {
    // Check if question already exists
    const exists = await Question.findOne({
      userId,
      title: sub.title,
      platform: 'LeetCode',
    });

    if (exists) continue;

    // Fetch problem details for difficulty and tags
    let difficulty = 'MEDIUM';
    let topic = 'Array';

    const details = await leetcodeService.fetchProblemDetails(sub.titleSlug);
    if (details) {
      difficulty = details.difficulty;
      topic = leetcodeService.mapTagToTopic(details.tags);
    }

    // Add small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));

    await Question.create({
      userId,
      title: sub.title,
      topic,
      difficulty,
      platform: 'LeetCode',
      notes: `Auto-synced from LeetCode`,
      solvedDate: sub.timestamp,
      status: 'SOLVED',
    });

    added++;
  }

  return { added, updated };
}

async function syncCodeforces(userId, username) {
  const submissions = await codeforcesService.fetchSubmissions(username, 200);
  const solved = codeforcesService.getUniqueSolvedProblems(submissions);
  let added = 0;
  let updated = 0;

  for (const problem of solved) {
    const exists = await Question.findOne({
      userId,
      title: problem.title,
      platform: 'Codeforces',
    });

    if (exists) continue;

    const difficulty = codeforcesService.ratingToDifficulty(problem.rating);
    const topic = codeforcesService.mapCFTagToTopic(problem.tags);

    await Question.create({
      userId,
      title: problem.title,
      topic,
      difficulty,
      platform: 'Codeforces',
      notes: `Auto-synced | Rating: ${problem.rating || 'N/A'}`,
      solvedDate: problem.timestamp,
      status: 'SOLVED',
    });

    added++;
  }

  return { added, updated };
}

async function syncGFG(userId, username) {
  // GFG doesn't give us individual problem lists easily,
  // so we update the stats and add a summary entry if new problems detected
  const profile = await gfgService.fetchUserProfile(username);
  let added = 0;
  let updated = 0;

  // Check existing GFG questions count
  const existingCount = await Question.countDocuments({ userId, platform: 'GFG' });
  const newProblems = profile.totalSolved - existingCount;

  if (newProblems > 0) {
    // Add placeholder entries for newly detected problems
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const topics = ['Array', 'Tree', 'Graph', 'Dynamic Programming', 'Stack', 'Linked List'];

    for (let i = 0; i < Math.min(newProblems, 20); i++) {
      const diff = difficulties[i % 3];
      const topic = topics[i % topics.length];

      await Question.create({
        userId,
        title: `GFG Problem #${existingCount + i + 1}`,
        topic,
        difficulty: diff,
        platform: 'GFG',
        notes: 'Auto-synced from GeeksForGeeks',
        solvedDate: new Date(),
        status: 'SOLVED',
      });

      added++;
    }
  }

  return { added, updated };
}

async function updateAnalytics(userId) {
  const questions = await Question.find({ userId });
  let analytics = await Analytics.findOne({ userId });
  if (!analytics) {
    analytics = await Analytics.create({ userId });
  }

  // Recalculate difficulty stats
  analytics.difficultyStats = {
    easy: questions.filter(q => q.difficulty === 'EASY').length,
    medium: questions.filter(q => q.difficulty === 'MEDIUM').length,
    hard: questions.filter(q => q.difficulty === 'HARD').length,
  };

  // Recalculate topic stats
  const topicMap = new Map();
  questions.forEach(q => {
    const current = topicMap.get(q.topic) || { solved: 0, easy: 0, medium: 0, hard: 0 };
    current.solved++;
    current[q.difficulty.toLowerCase()]++;
    topicMap.set(q.topic, current);
  });
  analytics.topicStats = topicMap;

  await analytics.save();
}

async function updateStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date().setHours(0, 0, 0, 0);
  const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate).setHours(0, 0, 0, 0) : null;

  if (lastSolved !== today) {
    if (lastSolved === today - 86400000) {
      user.streak += 1;
    } else if (!lastSolved || lastSolved < today - 86400000) {
      user.streak = 1;
    }
    user.lastSolvedDate = new Date();
    await user.save();
  }
}

async function autoSyncUserPlatforms(userId) {
  try {
    const PlatformAccount = require('../models/PlatformAccount');
    const SyncLog = require('../models/SyncLog');

    const accounts = await PlatformAccount.find({ userId, isConnected: true });
    if (accounts.length === 0) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const accountsToSync = accounts.filter(acc => !acc.lastSyncAt || acc.lastSyncAt < oneHourAgo);

    if (accountsToSync.length === 0) return;

    console.log(`[Auto-Sync] Initiating non-blocking background sync for user ${userId} on platforms: ${accountsToSync.map(a => a.platform).join(', ')}`);

    for (const account of accountsToSync) {
      try {
        account.syncStatus = 'syncing';
        await account.save();

        let questionsAdded = 0;

        if (account.platform === 'leetcode') {
          const result = await syncLeetCode(userId, account.username);
          questionsAdded = result.added;
          const profile = await leetcodeService.fetchUserProfile(account.username);
          const calendar = await leetcodeService.fetchUserCalendar(account.username);
          account.stats = {
            totalSolved: profile.totalSolved,
            easySolved: profile.easySolved,
            mediumSolved: profile.mediumSolved,
            hardSolved: profile.hardSolved,
            rating: profile.ranking || 0,
          };
          account.submissionCalendar = calendar;
        } else if (account.platform === 'codeforces') {
          const result = await syncCodeforces(userId, account.username);
          questionsAdded = result.added;
          const info = await codeforcesService.fetchUserInfo(account.username);
          account.stats.rating = info.rating;
          account.stats.rank = info.rank;
        } else if (account.platform === 'gfg') {
          const result = await syncGFG(userId, account.username);
          questionsAdded = result.added;
        }

        account.syncStatus = 'success';
        account.lastSyncAt = new Date();
        account.syncError = null;
        await account.save();

        await SyncLog.create({
          userId,
          platform: account.platform,
          status: 'success',
          questionsAdded,
          duration: 0,
        });

      } catch (err) {
        console.error(`[Auto-Sync Error] Failed for ${account.platform}:`, err.message);
        account.syncStatus = 'error';
        account.syncError = err.message;
        await account.save();

        await SyncLog.create({
          userId,
          platform: account.platform,
          status: 'error',
          error: err.message,
          duration: 0,
        });
      }
    }

    await updateAnalytics(userId);
    await updateStreak(userId);
    console.log(`[Auto-Sync] Background sync successfully completed for user ${userId}`);

  } catch (error) {
    console.error('[Auto-Sync Critical Error]:', error.message);
  }
}

module.exports = {
  getPlatforms,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  syncAll,
  getSyncLogs,
  autoSyncUserPlatforms,
};
