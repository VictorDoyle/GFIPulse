import { createClient } from 'redis';

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

const REDIS_KEY = 'fetched_issues';

// flag to ensure that we only connect once
let isConnected = false;

async function connectRedis() {
  if (isConnected) return; // if already connected, do nothing

  try {
    await client.connect();
    isConnected = true;
    console.log('Connected to Redis Cloud');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    process.exit(1);
  }
}

export async function readFetchedIssues(): Promise<Set<string>> {
  await connectRedis(); // ensures that Redis is connected only once
  const issueIds = await client.sMembers(REDIS_KEY);
  return new Set(issueIds);
}

// write IDs to Redis
export async function writeFetchedIssues(issueIds: string[]) {
  await connectRedis(); // ensures that Redis is connected only once

  // add the issue IDs directly to the set
  for (const id of issueIds) {
    await client.sAdd(REDIS_KEY, id);
  }

  const allIssueIds = await client.sMembers(REDIS_KEY);
  // debug log for now
  console.log('All stored issue IDs:', allIssueIds);

  // TODO: start with a limit of 250 iff not good bump to 500
  const maxSize = 250;
  const currentSize = await client.sCard(REDIS_KEY);

  if (currentSize > maxSize) {
    const excess = currentSize - maxSize;
    await client.sPop(REDIS_KEY, excess);
    console.log(`Trimmed ${excess} old issue IDs to minimize bloat.`);
  }
}
