const axios = require('axios');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql/';

/**
 * Fetch LeetCode user profile stats (public data, no auth needed)
 */
const fetchUserProfile = async (username) => {
  const query = `
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          realName
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const response = await axios.post(LEETCODE_GRAPHQL_URL, {
    query,
    variables: { username },
  }, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
      'Referer': `https://leetcode.com/${username}/`,
    },
    timeout: 15000,
  });

  const user = response.data?.data?.matchedUser;
  if (!user) {
    throw new Error(`LeetCode user "${username}" not found`);
  }

  const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
  const getCount = (diff) => acStats.find(s => s.difficulty === diff)?.count || 0;

  return {
    username: user.username,
    ranking: user.profile?.ranking || 0,
    totalSolved: getCount('All'),
    easySolved: getCount('Easy'),
    mediumSolved: getCount('Medium'),
    hardSolved: getCount('Hard'),
  };
};

/**
 * Fetch recent accepted submissions from LeetCode
 */
const fetchRecentSubmissions = async (username, limit = 50) => {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const response = await axios.post(LEETCODE_GRAPHQL_URL, {
    query,
    variables: { username, limit },
  }, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
      'Referer': `https://leetcode.com/${username}/`,
    },
    timeout: 15000,
  });

  const submissions = response.data?.data?.recentAcSubmissionList || [];
  return submissions.map(s => ({
    id: s.id,
    title: s.title,
    titleSlug: s.titleSlug,
    timestamp: new Date(parseInt(s.timestamp) * 1000),
  }));
};

/**
 * Fetch problem details to get difficulty and tags
 */
const fetchProblemDetails = async (titleSlug) => {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        topicTags {
          name
          slug
        }
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_GRAPHQL_URL, {
      query,
      variables: { titleSlug },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
      },
      timeout: 10000,
    });

    const q = response.data?.data?.question;
    if (!q) return null;

    return {
      id: q.questionId,
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty?.toUpperCase() || 'MEDIUM',
      tags: (q.topicTags || []).map(t => t.name),
    };
  } catch {
    return null; // Silently fail for individual problem lookups
  }
};

/**
 * Map LeetCode tags to our DSA topics
 */
const mapTagToTopic = (tags) => {
  const tagMap = {
    'Array': 'Array', 'String': 'Array', 'Hash Table': 'Array',
    'Sorting': 'Array', 'Matrix': 'Array', 'Prefix Sum': 'Array',
    'Linked List': 'Linked List',
    'Tree': 'Tree', 'Binary Tree': 'Tree', 'Binary Search Tree': 'Tree',
    'Depth-First Search': 'Graph', 'Breadth-First Search': 'Graph',
    'Graph': 'Graph', 'Topological Sort': 'Graph', 'Union Find': 'Graph',
    'Shortest Path': 'Graph',
    'Dynamic Programming': 'Dynamic Programming',
    'Stack': 'Stack', 'Monotonic Stack': 'Stack',
    'Queue': 'Queue', 'Monotonic Queue': 'Queue',
    'Binary Search': 'Binary Search',
    'Greedy': 'Greedy',
    'Backtracking': 'Backtracking', 'Recursion': 'Backtracking',
    'Two Pointers': 'Array', 'Sliding Window': 'Array',
    'Bit Manipulation': 'Dynamic Programming',
    'Math': 'Array', 'Simulation': 'Array',
    'Heap (Priority Queue)': 'Stack',
    'Trie': 'Tree', 'Segment Tree': 'Tree',
    'Divide and Conquer': 'Binary Search',
    'Design': 'Array',
  };

  for (const tag of tags) {
    if (tagMap[tag]) return tagMap[tag];
  }
  return 'Array'; // Default
};

/**
 * Fetch LeetCode user profile calendar (heatmap activity) for all active years
 */
const fetchUserCalendar = async (username) => {
  const yearsQuery = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          activeYears
        }
      }
    }
  `;

  const calendarQuery = `
    query userProfileCalendar($username: String!, $year: Int!) {
      matchedUser(username: $username) {
        userCalendar(year: $year) {
          submissionCalendar
        }
      }
    }
  `;

  try {
    // 1. Fetch all active years for the user
    const yearsResponse = await axios.post(LEETCODE_GRAPHQL_URL, {
      query: yearsQuery,
      variables: { username },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
        'Referer': `https://leetcode.com/${username}/`,
      },
      timeout: 10000,
    });

    const activeYears = yearsResponse.data?.data?.matchedUser?.userCalendar?.activeYears || [];
    
    // If no active years found, fall back to current year calendar
    if (activeYears.length === 0) {
      const currentYear = new Date().getFullYear();
      activeYears.push(currentYear);
    }

    const mapped = {};

    // 2. Fetch submission calendar for each active year
    for (const year of activeYears) {
      try {
        const calResponse = await axios.post(LEETCODE_GRAPHQL_URL, {
          query: calendarQuery,
          variables: { username, year },
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
            'Referer': `https://leetcode.com/${username}/`,
          },
          timeout: 10000,
        });

        const calendarStr = calResponse.data?.data?.matchedUser?.userCalendar?.submissionCalendar || '{}';
        const rawCalendar = JSON.parse(calendarStr);

        Object.entries(rawCalendar).forEach(([timestamp, count]) => {
          const date = new Date(parseInt(timestamp) * 1000);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateKey = `${year}-${month}-${day}`;
          mapped[dateKey] = (mapped[dateKey] || 0) + count;
        });

        // Add a small delay between requests to avoid rate limits
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`Failed to fetch LeetCode calendar for year ${year}:`, err.message);
      }
    }

    return mapped;
  } catch (err) {
    console.error('Failed to fetch LeetCode calendar active years:', err.message);
    return {};
  }
};

module.exports = {
  fetchUserProfile,
  fetchRecentSubmissions,
  fetchProblemDetails,
  mapTagToTopic,
  fetchUserCalendar,
};
