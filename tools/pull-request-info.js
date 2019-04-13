const fs = require('fs');
const PullRequest = require('../lib/pull-request.js');
const { cacheDir, githubData, prData } = require('../lib/cache-dir.js');

let pullRequests;

try {
  pullRequests = require(githubData).pullRequests;
} catch(e) {
  console.error('Unable to read github data JSON file', e.message);
  process.exit(1);
}

const stats = {
  total: pullRequests.length,
  students: {
  },
  languages: {
  },
  states: {
  },
  repos: {

  },
  merged: 0,
  commits: 0,
  additions: 0,
  deletions: 0,
  changed_files: 0,
  pr_deleted: 0
};

Promise.all(
  // Process all PRs
  pullRequests.map(
    pullRequestInfo => new Promise((resolve, reject) => {
      const owner = pullRequestInfo.owner;
      const repo = pullRequestInfo.repo;

      const pr = new PullRequest(owner, repo, pullRequestInfo.number);
      pr.getGitHubData(cacheDir)
        .then(result => {
          const data = result.data;

          stats.repos[owner] = stats.repos[owner] || { total: 0, repos: {} };
          stats.repos[owner].total++;
          stats.repos[owner].repos[repo] = typeof stats.repos[owner].repos[repo] === 'number' ?
            stats.repos[owner].repos[repo] + 1 : 1;

          const language = data.base.repo.language || 'Unknown';
          stats.languages[language] = typeof stats.languages[language] === 'number' ?
            stats.languages[language] + 1 : 1;

          const state = data.state;
          stats.states[state] = typeof stats.states[state] === 'number' ?
            stats.states[state] + 1 : 1;

          const student = data.user.login;
          stats.students[student] = typeof stats.students[student] === 'number' ?
            stats.students[student] + 1 : 1;

          stats.merged += data.merged;
          stats.commits += data.commits;
          stats.additions += data.additions;
          stats.deletions += data.deletions;
          stats.changed_files += data.changed_files;

          resolve();
        })
        .catch((err) => {
          // If PR is gone (404), just add as much info as we can
          if(err.status === 404) {
            stats.pr_deleted += 1;
            resolve();
          } else {
            reject(err);
          }
        });
    })
  )
)
.then(() => {
  stats.studentsTotal = Object.keys(stats.students).length;

  // sort repos by total, and produce list of top 25
  stats.topRepos = Object
    .keys(stats.repos)
    .sort((a, b) =>
      stats.repos[a].total > stats.repos[b].total
    ).reverse()
    .slice(0,25)
    .map(name => `${name} - (${stats.repos[name].total} PRs)`);

  fs.writeFile(prData, JSON.stringify(stats, null, 2), (err) => {
    if(err) {
      console.error(`unable to write ${prData}: ${err.message}`);
      return process.exit(1);
    }

    console.log(`wrote ${prData}`);
    process.exit(0);
  });

})
.catch(console.error);
