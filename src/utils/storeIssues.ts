import { createClient } from 'redis';

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

const REDIS_KEY = 'fetched_issues';

async function connectRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis Cloud');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
    process.exit(1);
  }
}

export async function readFetchedIssues(): Promise<Set<string>> {
  await connectRedis();
  const issueIds = await client.sMembers(REDIS_KEY);
  return new Set(issueIds);
}

// write IDs to Redis
export async function writeFetchedIssues(issueIds: string[]) {
  await connectRedis();

  // multi to allow multiple cmds
  const multi = client.multi();
  issueIds.forEach(id => multi.sAdd(REDIS_KEY, id));
  await multi.exec();


  // TODO: start with a limit of 250 iff not good bump to 500
  const maxSize = 250;
  const currentSize = await client.sCard(REDIS_KEY); // corrected from `redis.scard` to `client.sCard`

  if (currentSize > maxSize) {
    // trim set and shift forwards to keep free tier efficient
    const excess = currentSize - maxSize;
    await client.sPop(REDIS_KEY, excess); // corrected from `redis.spop` to `client.sPop`
    console.log(`Trimmed ${excess} old issue IDs to minimize bloat.`);
  }
}
