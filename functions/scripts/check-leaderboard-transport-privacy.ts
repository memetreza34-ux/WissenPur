import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const [callable, core, client] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/leaderboardCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/leaderboardPublicCore.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
]);

assert.match(
  core,
  /export const redactPublicLeaderboardAccountIds/,
  'Die UID-Redaktion muss als reine testbare Core-Funktion existieren.',
);
assert.match(
  core,
  /callerUid && entry\.uid === callerUid \? callerUid : `rank-\$\{index \+ 1\}`/,
  'Nur die dem Browser bereits bekannte eigene UID darf im Transport erhalten bleiben.',
);
assert.match(
  callable,
  /redactPublicLeaderboardAccountIds\(entries, uid\)/,
  'Die Callable muss die sanitierte Serverliste vor jeder Antwort von fremden stabilen Account-IDs befreien.',
);
assert.doesNotMatch(
  callable,
  /return\s*\{\s*entries\s*\};/,
  'Die Callable darf die rohe sanitierte Serverliste nicht direkt zurückgeben.',
);
assert.match(
  client,
  /functions, 'getTrustedLeaderboard'/,
  'Der Browser muss die minimale sanitierende Callable verwenden.',
);
assert.doesNotMatch(
  client,
  /collection\(db, ['"]trustedLeaderboard['"]\)|getDocs\(/,
  'Der Browser darf trustedLeaderboard nicht direkt enumerieren.',
);

console.log('Leaderboard-Transport redigiert fremde stabile Konto-IDs und bleibt callable-only.');
