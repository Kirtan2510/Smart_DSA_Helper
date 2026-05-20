const axios = require('axios');

const CF_API_BASE = 'https://codeforces.com/api';

/**
 * Fetch Codeforces user info
 */
const fetchUserInfo = async (handle) => {
  const response = await axios.get(`${CF_API_BASE}/user.info`, {
    params: { handles: handle },
    timeout: 10000,
  });

  if (response.data?.status !== 'OK') {
    throw new Error(`Codeforces user "${handle}" not found`);
  }

  const user = response.data.result[0];
  return {
    handle: user.handle,
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || 'unrated',
    maxRank: user.maxRank || 'unrated',
    contribution: user.contribution || 0,
  };
};

/**
 * Fetch user submissions from Codeforces
 */
const fetchSubmissions = async (handle, count = 200) => {
  const response = await axios.get(`${CF_API_BASE}/user.status`, {
    params: { handle, from: 1, count },
    timeout: 15000,
  });

  if (response.data?.status !== 'OK') {
    throw new Error('Failed to fetch Codeforces submissions');
  }

  return response.data.result || [];
};

/**
 * Extract unique solved problems from submissions
 */
const getUniqueSolvedProblems = (submissions) => {
  const solved = new Map();

  for (const sub of submissions) {
    if (sub.verdict !== 'OK') continue;

    const key = `${sub.problem.contestId}-${sub.problem.index}`;
    if (solved.has(key)) continue;

    solved.set(key, {
      id: key,
      title: sub.problem.name,
      contestId: sub.problem.contestId,
      index: sub.problem.index,
      rating: sub.problem.rating || 0,
      tags: sub.problem.tags || [],
      timestamp: new Date(sub.creationTimeSeconds * 1000),
    });
  }

  return Array.from(solved.values());
};

/**
 * Map CF problem rating to difficulty
 */
const ratingToDifficulty = (rating) => {
  if (!rating || rating <= 1200) return 'EASY';
  if (rating <= 1800) return 'MEDIUM';
  return 'HARD';
};

/**
 * Map Codeforces tags to our DSA topics
 */
const mapCFTagToTopic = (tags) => {
  const tagMap = {
    'dp': 'Dynamic Programming',
    'graphs': 'Graph',
    'trees': 'Tree',
    'binary search': 'Binary Search',
    'greedy': 'Greedy',
    'sortings': 'Array',
    'brute force': 'Array',
    'implementation': 'Array',
    'strings': 'Array',
    'math': 'Array',
    'data structures': 'Stack',
    'dfs and similar': 'Graph',
    'bfs': 'Graph',
    'shortest paths': 'Graph',
    'constructive algorithms': 'Array',
    'two pointers': 'Array',
    'number theory': 'Array',
    'combinatorics': 'Dynamic Programming',
    'bitmasks': 'Dynamic Programming',
    'divide and conquer': 'Binary Search',
    'hashing': 'Array',
    'geometry': 'Array',
    'probabilities': 'Array',
    'flows': 'Graph',
    'games': 'Dynamic Programming',
  };

  for (const tag of tags) {
    if (tagMap[tag]) return tagMap[tag];
  }
  return 'Array';
};

module.exports = {
  fetchUserInfo,
  fetchSubmissions,
  getUniqueSolvedProblems,
  ratingToDifficulty,
  mapCFTagToTopic,
};
