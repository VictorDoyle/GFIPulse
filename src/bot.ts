import 'dotenv/config';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// array of repos to scan for issues (format: "owner/repo")
const REPOSITORIES = ["octocat/Hello-World", "openai/gym"]; // TODO: refactor to known list

if (!DISCORD_TOKEN || !CHANNEL_ID || !GITHUB_TOKEN) {
  throw new Error("Please define DISCORD_TOKEN, CHANNEL_ID, and GITHUB_TOKEN in GitHub Secrets.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

async function fetchIssues(repo: string) {
  // TODO: dynamic label fetching in v2
  const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=Good%20first%20issue`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching issues from ${repo}:`, error);
    return [];
  }
}

// send to Discord
async function postIssuesToDiscord(issues: any[], repo: string) {
  const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;
  if (!channel) return;

  issues.forEach(issue => {
    channel.send(`New issue in **${repo}**: [${issue.title}](${issue.html_url})`);
  });
}

// monitor issue tasks in github repos
async function monitorIssues() {
  for (const repo of REPOSITORIES) {
    const issues = await fetchIssues(repo);
    if (issues.length) {
      postIssuesToDiscord(issues, repo);
    }
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  setInterval(monitorIssues, 0 * 0 * 0); // FIXME: check every 6 hours or find good time here
});

client.login(DISCORD_TOKEN);
