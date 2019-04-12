const fs = require('fs');
const Issue = require('../lib/issue.js');
const { cacheDir, githubData, issueData } = require('../lib/cache-dir.js');

let issues;

try {
  issues = require(githubData).issues;
} catch(e) {
  console.error('Unable to read github data JSON file', e.message);
  process.exit(1);
}

const stats = {
  total: issues.length,
  students: {
  },
  languages: {
  },
  states: {
  },
  repos: {
  },
  issues_deleted: 0
};

Promise.all(
  // Process all PRs
  issues.map(
    issueInfo => new Promise((resolve, reject) => {
      const owner = issueInfo.owner;
      const repo = issueInfo.repo;

      const issue = new Issue(owner, repo, issueInfo.number);
      issue.getGitHubData(cacheDir)
        .then(result => {
          const data = result.data;

          stats.repos[owner] = stats.repos[owner] || { total: 0, repos: {} };
          stats.repos[owner].total++;
          stats.repos[owner].repos[repo] = typeof stats.repos[owner].repos[repo] === 'number' ?
            stats.repos[owner].repos[repo] + 1 : 1;

          const state = data.state;
          stats.states[state] = typeof stats.states[state] === 'number' ?
            stats.states[state] + 1 : 1;

          const student = data.user.login;
          stats.students[student] = typeof stats.students[student] === 'number' ?
            stats.students[student] + 1 : 1;

          resolve();
        })
        .catch((err) => {
          // If PR is gone (404), just add as much info as we can
          if(err.status === 404 || err.status === 410) {
            stats.issues_deleted += 1;
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
  fs.writeFile(issueData, JSON.stringify(stats, null, 2), (err) => {
    if(err) {
      console.error(`unable to write ${issueData}: ${err.message}`);
      return process.exit(1);
    }

    console.log(`wrote ${issueData}`);
    process.exit(0);
  });

})
.catch(console.error);
