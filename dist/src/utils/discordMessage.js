"use strict";
// src/utils/discordMessage.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIssueMessage = formatIssueMessage;
function formatIssueMessage(issue, repo) {
    return `📢📢📢 **New Github Issue Alert** 📢📢📢
**Repository**: ${repo}  
**Title**: [${issue.title}](${issue.html_url})  
**Label**: ${issue.labels.map((label) => label.name).join(', ') || 'No label'}  
**Created On**: ${new Date(issue.created_at).toLocaleDateString()}  
**Comments**: ${issue.comments || 0}`;
}
