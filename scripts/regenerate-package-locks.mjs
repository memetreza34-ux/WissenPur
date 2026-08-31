import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const EXPECTED_NODE = 'v22.12.0';
const EXPECTED_NPM = '10.9.2';
const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const workspaces = ['wissenpur', 'functions', 'rules-tests'];

const fail = (message) => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

if (process.version !== EXPECTED_NODE) {
  fail(`Falsche Node-Version: ${process.version}. Erwartet wird exakt ${EXPECTED_NODE}.`);
}

const npmVersionResult = spawnSync(npmCommand, ['--version'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (npmVersionResult.status !== 0) {
  fail('npm konnte nicht ausgeführt werden.');
}

const npmVersion = String(npmVersionResult.stdout || '').trim();
if (npmVersion !== EXPECTED_NPM) {
  fail(`Falsche npm-Version: ${npmVersion || 'unbekannt'}. Erwartet wird exakt ${EXPECTED_NPM}.`);
}

const lockPaths = workspaces.map((workspace) => resolve(repoRoot, workspace, 'package-lock.json'));
const originalLocks = new Map(
  lockPaths.map((lockPath) => [lockPath, existsSync(lockPath) ? readFileSync(lockPath) : null]),
);

const restoreOriginalLockfiles = () => {
  for (const [lockPath, originalContent] of originalLocks) {
    if (originalContent === null) {
      if (existsSync(lockPath)) unlinkSync(lockPath);
      continue;
    }
    writeFileSync(lockPath, originalContent);
  }
};

for (const workspace of workspaces) {
  console.log(`\nErzeuge ${workspace}/package-lock.json mit Node ${EXPECTED_NODE.slice(1)} und npm ${EXPECTED_NPM} ...`);
  const result = spawnSync(
    npmCommand,
    ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
    {
      cwd: resolve(repoRoot, workspace),
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    restoreOriginalLockfiles();
    fail(
      `Lockfile-Erzeugung für ${workspace} ist fehlgeschlagen. Alle package-lock.json wurden auf den Zustand vor diesem Lauf zurückgesetzt.`,
    );
  }
}

console.log('\nAlle drei package-lock.json wurden aus den aktuellen Manifesten erzeugt.');
console.log('Nächster Schritt: Änderungen prüfen, den Package-Lock-Gate ausführen und erst danach CI auf npm ci umstellen.\n');
