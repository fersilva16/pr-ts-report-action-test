const { spawnSync } = require('child_process');
const { Octokit } = require('octokit');

const files = process.argv.slice(2);

const result = spawnSync('yarn', [
  '--silent',
  'tsc-files',
  '--noEmit',
  ...files,
]);

if (result.error) {
  console.log(result.error);

  process.exit(1);
}

const stdout = result.stdout.toString();
const stderr = result.stderr.toString();

if (process.status === 0) process.exit(0);

if (result.status !== 2) {
  console.log({
    result,
    output: result.output.map((output) => output?.toString()).join('\n'),
    files,
    stdout,
    stderr,
  });

  process.exit(1);
}

const octokit = new Octokit({
  auth: process.env.AUTH_TOKEN,
});

const owner = 'fersilva16';
const repo = 'pr-ts-report-action-test';
const baseUrl = `https://github.com/${owner}/${repo}`;
const prNumber = parseInt(process.env.PR_NUMBER);

const locations = stdout
  .trim()
  .split('\n')
  .filter(
    (line) => !line.match(/^\s+/) && files.some((file) => line.startsWith(file))
  )
  .map((line) => {
    const [location, ...rest] = line.split(':');
    const githubPath = location.replace(
      /\(([0-9]+),[0-9]+\)$/,
      (_, l) => `#L${l}`
    );

    return {
      location,
      url: `${baseUrl}/tree/main/${githubPath}`,
      error: rest.join(':').trim(),
    };
  });

const issueTitle = `TypeScript errors - #${prNumber}`;
const issueBody = [
  `${baseUrl}/pull/${prNumber}`,
  ...locations.map(
    ({ location, url, error }) => `- [ ] [${location}](${url}): \`${error}\``
  ),
].join('\n');

const encodedIssueTitle = encodeURIComponent(issueTitle);
const encodedIssueBody = encodeURIComponent(issueBody);

octokit.rest.issues.createComment({
  owner,
  repo,
  issue_number: prNumber,
  body: [
    '# TypeScript Report',
    '| Location | Error |',
    '| -------- | ----- |',
    ...locations.map(
      ({ location, url, error }) => `| [${location}](${url}) | \`${error}\` |`
    ),
    '',
    `[Create an issue](${baseUrl}/issues/new?title=${encodedIssueTitle}&body=${encodedIssueBody})`,
  ].join('\n'),
});
