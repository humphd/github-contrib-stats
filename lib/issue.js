const github = require('../lib/gh-api.js');
const GitHubObject = require('../lib/github-object.js');

class Issue extends GitHubObject {
  constructor(owner, repo, issue_number) {
    function operation() {
      return github.issues.get({owner, repo, issue_number});
    }
    super(owner, repo, operation, 'issue');

    this.cacheFilename = `issue-${owner}-${repo}-${issue_number}.json`;
    this.number = issue_number;
  }
}

module.exports = Issue;
