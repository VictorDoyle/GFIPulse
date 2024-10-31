import { fetchRepositories } from '../utils/fetchRepositories';

let cachedRepositories: string[] = [];
let lastFetchedTime: number | null = null;
const REFETCH_INTERVAL = 12 * 60 * 60 * 1000; // refetch every 12 hours

// get repo list from cache or API
export async function getRepositories(): Promise<string[]> {
  const now = Date.now();

  // if cache is stale or not yet fetched, retry
  if (!lastFetchedTime || now - lastFetchedTime > REFETCH_INTERVAL) {
    console.log('Fetching repositories from GitHub...');
    cachedRepositories = await fetchRepositories();
    lastFetchedTime = now;
  } else {
    console.log('Using cached repositories');
  }

  return cachedRepositories;
}
