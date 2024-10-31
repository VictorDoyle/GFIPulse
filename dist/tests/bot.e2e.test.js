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
const discord_js_1 = require("discord.js");
const nock_1 = __importDefault(require("nock"));
const bot_1 = require("../src/bot");
const fetchRepositories_1 = require("../src/utils/fetchRepositories");
const discordMessage_1 = require("../src/utils/discordMessage");
// Mock realistic GitHub API responses
const mockGithubData = {
    repositories: {
        total_count: 1,
        items: [
            {
                full_name: 'test-org/test-repo',
                archived: false,
                disabled: false,
                html_url: 'https://github.com/test-org/test-repo',
            },
        ],
    },
    issues: [
        {
            title: 'Test Issue',
            html_url: 'https://github.com/test-org/test-repo/issues/1234',
            labels: [
                { name: 'good first issue' },
                { name: 'bug' },
            ],
            created_at: '2024-01-01T00:00:00Z',
            comments: 3,
            user: {
                login: 'testuser',
                avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
            },
            body: 'This is a test issue body',
        },
    ],
};
// Create a mock channel object with the send function
const mockSend = jest.fn().mockResolvedValue({});
const mockChannel = {
    isTextBased: () => true,
    send: mockSend,
};
// Mock the Discord.js Client class
jest.mock('discord.js', () => {
    const actualDiscord = jest.requireActual('discord.js');
    return Object.assign(Object.assign({}, actualDiscord), { Client: jest.fn().mockImplementation(() => ({
            channels: {
                cache: new Map([['mock-channel-id', mockChannel]]),
            },
            once: jest.fn(),
            login: jest.fn(),
        })) });
});
describe('Discord Bot E2E Tests', () => {
    let client;
    beforeAll(() => {
        nock_1.default.disableNetConnect();
    });
    afterAll(() => {
        nock_1.default.enableNetConnect();
    });
    beforeEach(() => {
        jest.clearAllMocks();
        nock_1.default.cleanAll();
        // Initialize the mocked client before each test
        client = new discord_js_1.Client(); // Create an instance of the mocked Client
        // Mock environment variables
        process.env.DISCORD_TOKEN = 'mock-discord-token';
        process.env.CHANNEL_ID = 'mock-channel-id';
        process.env.GH_TOKEN = 'mock-github-token';
        // Mock rate limit
        (0, nock_1.default)('https://api.github.com')
            .get('/rate_limit')
            .reply(200, {
            resources: {
                core: {
                    limit: 5000,
                    remaining: 4999,
                    reset: 1672531200,
                },
            },
        });
        // Mock repository search
        (0, nock_1.default)('https://api.github.com')
            .get('/search/repositories')
            .query(true) // Accept any query parameters
            .reply(200, mockGithubData.repositories);
        // Mock issues endpoint with exact URL including query parameters
        (0, nock_1.default)('https://api.github.com')
            .get('/repos/test-org/test-repo/issues')
            .query({
            state: 'open',
            labels: 'good first issue',
        })
            .reply(200, mockGithubData.issues);
    });
    describe('fetchRepositories', () => {
        it('should fetch repositories successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const repos = yield (0, fetchRepositories_1.fetchRepositories)();
            expect(repos).toEqual(['test-org/test-repo']);
        }));
        it('should handle rate limit exceeded', () => __awaiter(void 0, void 0, void 0, function* () {
            nock_1.default.cleanAll();
            (0, nock_1.default)('https://api.github.com')
                .get('/rate_limit')
                .reply(403, { message: 'API rate limit exceeded' });
            const repos = yield (0, fetchRepositories_1.fetchRepositories)();
            expect(repos).toEqual([]);
        }));
    });
    describe('fetchIssues', () => {
        it('should fetch issues successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const issues = yield (0, bot_1.fetchIssues)('test-org/test-repo');
            expect(issues).toEqual(mockGithubData.issues);
        }));
        it('should handle fetch issues error', () => __awaiter(void 0, void 0, void 0, function* () {
            nock_1.default.cleanAll();
            (0, nock_1.default)('https://api.github.com')
                .get('/repos/test-org/test-repo/issues')
                .query({
                state: 'open',
                labels: 'good first issue',
            })
                .reply(404, { message: 'Not Found' });
            const issues = yield (0, bot_1.fetchIssues)('test-org/test-repo');
            expect(issues).toEqual([]);
        }));
    });
    describe('postIssuesToDiscord', () => {
        it('should post issues to Discord channel', () => __awaiter(void 0, void 0, void 0, function* () {
            const channelMock = client.channels.cache.get('mock-channel-id');
            yield (0, bot_1.postIssuesToDiscord)(mockGithubData.issues, 'test-org/test-repo');
            expect(channelMock.send).toHaveBeenCalledTimes(1);
            expect(channelMock.send).toHaveBeenCalledWith(expect.stringContaining('Test Issue'));
        }));
        it('should handle Discord send error', () => __awaiter(void 0, void 0, void 0, function* () {
            const channelMock = client.channels.cache.get('mock-channel-id');
            channelMock.send.mockRejectedValueOnce(new Error('Discord API error'));
            yield expect((0, bot_1.postIssuesToDiscord)(mockGithubData.issues, 'test-org/test-repo')).resolves.not.toThrow();
        }));
    });
    describe('monitorIssues', () => {
        it('should monitor issues and post to Discord', () => __awaiter(void 0, void 0, void 0, function* () {
            const channelMock = client.channels.cache.get('mock-channel-id');
            yield (0, bot_1.monitorIssues)();
            expect(channelMock.send).toHaveBeenCalledTimes(1);
            expect(channelMock.send).toHaveBeenCalledWith(expect.stringContaining('Test Issue'));
        }));
        it('should handle no repositories found', () => __awaiter(void 0, void 0, void 0, function* () {
            nock_1.default.cleanAll();
            (0, nock_1.default)('https://api.github.com')
                .get('/rate_limit')
                .reply(200, { resources: { core: { remaining: 5000 } } });
            (0, nock_1.default)('https://api.github.com')
                .get('/search/repositories')
                .query(true)
                .reply(200, { total_count: 0, items: [] });
            const channelMock = client.channels.cache.get('mock-channel-id');
            yield (0, bot_1.monitorIssues)();
            expect(channelMock.send).not.toHaveBeenCalled();
        }));
    });
    describe('formatIssueMessage', () => {
        it('should format issue message correctly', () => {
            const issue = mockGithubData.issues[0];
            const message = (0, discordMessage_1.formatIssueMessage)(issue, 'test-org/test-repo');
            expect(message).toContain('test-org/test-repo');
            expect(message).toContain('Test Issue');
            expect(message).toContain('good first issue');
            expect(message).toContain(issue.html_url);
        });
        it('should handle issues with no labels', () => {
            const issue = Object.assign(Object.assign({}, mockGithubData.issues[0]), { labels: [] });
            const message = (0, discordMessage_1.formatIssueMessage)(issue, 'test-org/test-repo');
            expect(message).toContain('No label');
        });
    });
});
