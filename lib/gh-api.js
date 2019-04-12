require('../lib/env.js');

const Octokit = require('@octokit/rest')
  .plugin(require('@octokit/plugin-throttling'))
  .plugin(require('@octokit/plugin-retry'));

const github = new Octokit({
  auth: 'token ' + process.env.GH_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      if (options.request.retryCount === 0) { // only retries once
        console.log(`Retrying after ${retryAfter} seconds`);
        return true;
      }
    },
    onAbuseLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
    }
  }
});

module.exports = github;
