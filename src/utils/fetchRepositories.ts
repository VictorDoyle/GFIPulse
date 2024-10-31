import axios from 'axios';

const GH_TOKEN = process.env.GH_TOKEN!;

// start with simple query - TODO: dynamic filter via discord cmd
const SEARCH_QUERY = 'state:open language:JavaScript language:TypeScript';
const MAX_REPOS = 10; // limit to 10 for firstphase

export async function fetchRepositories(): Promise<string[]> {
  const repos: string[] = [];

  // check self rate limiting
  const rateLimitUrl = `https://api.github.com/rate_limit`;
  try {
    const rateLimitResponse = await axios.get(rateLimitUrl, {
      headers: { Authorization: `Bearer ${GH_TOKEN}` },
    });
    console.log('Rate Limit Info:', rateLimitResponse.data);
  } catch (error) {
    console.error('Error fetching rate limit info:', error);
    return [];
  }

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(SEARCH_QUERY)}&order=desc&per_page=${MAX_REPOS}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${GH_TOKEN}` },
    });

    // use for debug if needed
    // console.log(`API response:`, response.data); 

    if (response.data.total_count === 0) {
      console.warn('No repositories found matching the query.');
    }

    for (const repo of response.data.items) {
      // skip readonly or archived
      if (!repo.archived && !repo.disabled) {
        repos.push(repo.full_name); // format: "owner/repo"
      }
    }

    console.log(`Fetched repositories: ${repos.length}`);
    return repos;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching repositories:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error fetching repositories:', error);
    }
    return [];
  }
}
