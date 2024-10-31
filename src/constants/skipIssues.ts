// src/constants/skipIssues.ts
/* TODO: Make this dynamic via discord command to allow for user to set this */
export const skipWords = ['cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'blockchain', 'decentralized', 'ledger', 'nft', 'non-fungible', 'token', 'mint', 'cryptoart', 'airdrop', 'smart contract', 'erc-721', 'erc-1155', 'altcoin'];

export function containsSkipWords(title: string): boolean {
  return skipWords.some((word) => title.toLowerCase().includes(word.toLowerCase()));
}
