const github = require('../lib/gh-api.js');
const GitHubObject = require('../lib/github-object.js');

class PullRequest extends GitHubObject {
  constructor(owner, repo, number) {
    function operation() {
      return github.pulls.get({owner, repo, number});
    }
    super(owner, repo, operation, 'pr');

    this.cacheFilename = `pr-${owner}-${repo}-${number}.json`;
    this.number = number;
  }
}

module.exports = PullRequest;
