const github = require('../lib/gh-api.js');
const GitHubObject = require('../lib/github-object.js');

class Issue extends GitHubObject {
  constructor(owner, repo, number) {
    function operation() {
      return github.issues.get({owner, repo, number});
    }
    super(owner, repo, operation, 'issue');

    this.cacheFilename = `issue-${owner}-${repo}-${number}.json`;
    this.number = number;
  }
}

module.exports = Issue;
