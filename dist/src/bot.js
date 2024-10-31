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
exports.fetchIssues = fetchIssues;
exports.postIssuesToDiscord = postIssuesToDiscord;
exports.monitorIssues = monitorIssues;
// src/bot.ts
require("dotenv/config");
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const repositories_1 = require("./constants/repositories");
const discordMessage_1 = require("./utils/discordMessage");
const storeIssues_1 = require("./utils/storeIssues");
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GH_TOKEN = process.env.GH_TOKEN;
if (!DISCORD_TOKEN || !CHANNEL_ID || !GH_TOKEN) {
    throw new Error("Please define DISCORD_TOKEN, CHANNEL_ID, and GH_TOKEN in GitHub Secrets.");
}
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages] });
// NOTE: export for e2e and unit tests
function fetchIssues(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.github.com/search/issues?q=label:"good first issue"+is:open&page=${page}`;
        console.log(`Fetching issues from URL: ${url}`);
        try {
            const response = yield axios_1.default.get(url, {
                headers: { Authorization: `Bearer ${GH_TOKEN}` },
            });
            // console.log(`Fetched ${response.data.total_count} issues from GitHub on page ${page}`);
            if (!Array.isArray(response.data.items)) {
                console.error(`Expected response.data.items to be an array, got:`, response.data.items);
                return [];
            }
            return response.data.items;
        }
        catch (error) {
            console.error(`Error fetching issues:`, error);
            return [];
        }
    });
}
function postIssuesToDiscord(issues, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = client.channels.cache.get(CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            for (const issue of issues) {
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
        console.log('Starting to monitor git repo issues to fix...');
        const fetchedIssueIds = (0, storeIssues_1.readFetchedIssues)();
        const newIssues = [];
        let page = 1;
        let hasMoreIssues = true;
        while (hasMoreIssues && newIssues.length < repositories_1.MAX_REPOS) {
            const issues = yield fetchIssues(page);
            if (issues.length === 0) {
                console.log(`No more issues found on page ${page}.`);
                hasMoreIssues = false;
                break;
            }
            else {
                // skip resending already fetched issues
                const filteredIssues = issues.filter((issue) => !fetchedIssueIds.has(issue.id.toString()));
                console.log(`Found ${filteredIssues.length} new issues on page ${page}`);
                newIssues.push(...filteredIssues);
                page++;
            }
        }
        // when bot sends to discord, update stored issues
        if (newIssues.length > 0) {
            const issuesToSend = newIssues.slice(0, repositories_1.MAX_REPOS);
            // each issue linked to repo name
            for (const issue of issuesToSend) {
                const repoName = issue.repository.full_name;
                yield postIssuesToDiscord([issue], repoName);
            }
            const newIssueIds = issuesToSend.map(issue => issue.id.toString());
            (0, storeIssues_1.writeFetchedIssues)(newIssueIds);
        }
        else {
            console.log('No new issues to send.');
        }
    });
}
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
    yield monitorIssues();
    // running cron job via gitactions so we make sure npm start gracefully exits on completion
    process.exit(0);
}));
client.login(DISCORD_TOKEN);
