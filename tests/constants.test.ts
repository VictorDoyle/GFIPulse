// src/bot.test.ts
import { containsSkipWords, skipWords } from '../src/constants/skipIssues';

describe('containsSkipWords', () => {
  it('should skip issues with titles containing skip words', () => {
    const testIssues = [
      { title: 'This is a valid issue' },
      { title: 'Crypto is a trending topic' },
      { title: 'Important updates on the project' },
      { title: 'New NFT release' },
      { title: 'Discussion about Telegram features' },
      { title: 'Some other issue' },
    ];

    testIssues.forEach(issue => {
      const isSkipped = containsSkipWords(issue.title);
      if (skipWords.some(word => issue.title.toLowerCase().includes(word))) {
        expect(isSkipped).toBe(true);
      } else {
        expect(isSkipped).toBe(false);
      }
    });
  });
});
