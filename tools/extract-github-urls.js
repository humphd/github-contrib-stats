require('../lib/env.js');

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { githubData } = require('../lib/cache-dir');

const urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
let urls;

try {
  // Split list of URLs on spaces
  urls = process.env.URL_LIST.split(' +');
  // Remove dupes
  urls = [...new Set(urls)];
} catch(e) {
  console.error('Unable to read urls JSON file', e.message);
  process.exit(1);
}

/**
 * Data about github repos, PRs, and issues we'll collect.
 */
github = {
  repos: {},
  pullRequests: [],
  issues: []
};

function parsePullRequestUrl(url) {
  const prRegex = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
  const matches = url.match(prRegex);
  if(!matches) {
    return null
  }

  return {
    url: matches[0],
    owner: matches[1],
    repo: matches[2],
    number: matches[3]
  };
}

function parseIssueUrl(url) {
  const issueRegex = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
  const matches = url.match(issueRegex);
  if(!matches) {
    return null
  }

  return {
    url: matches[0],
    owner: matches[1],
    repo: matches[2],
    number: matches[3]
  };

}

function addOnce(item, list) {
  const itemJSON = JSON.stringify(item);
  if(!list.find(elem => itemJSON === JSON.stringify(elem))) {
    list.push(item);
  }
}

function addContrib(info, type) {
  const owner = info.owner;
  const repo = info.repo;
  const projectName = `${owner}/${repo}`;
  const item = { url: info.url, number: info.number };

  if(!github.repos[projectName]) {
    github.repos[projectName] = {
      info: { owner, repo},
      pullRequests: [],
      issues: []
    };
  }
  const project = github.repos[projectName]; 

  if(type === 'pr') {
    addOnce(item, project.pullRequests);
    addOnce(info, github.pullRequests);
  } else {
    addOnce(item, project.issues);
    addOnce(info, github.issues);
  }
}

function extractUrls(pageUrl) {
  return new Promise((resolve, reject) => {
    axios
      .get(pageUrl, { responseType: 'text' })
      .then(response => {
        response.data.match(urlRegex).forEach(url => {
          // Extract PR info if appropriate
          const prInfo = parsePullRequestUrl(url);
          if(prInfo) {
            addContrib(prInfo, 'pr');
          }
          
          // Extract Issue info if appropriate
          const issueInfo = parseIssueUrl(url);
          if(issueInfo) {
            addContrib(issueInfo, 'issue');
          }
        });

        resolve();
      })
      .catch(err => {
        if(err.response) {
          return reject(new Error(`unable to download ${pageUrl}: ${err.response.status} ${err.response.statusText}`));
        }
  
        reject(err);
      });
    });
}

Promise.all(urls.map(extractUrls))
  .then(() => {
    console.log('repos count', Object.keys(github.repos).length);
    console.log('issues count', github.issues.length);
    console.log('prs count', github.pullRequests.length);

    fs.writeFile(githubData, JSON.stringify(github, null, 2), (err) => {
      if(err) {
        console.error(`unable to write ${githubData}: ${err.message}`);
        return process.exit(1);
      }

      console.log(`wrote ${githubData}`);
      process.exit(0);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
