const { spawnSync } = require('child_process');
const path = require('path');

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

const locations = stdout
  .trim()
  .split('\n')
  .filter((line) => !line.match(/^\s+/))
  .map((line) => line.split(':')[0]);

console.log(locations);
