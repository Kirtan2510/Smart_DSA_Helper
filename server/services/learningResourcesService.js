/**
 * Curated free DSA learning resources from top platforms
 * Mapped by topic for personalized recommendations
 */

const LEARNING_PLATFORMS = {
  gfg: {
    name: 'GeeksForGeeks',
    icon: '🟢',
    color: '#2F8D46',
    url: 'https://www.geeksforgeeks.org',
    description: 'Comprehensive DSA articles, practice problems, and company-specific interview prep.',
    free: true,
  },
  freecodecamp: {
    name: 'freeCodeCamp',
    icon: '🔥',
    color: '#0A0A23',
    url: 'https://www.freecodecamp.org',
    description: 'Free coding bootcamp with hands-on projects and certifications.',
    free: true,
  },
  leetcode: {
    name: 'LeetCode',
    icon: '🟠',
    color: '#FFA116',
    url: 'https://leetcode.com',
    description: 'Best platform for coding interview preparation with 2500+ problems.',
    free: true,
  },
  hackerrank: {
    name: 'HackerRank',
    icon: '💚',
    color: '#00EA64',
    url: 'https://www.hackerrank.com',
    description: 'Skill-based practice with certifications. Great for beginners.',
    free: true,
  },
  visualgo: {
    name: 'VisuAlgo',
    icon: '👁️',
    color: '#4A90D9',
    url: 'https://visualgo.net',
    description: 'Visualize data structures and algorithms step-by-step. Perfect for understanding concepts.',
    free: true,
  },
  codeforces: {
    name: 'Codeforces',
    icon: '🔵',
    color: '#318CE7',
    url: 'https://codeforces.com',
    description: 'Competitive programming contests and problem archive. Best for contest prep.',
    free: true,
  },
  codechef: {
    name: 'CodeChef',
    icon: '🍳',
    color: '#5B4638',
    url: 'https://www.codechef.com',
    description: 'Monthly contests, learning paths, and practice problems for all levels.',
    free: true,
  },
  w3schools: {
    name: 'W3Schools',
    icon: '📗',
    color: '#04AA6D',
    url: 'https://www.w3schools.com',
    description: 'Beginner-friendly tutorials with interactive "Try it Yourself" examples.',
    free: true,
  },
};

// === TOPIC-SPECIFIC LEARNING RESOURCES ===
const TOPIC_RESOURCES = {
  'Array': [
    { platform: 'gfg', title: 'Array Data Structure Guide', url: 'https://www.geeksforgeeks.org/array-data-structure/', type: 'article', difficulty: 'beginner' },
    { platform: 'gfg', title: 'Top 50 Array Problems', url: 'https://www.geeksforgeeks.org/top-50-array-coding-problems-for-interviews/', type: 'practice', difficulty: 'intermediate' },
    { platform: 'leetcode', title: 'Array — Study Plan', url: 'https://leetcode.com/study-plan/data-structure/', type: 'practice', difficulty: 'beginner' },
    { platform: 'freecodecamp', title: 'Arrays \u0026 Strings Tutorial', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', difficulty: 'beginner' },
    { platform: 'hackerrank', title: 'Arrays — HackerRank', url: 'https://www.hackerrank.com/domains/data-structures?filters%5Bsubdomains%5D%5B%5D=arrays', type: 'practice', difficulty: 'beginner' },
    { platform: 'visualgo', title: 'Sorting Visualization', url: 'https://visualgo.net/en/sorting', type: 'visual', difficulty: 'beginner' },
  ],
  'Linked List': [
    { platform: 'gfg', title: 'Linked List Complete Guide', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/', type: 'article', difficulty: 'beginner' },
    { platform: 'gfg', title: 'Top Linked List Problems', url: 'https://www.geeksforgeeks.org/top-20-linked-list-interview-question/', type: 'practice', difficulty: 'intermediate' },
    { platform: 'visualgo', title: 'Linked List Visualization', url: 'https://visualgo.net/en/list', type: 'visual', difficulty: 'beginner' },
    { platform: 'hackerrank', title: 'Linked Lists — HackerRank', url: 'https://www.hackerrank.com/domains/data-structures?filters%5Bsubdomains%5D%5B%5D=linked-lists', type: 'practice', difficulty: 'beginner' },
  ],
  'Stack': [
    { platform: 'gfg', title: 'Stack Data Structure', url: 'https://www.geeksforgeeks.org/stack-data-structure/', type: 'article', difficulty: 'beginner' },
    { platform: 'gfg', title: 'Top Stack Problems', url: 'https://www.geeksforgeeks.org/top-50-problems-on-stack-data-structure-asked-in-interviews/', type: 'practice', difficulty: 'intermediate' },
    { platform: 'visualgo', title: 'Stack Visualization', url: 'https://visualgo.net/en/list', type: 'visual', difficulty: 'beginner' },
    { platform: 'hackerrank', title: 'Stacks — HackerRank', url: 'https://www.hackerrank.com/domains/data-structures?filters%5Bsubdomains%5D%5B%5D=stacks', type: 'practice', difficulty: 'beginner' },
  ],
  'Queue': [
    { platform: 'gfg', title: 'Queue Data Structure', url: 'https://www.geeksforgeeks.org/queue-data-structure/', type: 'article', difficulty: 'beginner' },
    { platform: 'visualgo', title: 'Queue Visualization', url: 'https://visualgo.net/en/list', type: 'visual', difficulty: 'beginner' },
    { platform: 'hackerrank', title: 'Queues — HackerRank', url: 'https://www.hackerrank.com/domains/data-structures?filters%5Bsubdomains%5D%5B%5D=queues', type: 'practice', difficulty: 'beginner' },
  ],
  'Binary Search': [
    { platform: 'gfg', title: 'Binary Search Algorithm', url: 'https://www.geeksforgeeks.org/binary-search/', type: 'article', difficulty: 'beginner' },
    { platform: 'leetcode', title: 'Binary Search — Study Plan', url: 'https://leetcode.com/study-plan/binary-search/', type: 'practice', difficulty: 'intermediate' },
    { platform: 'gfg', title: 'Top Binary Search Problems', url: 'https://www.geeksforgeeks.org/binary-search-a-to-z-problems/', type: 'practice', difficulty: 'intermediate' },
  ],
  'Tree': [
    { platform: 'gfg', title: 'Binary Tree Complete Guide', url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/', type: 'article', difficulty: 'beginner' },
    { platform: 'gfg', title: 'Top Tree Interview Questions', url: 'https://www.geeksforgeeks.org/top-50-tree-coding-problems-for-interviews/', type: 'practice', difficulty: 'intermediate' },
    { platform: 'visualgo', title: 'BST Visualization', url: 'https://visualgo.net/en/bst', type: 'visual', difficulty: 'beginner' },
    { platform: 'leetcode', title: 'Trees — Study Plan', url: 'https://leetcode.com/study-plan/data-structure/', type: 'practice', difficulty: 'intermediate' },
  ],
  'Graph': [
    { platform: 'gfg', title: 'Graph Algorithms Complete', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', type: 'article', difficulty: 'intermediate' },
    { platform: 'gfg', title: 'Top Graph Problems', url: 'https://www.geeksforgeeks.org/top-50-graph-coding-problems-for-interviews/', type: 'practice', difficulty: 'advanced' },
    { platform: 'visualgo', title: 'Graph Traversal Visualization', url: 'https://visualgo.net/en/dfsbfs', type: 'visual', difficulty: 'beginner' },
    { platform: 'leetcode', title: 'Graph — Study Plan', url: 'https://leetcode.com/study-plan/graph/', type: 'practice', difficulty: 'advanced' },
  ],
  'Dynamic Programming': [
    { platform: 'gfg', title: 'DP Complete Tutorial', url: 'https://www.geeksforgeeks.org/dynamic-programming/', type: 'article', difficulty: 'intermediate' },
    { platform: 'gfg', title: 'Top DP Problems', url: 'https://www.geeksforgeeks.org/top-50-dynamic-programming-coding-problems-for-interviews/', type: 'practice', difficulty: 'advanced' },
    { platform: 'leetcode', title: 'DP — Study Plan', url: 'https://leetcode.com/study-plan/dynamic-programming/', type: 'practice', difficulty: 'advanced' },
    { platform: 'freecodecamp', title: 'DP Course (freeCodeCamp)', url: 'https://www.freecodecamp.org/news/learn-dynamic-programming/', type: 'course', difficulty: 'intermediate' },
  ],
  'Greedy': [
    { platform: 'gfg', title: 'Greedy Algorithms Tutorial', url: 'https://www.geeksforgeeks.org/greedy-algorithms/', type: 'article', difficulty: 'intermediate' },
    { platform: 'gfg', title: 'Top Greedy Problems', url: 'https://www.geeksforgeeks.org/top-50-greedy-algorithm-problems-for-interviews/', type: 'practice', difficulty: 'intermediate' },
  ],
  'Backtracking': [
    { platform: 'gfg', title: 'Backtracking Algorithms', url: 'https://www.geeksforgeeks.org/backtracking-algorithms/', type: 'article', difficulty: 'intermediate' },
    { platform: 'gfg', title: 'Top Backtracking Problems', url: 'https://www.geeksforgeeks.org/top-20-backtracking-algorithm-interview-questions/', type: 'practice', difficulty: 'intermediate' },
  ],
};

/**
 * Get resources for a specific topic, filtered by difficulty
 */
const getTopicResources = (topic, userLevel = 'beginner') => {
  const resources = TOPIC_RESOURCES[topic] || [];
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  const userLevelNum = levelOrder[userLevel] || 0;

  // Sort so that matching/lower levels come first
  return resources.sort((a, b) => {
    const aDiff = Math.abs((levelOrder[a.difficulty] || 0) - userLevelNum);
    const bDiff = Math.abs((levelOrder[b.difficulty] || 0) - userLevelNum);
    return aDiff - bDiff;
  });
};

/**
 * Get personalized resource recommendations based on weak topics and skill level
 */
const getPersonalizedResources = (weakTopics, skillLevel) => {
  const levelMap = { 'Beginner': 'beginner', 'Intermediate': 'intermediate', 'Advanced': 'advanced', 'Expert': 'advanced', 'Master': 'advanced' };
  const userLevel = levelMap[skillLevel] || 'beginner';

  const recommended = [];
  for (const topic of weakTopics) {
    const resources = getTopicResources(topic, userLevel);
    recommended.push(...resources.slice(0, 3).map(r => ({
      ...r,
      forTopic: topic,
      platformInfo: LEARNING_PLATFORMS[r.platform],
    })));
  }

  return recommended.slice(0, 12);
};

module.exports = {
  LEARNING_PLATFORMS,
  TOPIC_RESOURCES,
  getTopicResources,
  getPersonalizedResources,
};
