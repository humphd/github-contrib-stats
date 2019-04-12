require('../lib/env.js');

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { cacheDir } = require('../lib/cache-dir');
const debug = process.env.DEBUG == 1;

class GitHubObject {
  constructor(owner, repo, operation, type) {
    this.owner = owner;
    this.repo = repo;
    this.fullName = `${owner}/${repo}`;

    // GitHub API operation to run, returns a Promise
    this.operation = operation;
    // GithHub Object type (e.g., 'pull request', 'issue', 'repo')
    this.type = type;
  }

  /**
   * Check for cached data, or run download data
   * from GitHub API. `github` should already be setup.
   */
  getGitHubData() {
    const cachePath = path.join(cacheDir, this.cacheFilename);
    const owner = this.owner;
    const repo = this.repo;
    const number = this.number;
    const type = this.type;

    function log(msg) {
      if(!debug) return;

      const info = number ? `${owner}/${repo}/${type}/${number}` : `${owner}/${repo}`;
      console.log(`[${chalk.yellow(info)}] ${msg}`);
    }
    
    return new Promise((resolve, reject) => {
      // Step 1. see if we have this data cached already
      try {
        const data = require(cachePath);
        log(chalk.blue(`Using cached response from ${cachePath}`));
        return resolve(data);
      } catch(e) {
        log(`No cached response, using GitHub API`);
      }
  
      this.operation()
        .then(result => {
          log(chalk.green(`Got GitHub API response, caching`));

          // Cache the result before returning it
          fs.writeFile(cachePath, JSON.stringify(result, null, 2), err => {
            if(err) {
              console.warn(chalk.red(`Unable to cache response: ${err.message}`));
              return reject(err);
            }

            console.warn(chalk.blue(`Cached response to ${cachePath}`));
            resolve(result);
          });
        })
        .catch(err => {
          log(chalk.red(`Got error from GitHub API: ${err.message}`));
          reject(err);
        });
    });
  }
}

module.exports = GitHubObject;
