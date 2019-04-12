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

Next, create a JSON file with your list of URLs to web pages.
These web pages are expected to include URLs to GitHub.  They
don't need to be links, just appear anywhere in the file. Duplicates
will be ignored.  The form is as follows:

```
{
  "urls": [
    "https://url.one.com/",
    "https://url.two.com/",
    ...
  ]
}
```

Next, copy the [env.sample](env.sample) file to `.env` and alter it
to add your information.  See [the Octokit docs](https://github.com/octokit/rest.js/#authentication) for details on how to get a GitHub token.

### How to Run

With everything installed and the `.env` setup, you can now run the analysis:

```
npm start
```

This will do a number of things:

1. Use the file in `URL_LIST_PATH` to download all URLs specified
1. Extract all GitHub URLs from the text at each page
1. Build a list of repos, issues, and pull requests in `data/github-data.json` and make requests for of these items from the GitHub API.  All results will be cached in `data/`, so you can interrupt it, or retry later.
1. Generate stats for all Issues in `data/issue-data.json`
1. Generate stats for all Pull Requests in `data/pr-data.json`
