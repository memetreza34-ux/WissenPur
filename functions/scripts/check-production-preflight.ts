import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const webRoot = resolve(repoRoot, 'wissenpur');
const preflightPath = resolve(webRoot, 'scripts/production-preflight.mjs');

const [preflight, releaseCheck, frontendPackageText, envExample] = await Promise.all([
  readFile(preflightPath, 'utf8'),
  readFile(resolve(webRoot, 'scripts/check-release-env.mjs'), 'utf8'),
  readFile(resolve(webRoot, 'package.json'), 'utf8'),
  readFile(resolve(webRoot, '.env.example'), 'utf8'),
]);

const frontendPackage = JSON.parse(frontendPackageText) as {
  scripts?: Record<string, string>;
};

assert.match(preflight, /RELEASE_PRODUCTION_FIREBASE_PROJECT_ID/);
assert.match(preflight, /RELEASE_PRODUCTION_CONFIRMATION/);
assert.match(preflight, /RELEASE_DEPLOYMENT_REVIEW_CONFIRMED/);
assert.match(preflight, /projects\?\.production/);
assert.match(preflight, /VITE_FIRESTORE_DATABASE_ID/);
assert.match(preflight, /VITE_ENABLE_APPCHECK_DEBUG/);
assert.match(preflight, /VITE_USE_FUNCTIONS_EMULATOR/);
assert.match(preflight, /spawnSync\(process\.execPath, \['scripts\/check-release-env\.mjs'\]/);
assert.match(preflight, /Es wurde nichts deployed, migriert oder gelöscht\./);
assert.doesNotMatch(preflight, /firebase\s+deploy|cleanup:legacy|deleteCurrentAccount|deleteMyAccount/);

assert.doesNotMatch(
  releaseCheck,
  /from ['"]dotenv['"]/,
  'Der Release-Checker darf keine versteckte dotenv-Abhängigkeit mehr besitzen.',
);
assert.match(releaseCheck, /const parseEnvText =/);

assert.equal(
  frontendPackage.scripts?.['preflight:production'],
  'node scripts/production-preflight.mjs',
);
assert.equal(
  frontendPackage.scripts?.['preflight:self-test'],
  'node scripts/production-preflight.mjs --self-test',
);
assert.equal(
  frontendPackage.scripts?.['build:release'],
  'npm run lint && npm run preflight:production && vite build',
  'Release-Builds müssen durch den Produktions-Preflight laufen.',
);

for (const key of [
  'RELEASE_PRODUCTION_FIREBASE_PROJECT_ID',
  'RELEASE_PRODUCTION_CONFIRMATION',
  'RELEASE_DEPLOYMENT_REVIEW_CONFIRMED',
]) {
  assert.match(envExample, new RegExp(`^${key}=`, 'm'), `${key} muss in .env.example dokumentiert sein.`);
}

const selfTest = spawnSync(process.execPath, [preflightPath, '--self-test'], {
  cwd: webRoot,
  encoding: 'utf8',
});
assert.equal(
  selfTest.status,
  0,
  `Produktions-Preflight-Selbsttest fehlgeschlagen:\n${selfTest.stderr || selfTest.stdout}`,
);
assert.match(selfTest.stdout, /Produktions-Preflight-Selbsttest erfolgreich/);

console.log('Fail-closed Produktions-Preflight, release build wiring und paketfreier Selbsttest geprüft.');
