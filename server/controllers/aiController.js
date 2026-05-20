const Analytics = require('../models/Analytics');
const Question = require('../models/Question');
const PlatformAccount = require('../models/PlatformAccount');

// === DSA TOPIC MASTER DATA ===
const DSA_CURRICULUM = {
  'Array': { weight: 10, phase: 1, prereqs: [], leetcodeTarget: 40, description: 'Arrays, Strings, Hashing, Two Pointers, Sliding Window, Prefix Sums' },
  'Linked List': { weight: 6, phase: 1, prereqs: ['Array'], leetcodeTarget: 15, description: 'Singly/Doubly Linked Lists, Cycle Detection, Reversal, Merge' },
  'Stack': { weight: 7, phase: 2, prereqs: ['Array'], leetcodeTarget: 15, description: 'Stack, Queue, Monotonic Stack, Priority Queue, Deque' },
  'Queue': { weight: 5, phase: 2, prereqs: ['Array'], leetcodeTarget: 10, description: 'Queue operations, BFS applications, Circular Queue' },
  'Binary Search': { weight: 8, phase: 2, prereqs: ['Array'], leetcodeTarget: 20, description: 'Binary Search on arrays, rotated arrays, search space' },
  'Tree': { weight: 9, phase: 3, prereqs: ['Stack', 'Queue'], leetcodeTarget: 30, description: 'Binary Trees, BST, Segment Trees, Trie, Tree DP' },
  'Graph': { weight: 10, phase: 4, prereqs: ['Tree', 'Queue'], leetcodeTarget: 30, description: 'DFS, BFS, Dijkstra, Topological Sort, Union-Find, MST' },
  'Dynamic Programming': { weight: 10, phase: 5, prereqs: ['Array', 'Graph'], leetcodeTarget: 40, description: '1D/2D DP, Knapsack, LCS, LIS, DP on Trees, Bitmask DP' },
  'Greedy': { weight: 7, phase: 3, prereqs: ['Array', 'Binary Search'], leetcodeTarget: 20, description: 'Greedy algorithms, Activity Selection, Huffman, Interval Problems' },
  'Backtracking': { weight: 8, phase: 4, prereqs: ['Tree', 'Array'], leetcodeTarget: 15, description: 'Recursion, Permutations, Combinations, N-Queens, Sudoku' },
};

// === PHASE DEFINITIONS ===
const ROADMAP_PHASES = [
  {
    id: 1,
    title: '🏗️ Foundation — Arrays & Lists',
    description: 'Master the building blocks of DSA. Arrays, strings, hashing, and linked lists form the foundation for everything ahead.',
    topics: ['Array', 'Linked List'],
    minProblems: 30,
    minMedium: 10,
    minHard: 3,
  },
  {
    id: 2,
    title: '📚 Core Data Structures',
    description: 'Stacks, queues, and binary search — the workhorses of algorithm design. Essential for interview problem-solving.',
    topics: ['Stack', 'Queue', 'Binary Search'],
    minProblems: 25,
    minMedium: 10,
    minHard: 5,
  },
  {
    id: 3,
    title: '🌳 Trees & Greedy Strategies',
    description: 'Dive deep into tree traversals, BST operations, and greedy decision-making. Critical for FAANG interviews.',
    topics: ['Tree', 'Greedy'],
    minProblems: 30,
    minMedium: 12,
    minHard: 6,
  },
  {
    id: 4,
    title: '🕸️ Graphs & Backtracking',
    description: 'Graph algorithms and exhaustive search techniques. Master DFS, BFS, shortest paths, and recursive backtracking.',
    topics: ['Graph', 'Backtracking'],
    minProblems: 30,
    minMedium: 12,
    minHard: 8,
  },
  {
    id: 5,
    title: '⚡ Dynamic Programming Mastery',
    description: 'The ultimate challenge. Master 1D/2D DP, knapsack variants, DP on trees, and bitmask DP to reach elite status.',
    topics: ['Dynamic Programming'],
    minProblems: 30,
    minMedium: 12,
    minHard: 10,
  },
  {
    id: 6,
    title: '🏆 Interview Master — Mixed Practice',
    description: 'Combine all skills with timed practice, contest participation, and mixed-topic problem sets. You are now a DSA Master.',
    topics: ['Array', 'Tree', 'Graph', 'Dynamic Programming'],
    minProblems: 50,
    minMedium: 20,
    minHard: 15,
  },
];

// === SKILL LEVEL THRESHOLDS ===
const SKILL_LEVELS = [
  { level: 'Beginner', minScore: 0, color: '#8B949E', icon: '🌱', description: 'Just getting started with DSA' },
  { level: 'Intermediate', minScore: 100, color: '#3FB950', icon: '📈', description: 'Solid foundation, growing skills' },
  { level: 'Advanced', minScore: 300, color: '#58A6FF', icon: '🔥', description: 'Strong problem solver' },
  { level: 'Expert', minScore: 600, color: '#A78BFA', icon: '⚡', description: 'Top-tier algorithm skills' },
  { level: 'Master', minScore: 1000, color: '#F0883E', icon: '🏆', description: 'DSA Master — Interview ready!' },
];

// ========================================
// === UNIFIED AGGREGATION & TRAINING ENGINE ===
// ========================================
const getAggregatedTopicStats = async (userId) => {
  const questions = await Question.find({ userId });
  const accounts = await PlatformAccount.find({ userId, isConnected: true });

  let deltaEasy = 0;
  let deltaMedium = 0;
  let deltaHard = 0;

  accounts.forEach(account => {
    if (account.stats) {
      const platformName = account.platform === 'leetcode' ? 'LeetCode' : 
                           account.platform === 'codeforces' ? 'Codeforces' : 'GFG';

      const platformQuestions = questions.filter(q => q.platform === platformName);
      const localEasy = platformQuestions.filter(q => q.difficulty === 'EASY').length;
      const localMedium = platformQuestions.filter(q => q.difficulty === 'MEDIUM').length;
      const localHard = platformQuestions.filter(q => q.difficulty === 'HARD').length;

      deltaEasy += Math.max(0, (account.stats.easySolved || 0) - localEasy);
      deltaMedium += Math.max(0, (account.stats.mediumSolved || 0) - localMedium);
      deltaHard += Math.max(0, (account.stats.hardSolved || 0) - localHard);
    }
  });

  const TOPIC_DISTRIBUTION = {
    'Array': { easyPct: 0.35, mediumPct: 0.25, hardPct: 0.15 },
    'Linked List': { easyPct: 0.10, mediumPct: 0.08, hardPct: 0.05 },
    'Stack': { easyPct: 0.08, mediumPct: 0.08, hardPct: 0.08 },
    'Queue': { easyPct: 0.07, mediumPct: 0.05, hardPct: 0.02 },
    'Binary Search': { easyPct: 0.10, mediumPct: 0.10, hardPct: 0.08 },
    'Tree': { easyPct: 0.12, mediumPct: 0.12, hardPct: 0.15 },
    'Greedy': { easyPct: 0.08, mediumPct: 0.10, hardPct: 0.10 },
    'Backtracking': { easyPct: 0.02, mediumPct: 0.08, hardPct: 0.12 },
    'Graph': { easyPct: 0.03, mediumPct: 0.10, hardPct: 0.15 },
    'Dynamic Programming': { easyPct: 0.05, mediumPct: 0.14, hardPct: 0.20 },
  };

  const topicAnalysis = {};
  const now = new Date();

  for (const topic of Object.keys(DSA_CURRICULUM)) {
    const topicQs = questions.filter(q => q.topic === topic);
    const dbEasy = topicQs.filter(q => q.difficulty === 'EASY').length;
    const dbMedium = topicQs.filter(q => q.difficulty === 'MEDIUM').length;
    const dbHard = topicQs.filter(q => q.difficulty === 'HARD').length;

    const dist = TOPIC_DISTRIBUTION[topic] || { easyPct: 0.1, mediumPct: 0.1, hardPct: 0.1 };
    
    const easy = dbEasy + Math.round(deltaEasy * dist.easyPct);
    const medium = dbMedium + Math.round(deltaMedium * dist.mediumPct);
    const hard = dbHard + Math.round(deltaHard * dist.hardPct);
    const total = easy + medium + hard;

    const recentQs = topicQs.filter(q => {
      const daysDiff = (now - new Date(q.solvedDate)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 14;
    }).length;

    const proficiency = (easy * 1) + (medium * 3) + (hard * 6);
    const target = DSA_CURRICULUM[topic].leetcodeTarget;
    const completionPct = Math.min(100, Math.round((total / target) * 100));

    const weightedScore = proficiency / DSA_CURRICULUM[topic].weight;
    const recencyBonus = recentQs * 2;

    topicAnalysis[topic] = {
      topic,
      total,
      easy,
      medium,
      hard,
      proficiency,
      completionPct,
      weightedScore: weightedScore + recencyBonus,
      recentActivity: recentQs,
      target,
      phase: DSA_CURRICULUM[topic].phase,
      description: DSA_CURRICULUM[topic].description,
    };
  }

  return { topicAnalysis, questions };
};

// ========================================
// @desc    Get AI Weak Topic Analysis (REAL-TIME TRAINING)
// @route   GET /api/ai/weak-topics
// @access  Private
// ========================================
const getWeakTopics = async (req, res) => {
  try {
    const { topicAnalysis, questions } = await getAggregatedTopicStats(req.user._id);

    const totalSolved = Object.values(topicAnalysis).reduce((sum, t) => sum + t.total, 0);

    if (totalSolved < 3) {
      return res.json({
        weakTopics: [],
        message: 'Solve at least 3 problems to get AI analysis',
        skillLevel: SKILL_LEVELS[0],
      });
    }

    // Sort by weighted score (ascending = weakest first)
    const sortedTopics = Object.values(topicAnalysis)
      .sort((a, b) => a.weightedScore - b.weightedScore);

    const weakTopics = sortedTopics.slice(0, 4).map(t => {
      let suggestion = '';
      if (t.total === 0) {
        suggestion = `You haven't started ${t.topic} yet! Begin with easy problems to build your foundation.`;
      } else if (t.hard === 0 && t.medium >= 3) {
        suggestion = `You've done well with easy/medium ${t.topic} problems. Challenge yourself with hard problems now!`;
      } else if (t.medium < 3) {
        suggestion = `Focus on medium-difficulty ${t.topic} problems. You need more practice at this level.`;
      } else if (t.recentActivity === 0) {
        suggestion = `You haven't practiced ${t.topic} recently. Skills decay without practice — do a quick revision!`;
      } else {
        suggestion = `Keep pushing on ${t.topic}. Target ${t.target - t.total} more problems to reach mastery.`;
      }

      return {
        topic: t.topic,
        total: t.total,
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        completionPct: t.completionPct,
        recentActivity: t.recentActivity,
        suggestion,
        priority: t.total === 0 ? 'critical' : t.completionPct < 30 ? 'high' : t.completionPct < 60 ? 'medium' : 'low',
      };
    });

    const totalScore = Object.values(topicAnalysis).reduce((sum, t) => sum + t.proficiency, 0);
    const skillLevel = [...SKILL_LEVELS].reverse().find(l => totalScore >= l.minScore) || SKILL_LEVELS[0];

    res.json({ weakTopics, skillLevel: { ...skillLevel, score: totalScore }, topicAnalysis });
  } catch (error) {
    console.error('AI Weak Topics Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get AI Recommendations (REAL-TIME TRAINING)
// @route   GET /api/ai/recommendations
// @access  Private
// ========================================
const getRecommendations = async (req, res) => {
  try {
    const { topicAnalysis, questions } = await getAggregatedTopicStats(req.user._id);
    const totalSolved = Object.values(topicAnalysis).reduce((sum, t) => sum + t.total, 0);
    const now = new Date();

    if (totalSolved === 0) {
      return res.json({
        recommendations: [
          { type: 'start', icon: '🚀', title: 'Begin Your Journey', description: 'Connect your LeetCode/Codeforces account and start solving problems!', priority: 'high' },
          { type: 'practice', icon: '📝', title: 'Start with Arrays', description: 'Arrays are the foundation of DSA. Solve 5 easy array problems to begin.', priority: 'high' },
          { type: 'learn', icon: '📖', title: 'Learn Time Complexity', description: 'Understanding Big-O notation is crucial before diving deeper.', priority: 'medium' },
        ],
        dailyGoal: { target: 3, completed: 0, message: 'Solve 3 problems today to build momentum!' },
      });
    }

    const recommendations = [];

    // 1. Difficulty progression suggestions
    for (const [topic, stats] of Object.entries(topicAnalysis)) {
      if (stats.easy >= 5 && stats.medium < 5) {
        recommendations.push({
          type: 'levelup',
          icon: '⬆️',
          title: `Level Up: ${topic}`,
          description: `You've mastered easy ${topic} problems. Time to tackle medium difficulty!`,
          priority: 'high',
          topic,
        });
      } else if (stats.medium >= 10 && stats.hard < 5) {
        recommendations.push({
          type: 'levelup',
          icon: '🔥',
          title: `Go Hard: ${topic}`,
          description: `Strong medium-level skills in ${topic}. Push yourself with hard problems for interview readiness!`,
          priority: 'high',
          topic,
        });
      }
    }

    // 2. Untouched topics
    for (const topic of Object.keys(DSA_CURRICULUM)) {
      const stats = topicAnalysis[topic];
      if (stats.total === 0) {
        const curriculum = DSA_CURRICULUM[topic];
        const prereqsMet = curriculum.prereqs.every(p => topicAnalysis[p]?.total >= 5);
        if (prereqsMet || curriculum.phase <= 2) {
          recommendations.push({
            type: 'explore',
            icon: '🆕',
            title: `Start: ${topic}`,
            description: `${curriculum.description}. Begin with easy problems to build intuition.`,
            priority: curriculum.phase <= 2 ? 'high' : 'medium',
            topic,
          });
        }
      }
    }

    // 3. Revision suggestions based on last database solves
    const topicLastSolved = {};
    questions.forEach(q => {
      if (!topicLastSolved[q.topic] || new Date(q.solvedDate) > topicLastSolved[q.topic]) {
        topicLastSolved[q.topic] = new Date(q.solvedDate);
      }
    });

    for (const [topic, lastDate] of Object.entries(topicLastSolved)) {
      const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        recommendations.push({
          type: 'revision',
          icon: '🔄',
          title: `Revise ${topic}`,
          description: `It's been ${Math.round(daysSince)} days since you practiced ${topic}. Solve 2-3 problems to keep your skills sharp.`,
          priority: daysSince > 14 ? 'high' : 'medium',
          topic,
        });
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySolved = questions.filter(q => new Date(q.solvedDate) >= todayStart).length;
    const dailyTarget = totalSolved < 30 ? 3 : totalSolved < 100 ? 4 : 5;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    res.json({
      recommendations: recommendations.slice(0, 8),
      dailyGoal: {
        target: dailyTarget,
        completed: todaySolved,
        message: todaySolved >= dailyTarget
          ? '🎉 Daily goal achieved! Keep going for bonus XP!'
          : `Solve ${dailyTarget - todaySolved} more problem${dailyTarget - todaySolved > 1 ? 's' : ''} to hit your daily goal!`,
      },
    });
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// @desc    Get AI Roadmap (REAL-TIME TRAINING)
// @route   GET /api/ai/roadmap
// @access  Private
// ========================================
const getRoadmap = async (req, res) => {
  try {
    const { topicAnalysis, questions } = await getAggregatedTopicStats(req.user._id);

    const totalProblems = Object.values(topicAnalysis).reduce((sum, t) => sum + t.total, 0);

    let activePhaseFound = false;
    const roadmap = ROADMAP_PHASES.map((phase) => {
      let phaseTotal = 0;
      let phaseMedium = 0;
      let phaseHard = 0;

      phase.topics.forEach(topic => {
        const stats = topicAnalysis[topic] || { total: 0, easy: 0, medium: 0, hard: 0 };
        phaseTotal += stats.total;
        phaseMedium += stats.medium;
        phaseHard += stats.hard;
      });

      const totalProgress = Math.min(100, Math.round((phaseTotal / phase.minProblems) * 100));
      const mediumProgress = Math.min(100, Math.round((phaseMedium / phase.minMedium) * 100));
      const hardProgress = Math.min(100, Math.round((phaseHard / phase.minHard) * 100));
      const overallProgress = Math.round((totalProgress + mediumProgress + hardProgress) / 3);

      const isDone = totalProgress >= 100 && mediumProgress >= 80 && hardProgress >= 60;

      let status;
      if (isDone) {
        status = 'done';
      } else if (!activePhaseFound) {
        status = 'active';
        activePhaseFound = true;
      } else {
        status = 'locked';
      }

      const milestones = [
        {
          label: `Solve ${phase.minProblems} problems`,
          current: phaseTotal,
          target: phase.minProblems,
          done: phaseTotal >= phase.minProblems,
        },
        {
          label: `${phase.minMedium}+ medium difficulty`,
          current: phaseMedium,
          target: phase.minMedium,
          done: phaseMedium >= phase.minMedium,
        },
        {
          label: `${phase.minHard}+ hard difficulty`,
          current: phaseHard,
          target: phase.minHard,
          done: phaseHard >= phase.minHard,
        },
      ];

      const last7DaysStart = new Date();
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);
      const last7DaysCount = questions.filter(q => new Date(q.solvedDate) >= last7DaysStart).length;
      const dailyRate = Math.max(0.5, last7DaysCount / 7);
      const remaining = Math.max(0, phase.minProblems - phaseTotal);
      const etaDays = Math.ceil(remaining / dailyRate);

      return {
        id: phase.id,
        title: phase.title,
        description: phase.description,
        topics: phase.topics,
        status,
        progress: overallProgress,
        milestones,
        eta: status === 'active' ? `~${etaDays} days` : status === 'done' ? 'Completed' : 'Locked',
        stats: {
          total: phaseTotal,
          medium: phaseMedium,
          hard: phaseHard,
          targetTotal: phase.minProblems,
          targetMedium: phase.minMedium,
          targetHard: phase.minHard,
        },
      };
    });

    const completedPhases = roadmap.filter(p => p.status === 'done').length;
    const overallProgress = Math.round((completedPhases / roadmap.length) * 100);

    const totalScore = Object.values(topicAnalysis).reduce((sum, t) => sum + t.proficiency, 0);
    const skillLevel = [...SKILL_LEVELS].reverse().find(l => totalScore >= l.minScore) || SKILL_LEVELS[0];

    const interviewScore = Math.min(100, Math.round(
      (totalProblems / 200) * 30 +
      (topicAnalysis['Dynamic Programming']?.total || 0) / 40 * 20 +
      (topicAnalysis['Graph']?.total || 0) / 30 * 15 +
      (topicAnalysis['Tree']?.total || 0) / 30 * 15 +
      (completedPhases / 6) * 20
    ));

    res.json({
      roadmap,
      overallProgress,
      completedPhases,
      totalPhases: roadmap.length,
      skillLevel: { ...skillLevel, score: totalScore },
      interviewReadiness: interviewScore,
      totalProblems,
    });
  } catch (error) {
    console.error('AI Roadmap Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeakTopics, getRecommendations, getRoadmap };
