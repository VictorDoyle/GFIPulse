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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepositories = getRepositories;
const fetchRepositories_1 = require("../utils/fetchRepositories");
let cachedRepositories = [];
let lastFetchedTime = null;
const REFETCH_INTERVAL = 12 * 60 * 60 * 1000; // Refresh every 12 hours
// get repo list from cache or API
function getRepositories() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        // if cache is stale or not yet fetched, retry
        if (!lastFetchedTime || now - lastFetchedTime > REFETCH_INTERVAL) {
            console.log('Fetching repositories from GitHub...');
            cachedRepositories = yield (0, fetchRepositories_1.fetchRepositories)();
            lastFetchedTime = now;
        }
        else {
            console.log('Using cached repositories');
        }
        return cachedRepositories;
    });
}
