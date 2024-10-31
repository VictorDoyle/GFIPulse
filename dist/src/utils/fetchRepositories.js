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
exports.fetchRepositories = fetchRepositories;
// src/utils/fetchRepositories
const axios_1 = __importDefault(require("axios"));
const repositories_1 = require("./../constants/repositories");
const GH_TOKEN = process.env.GH_TOKEN;
// start with simple query - TODO: dynamic filter via discord cmd
const SEARCH_QUERY = 'state:open language:JavaScript language:TypeScript';
function fetchRepositories() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const repos = [];
        // check self rate limiting
        const rateLimitUrl = `https://api.github.com/rate_limit`;
        try {
            const rateLimitResponse = yield axios_1.default.get(rateLimitUrl, {
                headers: { Authorization: `Bearer ${GH_TOKEN}` },
            });
            console.log('Rate Limit Info:', rateLimitResponse.data);
        }
        catch (error) {
            console.error('Error fetching rate limit info:', error);
            return [];
        }
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(SEARCH_QUERY)}&per_page=${repositories_1.MAX_REPOS}`;
        try {
            const response = yield axios_1.default.get(url, {
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
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error fetching repositories:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error('Unexpected error fetching repositories:', error);
            }
            return [];
        }
    });
}
