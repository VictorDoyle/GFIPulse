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
// src/utils/fetchRepositories
const axios_1 = __importDefault(require("axios"));
const GH_TOKEN = process.env.GH_TOKEN;
// start with simple query - TODO: dynamic filter via discord cmd
function fetchIssues(page) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const url = `https://api.github.com/search/issues?q=label:"good first issue"+is:open+language:JavaScript+language:TypeScript&page=${page}`;
        const rateLimitUrl = `https://api.github.com/rate_limit`;
        const headers = { Authorization: `Bearer ${GH_TOKEN}` };
        try {
            const rateLimitResponse = yield axios_1.default.get(rateLimitUrl, { headers });
            console.log('Rate Limit Info:', rateLimitResponse.data);
        }
        catch (error) {
            console.error('Error fetching rate limit info:', error);
            return [];
        }
        try {
            const response = yield axios_1.default.get(url, { headers });
            const items = response.data.items;
            if (!Array.isArray(items)) {
                console.error(`Expected response.data.items to be an array, got:`, items);
                return [];
            }
            if (response.data.total_count === 0) {
                console.warn('No issues found matching the query.');
            }
            return items;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error fetching issues:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error('Unexpected error fetching issues:', error);
            }
            return [];
        }
    });
}
