const axios = require('axios');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// === CURATED DSA PLAYLISTS — IDs only, thumbnails fetched live from YouTube API ===
const CURATED_PLAYLISTS = {
  'Array': [
    { id: 'PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz', title: 'Striver A2Z DSA — Arrays', channel: 'take U forward', level: 'beginner' },
    { id: 'PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', title: 'Arrays Complete Course', channel: 'Love Babbar', level: 'beginner' },
    { id: 'PLot-Xpze53lfOdF3KwpMSFEyfE77zIwiP', title: 'Array Problems — NeetCode', channel: 'NeetCode', level: 'intermediate' },
  ],
  'Linked List': [
    { id: 'PLgUwDviBIf0p4ozDR_kJJkONnb1wdx2Ma', title: 'Linked List — Striver', channel: 'take U forward', level: 'beginner' },
    { id: 'PLDzeHZWIZsTr54_TH_NK4ibFojS4mmQA6', title: 'Linked List Full Course', channel: 'Love Babbar', level: 'beginner' },
  ],
  'Stack': [
    { id: 'PLgUwDviBIf0pOd5zvVVSzgpo6BaCpHT9c', title: 'Stack & Queue — Striver', channel: 'take U forward', level: 'intermediate' },
    { id: 'PLDzeHZWIZsTo87y1ytEAqp7wYlEP3nner', title: 'Stack Playlist', channel: 'Love Babbar', level: 'beginner' },
  ],
  'Queue': [
    { id: 'PLgUwDviBIf0pOd5zvVVSzgpo6BaCpHT9c', title: 'Stack & Queue — Striver', channel: 'take U forward', level: 'beginner' },
  ],
  'Binary Search': [
    { id: 'PLgUwDviBIf0pMFMWuuvDNMAkoQFi-h0ZF', title: 'Binary Search — Striver', channel: 'take U forward', level: 'intermediate' },
    { id: 'PLot-Xpze53leNZQd0iINpD-MAhMOMzWvO', title: 'Binary Search — NeetCode', channel: 'NeetCode', level: 'intermediate' },
  ],
  'Tree': [
    { id: 'PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk', title: 'Binary Trees — Striver', channel: 'take U forward', level: 'intermediate' },
    { id: 'PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', title: 'Trees Complete', channel: 'Love Babbar', level: 'beginner' },
    { id: 'PLot-Xpze53ldg4pN6PfzoJY7KsKcxF1jg', title: 'Trees — NeetCode', channel: 'NeetCode', level: 'intermediate' },
  ],
  'Graph': [
    { id: 'PLgUwDviBIf0oE3Ber0NH1bRKoSz-sC8sE', title: 'Graph Series — Striver', channel: 'take U forward', level: 'advanced' },
    { id: 'PLot-Xpze53ldBT_7QA8NVot219jFNr_GI', title: 'Graphs — NeetCode', channel: 'NeetCode', level: 'intermediate' },
    { id: 'PLPl4hAPPk0eDu6CYmcoTr-1GMOdQ8KVFU', title: 'Graph Algorithms — Abdul Bari', channel: 'Abdul Bari', level: 'beginner' },
  ],
  'Dynamic Programming': [
    { id: 'PLgUwDviBIf0qUlt5H_kiKYaNSqJ81PMMY', title: 'DP Series — Striver', channel: 'take U forward', level: 'advanced' },
    { id: 'PLot-Xpze53lcvx_yhQb0Myxo8lfB_IVJC', title: 'Dynamic Programming — NeetCode', channel: 'NeetCode', level: 'intermediate' },
    { id: 'PLrmLmBdmIlpsHaNTPP_jHHDx_os9ItYXr', title: 'DP by Tushar Roy', channel: 'Tushar Roy', level: 'intermediate' },
  ],
  'Greedy': [
    { id: 'PLgUwDviBIf0rF1w2Kp9cA7RbHtiaPVEEu', title: 'Greedy Algorithms — Striver', channel: 'take U forward', level: 'intermediate' },
    { id: 'PLot-Xpze53lf5C3HSjCnyFghlB3cCVQDO', title: 'Greedy — NeetCode', channel: 'NeetCode', level: 'intermediate' },
  ],
  'Backtracking': [
    { id: 'PLgUwDviBIf0rGlzIn_7DJ_RJlnh0FLOyv', title: 'Recursion & Backtracking — Striver', channel: 'take U forward', level: 'intermediate' },
    { id: 'PLot-Xpze53lf5C3HSjCnyFghlB3cCVQDO', title: 'Backtracking — NeetCode', channel: 'NeetCode', level: 'intermediate' },
  ],
  '_general': [
    { id: 'PLkjdNRgDmcc0Prt5zDWsj42OqQigFiJKd', title: 'Complete DSA in Java', channel: 'Kunal Kushwaha', level: 'beginner' },
    { id: 'PLBF3763AF2E1ED9A', title: 'MIT 6.006 Intro to Algorithms', channel: 'MIT OpenCourseWare', level: 'advanced' },
    { id: 'PLeo1K3hjS3uu_n_a__MI_KktGTLYopZ12', title: 'DSA using Python', channel: 'codebasics', level: 'beginner' },
  ],
};

// === CURATED INDIVIDUAL VIDEOS PER TOPIC ===
const CURATED_VIDEOS = {
  'Array': [
    { videoId: '37E9ckMDdTk', title: 'Largest Element in Array', channel: 'take U forward', duration: '12:34' },
    { videoId: 'KLlXCFG5TnA', title: 'Contains Duplicate — NeetCode', channel: 'NeetCode', duration: '6:45' },
    { videoId: 'WPkLlxj8h0A', title: 'Two Sum — Blind 75', channel: 'NeetCode', duration: '10:23' },
    { videoId: '68isPRHgcFQ', title: "Kadane's Algorithm", channel: 'take U forward', duration: '18:15' },
  ],
  'Linked List': [
    { videoId: 'Nq7ok-OyEpg', title: 'Introduction to Linked List', channel: 'take U forward', duration: '20:10' },
    { videoId: 'G0_I-ZF0S38', title: 'Reverse Linked List', channel: 'NeetCode', duration: '8:45' },
  ],
  'Stack': [
    { videoId: 'GYptUgnIM_I', title: 'Stack Implementation', channel: 'take U forward', duration: '15:20' },
    { videoId: 'WB_knqEZRkY', title: 'Valid Parentheses', channel: 'NeetCode', duration: '7:30' },
  ],
  'Tree': [
    { videoId: 'OYqYEM1bMK8', title: 'Binary Tree Introduction', channel: 'take U forward', duration: '22:45' },
    { videoId: 'OnSn2XEQ4MY', title: 'Invert Binary Tree', channel: 'NeetCode', duration: '6:10' },
  ],
  'Graph': [
    { videoId: 'M3_pLsDdeuU', title: 'Graph Introduction — BFS DFS', channel: 'take U forward', duration: '25:30' },
    { videoId: 'EgI5nU9etnU', title: 'Number of Islands', channel: 'NeetCode', duration: '12:15' },
    { videoId: 'pcKY4hjDrxk', title: 'Graph Traversal — Abdul Bari', channel: 'Abdul Bari', duration: '30:00' },
  ],
  'Dynamic Programming': [
    { videoId: 'FfXoiwwnxFw', title: 'Intro to DP — Striver', channel: 'take U forward', duration: '30:20' },
    { videoId: '73r3KWiEvyk', title: 'Climbing Stairs — NeetCode', channel: 'NeetCode', duration: '8:00' },
    { videoId: '8LusJS5-AGo', title: 'DP — Tushar Roy', channel: 'Tushar Roy', duration: '25:10' },
  ],
  'Binary Search': [
    { videoId: 'W9QJ8HaRvJQ', title: 'Binary Search — Striver', channel: 'take U forward', duration: '18:00' },
    { videoId: 'U8XENwh8Oy8', title: 'Binary Search — NeetCode', channel: 'NeetCode', duration: '10:30' },
  ],
  'Greedy': [
    { videoId: 'HjGn2IEqRns', title: 'Greedy Algorithms Intro', channel: 'take U forward', duration: '15:00' },
  ],
  'Backtracking': [
    { videoId: 'kvRjgEiCDZs', title: 'Recursion & Backtracking', channel: 'take U forward', duration: '20:00' },
    { videoId: 'REOH22Xwdkk', title: 'Subsets — NeetCode', channel: 'NeetCode', duration: '9:45' },
  ],
};

// In-memory thumbnail cache: playlistId -> details object
const playlistCache = {};

/**
 * Batch-fetch real playlist details from YouTube API (thumbnail, videoCount, title, channel).
 * Caches results in memory to avoid repeated API calls.
 */
const fetchPlaylistDetails = async (playlistIds, apiKey) => {
  if (!apiKey || playlistIds.length === 0) return {};

  const toFetch = playlistIds.filter(id => !playlistCache[id]);
  const result = {};

  if (toFetch.length > 0) {
    // YouTube allows max 50 IDs per request
    const chunks = [];
    for (let i = 0; i < toFetch.length; i += 50) {
      chunks.push(toFetch.slice(i, i + 50));
    }

    for (const chunk of chunks) {
      try {
        const response = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
          params: {
            part: 'snippet,contentDetails',
            id: chunk.join(','),
            key: apiKey,
            maxResults: 50,
          },
          timeout: 10000,
        });

        for (const item of (response.data.items || [])) {
          const detail = {
            thumbnail:
              item.snippet.thumbnails?.maxres?.url ||
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.medium?.url ||
              item.snippet.thumbnails?.default?.url ||
              null,
            videoCount: item.contentDetails?.itemCount || null,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
          };
          playlistCache[item.id] = detail;
          result[item.id] = detail;
        }
      } catch (err) {
        console.error('YouTube playlist details fetch error:', err.message);
      }
    }
  }

  // Merge cached results for IDs already in cache
  playlistIds.forEach(id => {
    if (playlistCache[id] && !result[id]) result[id] = playlistCache[id];
  });

  return result;
};

/**
 * Enrich playlist objects with real thumbnails and video counts from YouTube API.
 */
const enrichPlaylists = async (playlists, apiKey) => {
  if (!apiKey) return playlists;
  const ids = playlists.map(p => p.id);
  const details = await fetchPlaylistDetails(ids, apiKey);
  return playlists.map(p => {
    const d = details[p.id];
    if (!d) return p;
    return {
      ...p,
      thumbnail: d.thumbnail || null,
      videoCount: d.videoCount || p.videoCount || null,
      title: p.title || d.title,
      channel: p.channel || d.channel,
    };
  });
};

/**
 * Search YouTube via API if key available, otherwise return curated data
 */
const searchPlaylists = async (query, apiKey, maxResults = 5) => {
  if (!apiKey) return getCuratedPlaylists(query);

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: `${query} DSA data structures algorithms tutorial`,
        type: 'playlist',
        maxResults,
        key: apiKey,
        relevanceLanguage: 'en',
      },
      timeout: 10000,
    });

    return response.data.items.map(item => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('YouTube API search error, using curated data:', error.message);
    return getCuratedPlaylists(query);
  }
};

/**
 * Get videos from a playlist via API
 */
const getPlaylistVideos = async (playlistId, apiKey, maxResults = 25) => {
  if (!apiKey) return getCuratedVideos(playlistId);

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults,
        key: apiKey,
      },
      timeout: 10000,
    });

    return response.data.items.map(item => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      description: item.snippet.description,
      position: item.snippet.position,
    }));
  } catch (error) {
    console.error('YouTube playlist videos fetch error:', error.message);
    return [];
  }
};

/**
 * Get curated playlists for a topic (no API key needed)
 */
const getCuratedPlaylists = (topic) => {
  const playlists = CURATED_PLAYLISTS[topic] || CURATED_PLAYLISTS['_general'];
  const generalPlaylists = topic !== '_general' ? (CURATED_PLAYLISTS['_general'] || []).slice(0, 1) : [];
  return [...playlists, ...generalPlaylists];
};

/**
 * Get curated videos for a topic
 */
const getCuratedVideos = (topic) => {
  return CURATED_VIDEOS[topic] || CURATED_VIDEOS['Array'];
};

/**
 * Get recommended playlists enriched with real thumbnails from YouTube API
 */
const getRecommendedPlaylists = async (weakTopics, skillLevel, apiKey) => {
  const recommended = [];
  const levelMap = {
    'Beginner': 'beginner', 'Intermediate': 'intermediate',
    'Advanced': 'advanced', 'Expert': 'advanced', 'Master': 'advanced',
  };
  const userLevel = levelMap[skillLevel] || 'beginner';

  for (const topic of weakTopics) {
    const playlists = CURATED_PLAYLISTS[topic] || [];
    const matched = playlists.filter(p => p.level === userLevel);
    const fallback = playlists.filter(p => p.level !== userLevel);
    recommended.push(...(matched.length > 0 ? matched : fallback).slice(0, 2));
  }

  if (recommended.length < 3) {
    recommended.push(...CURATED_PLAYLISTS['_general'].slice(0, 3 - recommended.length));
  }

  const limited = recommended.slice(0, 8);
  return enrichPlaylists(limited, apiKey);
};

/**
 * Get ALL topic playlists, each enriched with real thumbnails (batch fetched)
 */
const getAllPlaylistsEnriched = async (apiKey) => {
  // Collect all unique playlist IDs
  const allItems = Object.values(CURATED_PLAYLISTS).flat();
  if (apiKey) {
    const ids = [...new Set(allItems.map(p => p.id))];
    await fetchPlaylistDetails(ids, apiKey); // Pre-warm the cache
  }

  const allPlaylists = {};
  for (const [topic, playlists] of Object.entries(CURATED_PLAYLISTS)) {
    allPlaylists[topic] = await enrichPlaylists(playlists, apiKey);
  }
  return allPlaylists;
};

module.exports = {
  searchPlaylists,
  getPlaylistVideos,
  getCuratedPlaylists,



  
  getCuratedVideos,
  getRecommendedPlaylists,
  getAllPlaylistsEnriched,
  enrichPlaylists,
  CURATED_PLAYLISTS,
  CURATED_VIDEOS,
};
