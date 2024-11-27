// src/utils/storeIssues.ts
import fs from 'fs';
import path from 'path';

const storageFilePath = path.resolve(__dirname, '../../data/fetched_issues.json');

export function readFetchedIssues(): Set<string> {
  if (fs.existsSync(storageFilePath)) {
    const data = fs.readFileSync(storageFilePath, 'utf-8');
    return new Set(JSON.parse(data));
  }
  return new Set();
}

export function writeFetchedIssues(issueIds: string[]) {
  const existingIssues = readFetchedIssues();
  const updatedIssues = new Set([...existingIssues, ...issueIds]);
  fs.writeFileSync(storageFilePath, JSON.stringify(Array.from(updatedIssues), null, 2));
}
