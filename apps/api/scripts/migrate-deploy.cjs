'use strict';

/**
 * `prisma migrate deploy` plus a local-dev recovery for P3009
 * (a previous container crash left a failed row in `_prisma_migrations`).
 * Production leaves the failure in place.
 */
const { spawnSync } = require('node:child_process');

const FAILED_MIGRATION = /The `([^`]+)` migration started at [\s\S]*? failed/;
const DUPLICATE_OBJECT = /already exists|duplicate key|duplicate_object|42P07/i;
const MAX_ATTEMPTS = 5;

function runPrisma(args) {
  const result = spawnSync('npx', ['prisma', ...args], {
    encoding: 'utf8',
    env: process.env,
    shell: true,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  return { status: result.status ?? 1, output };
}

function failedMigrationName(output) {
  return output.match(FAILED_MIGRATION)?.[1] ?? null;
}

function allowLocalRepair() {
  return process.env.NODE_ENV !== 'production';
}

function main() {
  let result = runPrisma(['migrate', 'deploy']);
  for (let attempt = 0; result.status !== 0 && attempt < MAX_ATTEMPTS;) {
    const name = failedMigrationName(result.output);
    if (!name || !result.output.includes('P3009') || !allowLocalRepair()) {
      process.exit(result.status);
    }
    attempt += 1;
    const applied = DUPLICATE_OBJECT.test(result.output);
    const flag = applied ? '--applied' : '--rolled-back';
    console.warn(
      `Repairing failed migration ${name} (${flag.slice(2)}, attempt ${attempt})`,
    );
    const resolved = runPrisma(['migrate', 'resolve', flag, name]);
    if (resolved.status !== 0) {
      process.exit(resolved.status);
    }
    result = runPrisma(['migrate', 'deploy']);
  }
  process.exit(result.status);
}

module.exports = { failedMigrationName, allowLocalRepair };

if (require.main === module) {
  main();
}
