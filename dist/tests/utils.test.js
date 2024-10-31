"use strict";
// tests/utils.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const discordMessage_1 = require("../src/utils/discordMessage");
describe('Utility Functions', () => {
    test('formatIssueMessage should return correct formatted message', () => {
        const issue = {
            title: 'Sample Issue',
            html_url: 'https://github.com/sample/sample/issues/1',
            labels: [{ name: 'good first issue' }],
            created_at: new Date().toISOString(),
            comments: 3,
        };
        const message = (0, discordMessage_1.formatIssueMessage)(issue, 'sample/sample');
        expect(message).toContain('Sample Issue');
        expect(message).toContain('good first issue');
        expect(message).toContain('3');
    });
});
