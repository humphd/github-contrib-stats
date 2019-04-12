const github = require('../lib/gh-api.js');
const GitHubObject = require('../lib/github-object.js');

class Repo extends GitHubObject {
  constructor(owner, repo, number) {
    function operation() {
      return github.repos.get({owner, repo});
    }
    super(owner, repo, operation, 'repo');

    this.cacheFilename = `repo-${owner}-${repo}.json`;
    this.number = number;
  }
}

module.exports = Repo;
