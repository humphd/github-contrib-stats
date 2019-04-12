require('../lib/env.js');

const Repo = require('../lib/repo.js');
const PullRequest = require('../lib/pull-request.js');
const Issue = require('../lib/issue.js');
const { githubData } = require('../lib/cache-dir.js');

let repos;

try {
  repos = require(githubData).repos;
} catch(e) {
  console.error('Unable to read github data JSON file', e.message);
  process.exit(1);
}

Promise.all(
  Object.keys(repos).map(repoFullName => {
    const repoInfo = repos[repoFullName].info;
    const pullRequests = repos[repoFullName].pullRequests;
    const issues = repos[repoFullName].pullRequests;
    
    return Promise.all([
      // Process all PRs for this repo
      pullRequests.map(pullRequestInfo => {
        const pr = new PullRequest(repoInfo.owner, repoInfo.repo, pullRequestInfo.number);
        return pr.getGitHubData().catch(err => { /* ignore */});
      }),
      // Process all Issues for this repo
      issues.map(issueInfo => {
        const issue = new Issue(repoInfo.owner, repoInfo.repo, issueInfo.number);
        return issue.getGitHubData().catch(err => { /* ignore */});
      }),
      // Process Repo itself
      (new Repo(repoInfo.owner, repoInfo.repo)).getGitHubData().catch(err => { /* ignore */})
    ]);
  })
)
.catch(console.error);
