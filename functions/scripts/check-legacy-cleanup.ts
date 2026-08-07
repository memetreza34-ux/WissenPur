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

for (const collection of ['leaderboard', 'lobbies', 'duels', 'roundReceipts']) {
  assert.match(cleanup, new RegExp(`['"]${collection}['"]`), `${collection} muss im expliziten Legacy-Allowlist stehen.`);
}
for (const protectedCollection of ['users', 'quizSessions', 'trustedLeaderboard', 'serverRateLimits']) {
  const legacyListMatch = cleanup.match(/const LEGACY_COLLECTIONS = \[([\s\S]*?)\] as const;/);
  assert.ok(legacyListMatch, 'LEGACY_COLLECTIONS muss statisch definiert sein.');
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
assert.match(cleanup, /getFirestore\(app, ['"]\(default\)['"]\)/);
assert.match(cleanup, /DRY RUN – keine Schreiboperationen/);
assert.match(cleanup, /if \(!apply\) \{/);

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

console.log('Legacy-Cleanup-Allowlist, Dry-Run-Default, Projektbestätigung und Ausschluss aus automatischen Build-/Deploy-Pfaden geprüft.');
