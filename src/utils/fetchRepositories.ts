// src/utils/fetchRepositories
import axios from 'axios';

const GH_TOKEN = process.env.GH_TOKEN!;

// start with simple query - TODO: dynamic filter via discord cmd
export async function fetchIssues(page: number) {
  const url = `https://api.github.com/search/issues?q=label:"good first issue"+is:open+language:JavaScript+language:TypeScript&page=${page}`;
  const rateLimitUrl = `https://api.github.com/rate_limit`;
  const headers = { Authorization: `Bearer ${GH_TOKEN}` };

  try {
    const rateLimitResponse = await axios.get(rateLimitUrl, { headers });
    console.log('Rate Limit Info:', rateLimitResponse.data);
  } catch (error) {
    console.error('Error fetching rate limit info:', error);
    return [];
  }

  try {
    const response = await axios.get(url, { headers });
    const items = response.data.items;

    if (!Array.isArray(items)) {
      console.error(`Expected response.data.items to be an array, got:`, items);
      return [];
    }

    if (response.data.total_count === 0) {
      console.warn('No issues found matching the query.');
    }

    return items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching issues:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching issues:', error);
    }
    return [];
  }
}