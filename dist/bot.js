"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const repositories_1 = require("./constants/repositories");
const discordMessage_1 = require("./utils/discordMessage");
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GH_TOKEN = process.env.GH_TOKEN;
if (!DISCORD_TOKEN || !CHANNEL_ID || !GH_TOKEN) {
    throw new Error("Please define DISCORD_TOKEN, CHANNEL_ID, and GH_TOKEN in GitHub Secrets.");
}
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages] });
const LABELS = ["Good first issue", "beginner", "help wanted"];
const labelList = LABELS.map(encodeURIComponent).join(',');
function fetchIssues(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.github.com/repos/${repo}/issues?state=open&labels=good%20first%20issue`;
        console.log(`Fetching issues from URL: ${url}`);
        try {
            const response = yield axios_1.default.get(url, {
                headers: { Authorization: `Bearer ${GH_TOKEN}` },
            });
            console.log(`Fetched ${response.data.length} issues from ${repo}`);
            // Check the structure of the fetched issues
            if (response.data.length === 0) {
                console.warn(`No issues found for ${repo}.`);
            }
            else {
                console.log('Issues data:', response.data);
            }
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching issues from ${repo}:`, error);
            return [];
        }
    });
}
function postIssuesToDiscord(issues, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            for (const issue of issues) {
                // Check if issue has the required properties
                console.log(`Formatting message for issue:`, issue);
                const issueMessage = (0, discordMessage_1.formatIssueMessage)(issue, repo);
                console.log(`Sending message to Discord: ${issueMessage}`);
                try {
                    yield channel.send(issueMessage);
                    console.log(`Sent message for issue: ${issue.title}`);
                }
                catch (sendError) {
                    console.error(`Failed to send message for issue ${issue.title}:`, sendError);
                }
            }
        }
        else {
            console.error('Channel not found or is not a text channel.');
        }
    });
}
function monitorIssues() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting to monitor issues...');
        const repos = yield (0, repositories_1.getRepositories)();
        console.log(`Repositories to monitor: ${repos.length}`);
        for (const repo of repos) {
            console.log(`Fetching issues for ${repo}...`);
            const issues = yield fetchIssues(repo);
            console.log(`Found ${issues.length} issues for ${repo}`);
            if (issues.length) {
                yield postIssuesToDiscord(issues, repo);
            }
        }
    });
}
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
    yield monitorIssues();
    setInterval(monitorIssues, 120 * 1000); // Check every 120 seconds for new issues
}));
client.login(DISCORD_TOKEN);
