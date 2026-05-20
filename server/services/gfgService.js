const axios = require('axios');
const cheerio = require('cheerio');

const GFG_BASE = 'https://www.geeksforgeeks.org/user';

/**
 * Fetch GFG user profile by scraping the public profile page
 */
const fetchUserProfile = async (username) => {
  // GFG has a public API endpoint for user profiles
  try {
    const response = await axios.get(`https://geeks-for-geeks-api.vercel.app/${username}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartDSATracker/1.0',
      },
    });

    const data = response.data;

    return {
      username: username,
      totalSolved: parseInt(data.totalProblemsSolved) || 0,
      easySolved: parseInt(data.School) || 0 + parseInt(data.Basic) || 0,
      mediumSolved: parseInt(data.Easy) || 0 + parseInt(data.Medium) || 0,
      hardSolved: parseInt(data.Hard) || 0,
      codingScore: parseInt(data.codingScore) || 0,
      instituteRank: data.instituteRank || 'N/A',
    };
  } catch (apiError) {
    // Fallback: try direct scraping
    return await scrapeProfile(username);
  }
};

/**
 * Fallback: Scrape GFG profile page directly
 */
const scrapeProfile = async (username) => {
  const response = await axios.get(`${GFG_BASE}/${username}/`, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const $ = cheerio.load(response.data);

  // Try to extract problem counts from the profile page
  let totalSolved = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  // Look for problem count elements (GFG changes their DOM frequently)
  const scoreCards = $('[class*="scoreCard"]');
  scoreCards.each((_, el) => {
    const text = $(el).text().toLowerCase();
    const numMatch = text.match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      if (text.includes('total') || text.includes('problem')) totalSolved = num;
    }
  });

  // Try alternate selectors
  if (totalSolved === 0) {
    $('[class*="solved"]').each((_, el) => {
      const numMatch = $(el).text().match(/(\d+)/);
      if (numMatch) totalSolved = parseInt(numMatch[1]);
    });
  }

  // Estimate difficulty distribution if not available
  if (totalSolved > 0 && easySolved === 0) {
    easySolved = Math.round(totalSolved * 0.4);
    mediumSolved = Math.round(totalSolved * 0.4);
    hardSolved = totalSolved - easySolved - mediumSolved;
  }

  return {
    username,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    codingScore: 0,
    instituteRank: 'N/A',
  };
};

module.exports = {
  fetchUserProfile,
};
