// tests/utils.test.ts

import { formatIssueMessage } from '../src/utils/discordMessage';

describe('Utility Functions', () => {
  test('formatIssueMessage should return correct formatted message', () => {
    const issue = {
      title: 'Sample Issue',
      html_url: 'https://github.com/sample/sample/issues/1',
      labels: [{ name: 'good first issue' }],
      created_at: new Date().toISOString(),
      comments: 3,
    };

    const message = formatIssueMessage(issue, 'sample/sample');

    expect(message).toContain('Sample Issue');
    expect(message).toContain('good first issue');
    expect(message).toContain('3');
  });
});
