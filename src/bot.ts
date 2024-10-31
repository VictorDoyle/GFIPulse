// src/bot.ts
import 'dotenv/config';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';
import { MAX_REPOS } from './constants/repositories';
import { formatIssueMessage } from './utils/discordMessage';
import { readFetchedIssues, writeFetchedIssues } from './utils/storeIssues';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const CHANNEL_ID = process.env.CHANNEL_ID!;
const GH_TOKEN = process.env.GH_TOKEN!;

if (!DISCORD_TOKEN || !CHANNEL_ID || !GH_TOKEN) {
  throw new Error("Please define DISCORD_TOKEN, CHANNEL_ID, and GH_TOKEN in GitHub Secrets.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// NOTE: export for e2e and unit tests
export async function fetchIssues(page: number) {
  const url = `https://api.github.com/search/issues?q=label:"good first issue"+is:open&page=${page}`;
  console.log(`Fetching issues from URL: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${GH_TOKEN}` },
    });

    // console.log(`Fetched ${response.data.total_count} issues from GitHub on page ${page}`);

    if (!Array.isArray(response.data.items)) {
      console.error(`Expected response.data.items to be an array, got:`, response.data.items);
      return [];
    }

    return response.data.items;
  } catch (error) {
    console.error(`Error fetching issues:`, error);
    return [];
  }
}


export async function postIssuesToDiscord(issues: any[], repo: string) {
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel && channel.isTextBased()) {
    for (const issue of issues) {
      console.log(`Formatting message for issue:`, issue);
      const issueMessage = formatIssueMessage(issue, repo);
      console.log(`Sending message to Discord: ${issueMessage}`);
      try {
        await (channel as TextChannel).send(issueMessage);
        console.log(`Sent message for issue: ${issue.title}`);
      } catch (sendError) {
        console.error(`Failed to send message for issue ${issue.title}:`, sendError);
      }
    }
  } else {
    console.error('Channel not found or is not a text channel.');
  }
}

export async function monitorIssues() {
  console.log('Starting to monitor GitHub issues...');
  const fetchedIssueIds = readFetchedIssues();
  const newIssues: any[] = [];

  let page = 1;
  let hasMoreIssues = true;

  while (hasMoreIssues && newIssues.length < MAX_REPOS) {
    const issues = await fetchIssues(page);

    if (issues.length === 0) {
      console.log(`No more issues found on page ${page}.`);
      hasMoreIssues = false;
      break;
    } else {
      // skip resending already fetched issues
      const filteredIssues = issues.filter((issue: { id: number; }) => !fetchedIssueIds.has(issue.id.toString()));
      console.log(`Found ${filteredIssues.length} new issues on page ${page}`);

      newIssues.push(...filteredIssues);

      page++;
    }
  }

  // when bot sends to Discord, update stored issues
  if (newIssues.length > 0) {
    const issuesToSend = newIssues.slice(0, MAX_REPOS);
    for (const issue of issuesToSend) {
      const repoName = issue.repository_url.split('/').slice(-2).join('/');
      await postIssuesToDiscord([issue], repoName);
    }
    const newIssueIds = issuesToSend.map(issue => issue.id.toString());
    writeFetchedIssues(newIssueIds);
  } else {
    console.log('No new issues to send.');
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  await monitorIssues();
  // running cron job via gitactions so we make sure npm start gracefully exits on completion
  process.exit(0);
});

client.login(DISCORD_TOKEN);
