const { spawnSync } = require('child_process');
const { Octokit } = require('octokit');

const result = spawnSync('yarn', ['--silent', 'tsc', '--noEmit']);

if (result.error) {
  console.log(result.error);

  process.exit(1);
}

const stdout = result.stdout.toString();
const stderr = result.stderr.toString();

if (process.status === 0) process.exit(0);

if (result.status !== 2) {
  console.log({ stdout, stderr });

  process.exit(1);
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'fersilva16';
const repo = 'pr-ts-report-action';

const locations = stdout
  .trim()
  .split('\n')
  .filter((line) => !line.match(/^\s+/))
  .map((line) => {
    const [location, ...rest] = line.split(':');
    const githubPath = location.replace(
      /\(([0-9]+),[0-9]+\)$/,
      (_, l) => `#L${l}`
    );

    return {
      location,
      url: `https://github.com/${owner}/${repo}/tree/main/${githubPath}`,
      error: rest.join(':'),
    };
  });

octokit.rest.issues.createComment({
  owner,
  repo,
  issue_number: parseInt(process.env.PR_NUMBER),
  body: [
    '| Location | Error |',
    '| -------- | ----- |',
    ...locations.map(
      ({ location, url, error }) => `| [${location}](${url}) | \`${error}\` |`
    ),
  ].join('\n'),
});
