import { spawn } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const apiBaseUrl = (
  process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

async function publishedWorkCount() {
  const response = await fetch(`${apiBaseUrl}/works?limit=1`);
  if (!response.ok) {
    throw new Error(`GET ${apiBaseUrl}/works → ${response.status}`);
  }
  const body = (await response.json()) as { items?: unknown[] };
  return body.items?.length ?? 0;
}

function runSeed() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return new Promise<void>((resolve, reject) => {
    const child = spawn(npm, ['run', 'db:seed:dev'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        SEED_API_URL: apiBaseUrl,
        SEED_FIXTURE_IMAGE: path.join(
          repoRoot,
          'e2e',
          'fixtures',
          'avatar.png',
        ),
      },
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`db:seed:dev exited ${code ?? 'null'}`));
    });
  });
}

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_SEED === '1') {
    return;
  }
  if ((await publishedWorkCount()) > 0) {
    return;
  }
  await runSeed();
}
