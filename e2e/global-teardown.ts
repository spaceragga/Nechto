import { spawn } from 'node:child_process';

const repoRoot = process.cwd();

export default async function globalTeardown() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await new Promise<void>((resolve, reject) => {
    const child = spawn(npm, ['run', 'db:purge-test-users'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`db:purge-test-users exited ${code ?? 'null'}`));
    });
  });
}
