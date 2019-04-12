const path = require('path');
const cacheDir = path.resolve(__dirname, '..', 'data');
const githubData = path.join(cacheDir, 'github-data.json');
const prData = path.join(cacheDir, 'pr-data.json');
const issueData = path.join(cacheDir, 'issue-data.json');

module.exports.cacheDir = cacheDir;
module.exports.githubData = githubData;
module.exports.prData = prData;
module.exports.issueData = issueData;
