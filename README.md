### GitHub Contrib Stats

This is a set of scripts I use to help me extract GitHub contribution
stats for my open source classes.  It takes a set of URLs to web pages
with links to GitHub Issues and/or Pull Requests, then downloads and
extracts data about them.

### Setup

First, install all deps:

```
$ npm install
```

Next, copy the [env.sample](env.sample) file to `.env` and alter it
to add your information.  See [the Octokit docs](https://github.com/octokit/rest.js/#authentication) for details on how to get a GitHub token.

You need to include a list of URLs to the web pages that contain
the URLs you want to process.  These can be HTML, markdown, or any
other text format.  The page(s) will be downloaded and the URLs extracted.

```
# List of URLs to process, separated by spaces
URL_LIST="https://url1.com/file.html https://url2.com/file.md"
```

### How to Run

With everything installed and the `.env` setup, you can now run the analysis:

```
npm start
```

This will do a number of things:

1. Use the URLs in `URL_LIST` to download all URLs specified
1. Extract all GitHub URLs from the text at each page
1. Build a list of repos, issues, and pull requests in `data/github-data.json` and make requests for of these items from the GitHub API.  All results will be cached in `data/`, so you can interrupt it, or retry later.
1. Generate stats for all Issues in `data/issue-data.json`
1. Generate stats for all Pull Requests in `data/pr-data.json`
