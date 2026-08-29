import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const webRoot = resolve(repoRoot, 'wissenpur');
const preflightPath = resolve(webRoot, 'scripts/production-preflight.mjs');

const [preflight, releaseCheck, frontendPackageText, envExample, documentation] = await Promise.all([
  readFile(preflightPath, 'utf8'),
  readFile(resolve(webRoot, 'scripts/check-release-env.mjs'), 'utf8'),
  readFile(resolve(webRoot, 'package.json'), 'utf8'),
  readFile(resolve(webRoot, '.env.example'), 'utf8'),
  readFile(resolve(webRoot, 'docs/PRODUCTION_PREFLIGHT.md'), 'utf8'),
]);

const frontendPackage = JSON.parse(frontendPackageText) as {
  scripts?: Record<string, string>;
};

for (const key of [
  'RELEASE_PRODUCTION_FIREBASE_PROJECT_ID',
  'RELEASE_PRODUCTION_CONFIRMATION',
  'RELEASE_DEPLOYMENT_REVIEW_CONFIRMED',
  'RELEASE_FIRESTORE_TTL_CONFIRMATION',
  'RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED',
  'RELEASE_AI_RATE_LIMIT_RPM',
  'RELEASE_AI_MONITORING_CONFIRMED',
  'RELEASE_BUDGET_GUARDS_CONFIRMED',
]) {
  assert.match(preflight, new RegExp(key), `${key} muss im Produktions-Preflight geprüft werden.`);
  assert.match(envExample, new RegExp(`^${key}=`, 'm'), `${key} muss in .env.example dokumentiert sein.`);
}

assert.match(preflight, /const MIN_AI_RATE_LIMIT_RPM = 1/);
assert.match(preflight, /const MAX_AI_RATE_LIMIT_RPM = 20/);
assert.match(preflight, /Number\.isInteger\(aiRateLimitRpm\)/);
assert.match(preflight, /quizSessions\.expiresAt,serverRateLimits\.expiresAt/);
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

assert.match(documentation, /Authenticated-users mode/);
assert.match(documentation, /1 und 20 RPM pro Nutzer/);
assert.match(documentation, /RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED=true/);
assert.match(documentation, /RELEASE_AI_RATE_LIMIT_RPM=10/);
assert.match(documentation, /RELEASE_AI_MONITORING_CONFIRMED=true/);
assert.match(documentation, /RELEASE_BUDGET_GUARDS_CONFIRMED=true/);
assert.match(documentation, /Collection Group `quizSessions` → Feld `expiresAt`/);
assert.match(documentation, /Collection Group `serverRateLimits` → Feld `expiresAt`/);
assert.match(documentation, /RELEASE_FIRESTORE_TTL_CONFIRMATION=quizSessions\.expiresAt,serverRateLimits\.expiresAt/);

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

console.log('Fail-closed Produktions-Preflight, AI-Auth/Quota/Monitoring/Budget-Gates, Firestore-TTL-Freigabe, Release-Build-Wiring und paketfreier Selbsttest geprüft.');
