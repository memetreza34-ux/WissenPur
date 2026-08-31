import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [cleanup, packageText] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/scripts/cleanup-legacy-release-data.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/package.json'), 'utf8'),
]);
const packageJson = JSON.parse(packageText) as { scripts?: Record<string, string> };
const scripts = packageJson.scripts || {};

const legacyListMatch = cleanup.match(/const LEGACY_COLLECTIONS = \[([\s\S]*?)\] as const;/);
assert.ok(legacyListMatch, 'LEGACY_COLLECTIONS muss statisch definiert sein.');

for (const collection of ['leaderboard', 'lobbies', 'duels', 'roundReceipts']) {
  assert.match(legacyListMatch![1], new RegExp(`['"]${collection}['"]`), `${collection} muss im expliziten Legacy-Allowlist stehen.`);
}
for (const protectedCollection of ['users', 'quizSessions', 'trustedLeaderboard', 'serverRateLimits']) {
  assert.doesNotMatch(
    legacyListMatch![1],
    new RegExp(`['"]${protectedCollection}['"]`),
    `${protectedCollection} darf niemals Teil des Legacy-Cleanups sein.`,
  );
}

assert.match(cleanup, /const apply = args\.has\(APPLY_FLAG\);/);
assert.match(cleanup, /if \(apply\) \{/);
assert.match(cleanup, /confirmedProjectId !== targetProjectId/);
assert.match(cleanup, /confirmPhrase !== CONFIRM_PHRASE/);
assert.match(cleanup, /WISSENPUR_TARGET_PROJECT_ID/);
assert.match(cleanup, /WISSENPUR_CONFIRM_PROJECT_ID/);
assert.match(cleanup, /WISSENPUR_CONFIRM_LEGACY_CLEANUP/);
assert.match(cleanup, /const emulatorHost = process\.env\.FIRESTORE_EMULATOR_HOST\?\.trim\(\)/);
assert.match(cleanup, /if \(emulatorHost\) \{/,
  'Ein echter --apply-Lauf muss bei aktivem Firestore-Emulator abbrechen.');
assert.match(cleanup, /initializeApp\([\s\S]*projectId: targetProjectId[\s\S]*CLEANUP_APP_NAME\)/,
  'Cleanup muss eine eigene Admin-App verwenden, die an die explizite Ziel-Projekt-ID gebunden ist.');
assert.doesNotMatch(cleanup, /getApps\(\)\[0\]/,
  'Cleanup darf keine bereits initialisierte fremde Admin-App wiederverwenden.');
assert.match(cleanup, /app\.options\.projectId !== targetProjectId/,
  'Die initialisierte Admin-App muss gegen die bestätigte Ziel-Projekt-ID gegengeprüft werden.');
assert.match(cleanup, /getFirestore\(app, ['"]\(default\)['"]\)/);
assert.match(cleanup, /DRY RUN – keine Schreiboperationen/);
assert.match(cleanup, /if \(!apply\) \{/);
assert.match(cleanup, /finally \{\s*await deleteApp\(app\);\s*\}/,
  'Die eigene Cleanup-App muss nach jedem Lauf wieder freigegeben werden.');

assert.equal(
  scripts['cleanup:legacy'],
  'tsx scripts/cleanup-legacy-release-data.ts',
  'Der manuelle Cleanup-Befehl muss explizit benannt sein.',
);
for (const automaticScript of ['prepare:questions', 'verify', 'build', 'deploy']) {
  assert.doesNotMatch(
    scripts[automaticScript] || '',
    /cleanup:legacy|cleanup-legacy-release-data/,
    `${automaticScript} darf den destruktiven Legacy-Cleanup niemals automatisch ausführen.`,
  );
}

console.log('Legacy-Cleanup-Allowlist, Dry-Run-Default, Projekt-/Emulatorbindung, Bestätigung und Ausschluss aus automatischen Build-/Deploy-Pfaden geprüft.');
