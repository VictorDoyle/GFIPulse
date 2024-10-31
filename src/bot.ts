// src/bot.ts
import 'dotenv/config';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';
import { getRepositories } from './constants/repositories';
import { formatIssueMessage } from './utils/discordMessage';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const CHANNEL_ID = process.env.CHANNEL_ID!;
const GH_TOKEN = process.env.GH_TOKEN!;

if (!DISCORD_TOKEN || !CHANNEL_ID || !GH_TOKEN) {
  throw new Error("Please define DISCORD_TOKEN, CHANNEL_ID, and GH_TOKEN in GitHub Secrets.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// NOTE: export for e2e and unit tests
export async function fetchIssues(repo: string) {
  // labels dont efficiently work when mapped and filtered - they need to be added as url query
  const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=good%20first%20issue`;
  console.log(`Fetching issues from URL: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${GH_TOKEN}` },
    });
    console.log(`Fetched ${response.data.length} issues from ${repo}`);

    if (response.data.length === 0) {
      console.warn(`No issues found for ${repo}.`);
    } else {
      console.log('Issues data:', response.data);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching issues from ${repo}:`, error);
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
  console.log('Starting to monitor issues...');
  const repos = await getRepositories();
  console.log(`Repositories to monitor: ${repos.length}`);
  for (const repo of repos) {
    console.log(`Fetching issues for ${repo}...`);
    const issues = await fetchIssues(repo);
    console.log(`Found ${issues.length} issues for ${repo}`);
    if (issues.length) {
      await postIssuesToDiscord(issues, repo);
    }
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  await monitorIssues();
  // running cron job via gitactions so we make sure npm start gracefully exits on completion
  process.exit(0);
});

client.login(DISCORD_TOKEN);
