// src/utils/discordMessage.ts

export function formatIssueMessage(issue: any, repo: string): string {
  return `📢📢📢 **New Github Issue Alert** 📢📢📢
**Repository**: ${repo}  
**Title**: [${issue.title}](${issue.html_url})  
**Label**: ${issue.labels.map((label: any) => label.name).join(', ') || 'No label'}  
**Created On**: ${new Date(issue.created_at).toLocaleDateString()}  
**Comments**: ${issue.comments || 0}`;
}
