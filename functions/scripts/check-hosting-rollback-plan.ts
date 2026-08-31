import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const webRoot = resolve(repoRoot, 'wissenpur');
const plannerPath = resolve(webRoot, 'scripts/hosting-rollback-plan.mjs');

const [planner, packageText] = await Promise.all([
  readFile(plannerPath, 'utf8'),
  readFile(resolve(webRoot, 'package.json'), 'utf8'),
]);
const packageJson = JSON.parse(packageText) as { scripts?: Record<string, string> };

for (const expected of [
  'RELEASE_PRODUCTION_FIREBASE_PROJECT_ID',
  'RELEASE_HOSTING_SITE',
  'RELEASE_HOSTING_SITE_CONFIRMATION',
  'RELEASE_HOSTING_ROLLBACK_CHANNEL',
  'RELEASE_HOSTING_ROLLBACK_CONFIRMATION',
  'RELEASE_DEPLOYMENT_REVIEW_CONFIRMED',
  'projects?.production',
  'ROLLBACK:${projectId}:${siteId}:${rollbackChannel}',
  'firebase hosting:clone',
  'firebase deploy --only hosting',
  'firebase hosting:channel:delete',
  'Dieser Planer hat keine Firebase-Kommandos ausgeführt.',
]) assert.ok(planner.includes(expected), `Rollback-Planer: ${expected} fehlt.`);

assert.doesNotMatch(planner, /from ['"]node:child_process['"]|spawnSync\(|execSync\(|execFileSync\(/,
  'Der Rollback-Planer darf keine Befehle selbst ausführen.');
assert.doesNotMatch(planner, /firebase-admin|firebase\/app|firebase-functions/,
  'Der Rollback-Planer darf keinen Firebase-SDK-Zugriff besitzen.');
assert.equal(packageJson.scripts?.['rollback:plan'], 'node scripts/hosting-rollback-plan.mjs');
assert.equal(packageJson.scripts?.['rollback:self-test'], 'node scripts/hosting-rollback-plan.mjs --self-test');

const selfTest = spawnSync(process.execPath, [plannerPath, '--self-test'], {
  cwd: webRoot,
  encoding: 'utf8',
});
assert.equal(selfTest.status, 0, selfTest.stderr || selfTest.stdout);
assert.match(selfTest.stdout, /Hosting-Rollback-Planer-Selbsttest erfolgreich/);

console.log('Hosting-Rollback-Planer ist fail-closed, nicht-destruktiv und selbstgetestet.');
