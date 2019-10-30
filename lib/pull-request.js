const github = require('../lib/gh-api.js');
const GitHubObject = require('../lib/github-object.js');

class PullRequest extends GitHubObject {
  constructor(owner, repo, pull_number) {
    function operation() {
      return github.pulls.get({owner, repo, pull_number});
    }
    super(owner, repo, operation, 'pr');

    this.cacheFilename = `pr-${owner}-${repo}-${pull_number}.json`;
    this.number = pull_number;
  }
}

module.exports = PullRequest;
