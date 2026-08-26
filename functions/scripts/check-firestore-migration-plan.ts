import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const webRoot = resolve(repoRoot, 'wissenpur');
const plannerPath = resolve(webRoot, 'scripts/firestore-default-migration-plan.mjs');

const [planner, packageText] = await Promise.all([
  readFile(plannerPath, 'utf8'),
  readFile(resolve(webRoot, 'package.json'), 'utf8'),
]);
const packageJson = JSON.parse(packageText) as { scripts?: Record<string, string> };

for (const expected of [
  'RELEASE_PRODUCTION_FIREBASE_PROJECT_ID',
  'RELEASE_FIRESTORE_SOURCE_DATABASE_ID',
  'RELEASE_FIRESTORE_SOURCE_DATABASE_CONFIRMATION',
  'RELEASE_FIRESTORE_MIGRATION_GCS_PATH',
  'RELEASE_FIRESTORE_DEFAULT_EMPTY_CONFIRMED',
  'RELEASE_FIRESTORE_MIGRATION_CONFIRMATION',
  'MIGRATE:${project}:${source}:(default)',
  'gcloud firestore export',
  'gcloud firestore import',
  "target !== '(default)'",
  'Dieser Planer hat weder Export noch Import noch sonstige Firebase-/GCloud-Kommandos ausgeführt.',
]) assert.ok(planner.includes(expected), `Firestore-Migrationsplaner: ${expected} fehlt.`);

assert.doesNotMatch(planner, /from ['"]node:child_process['"]|spawnSync\(|execSync\(|execFileSync\(/,
  'Der Migrationsplaner darf keine Befehle selbst ausführen.');
assert.doesNotMatch(planner, /firebase-admin|firebase\/app|firebase-functions|@google-cloud\/firestore/,
  'Der Migrationsplaner darf keinen Datenbank-SDK-Zugriff besitzen.');
assert.equal(packageJson.scripts?.['migration:plan'], 'node scripts/firestore-default-migration-plan.mjs');
assert.equal(packageJson.scripts?.['migration:self-test'], 'node scripts/firestore-default-migration-plan.mjs --self-test');

const selfTest = spawnSync(process.execPath, [plannerPath, '--self-test'], {
  cwd: webRoot,
  encoding: 'utf8',
});
assert.equal(selfTest.status, 0, selfTest.stderr || selfTest.stdout);
assert.match(selfTest.stdout, /Firestore-\(default\)-Migrationsplaner-Selbsttest erfolgreich/);

console.log('Firestore-(default)-Migrationsplaner ist fail-closed, nicht-destruktiv und selbstgetestet.');
