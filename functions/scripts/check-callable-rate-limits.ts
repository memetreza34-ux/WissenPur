import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateFixedWindowRate } from '../src/rateLimitCore.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const first = evaluateFixedWindowRate(0, 0, 1_000, 60_000, 120);
assert.equal(first.allowed, true);
assert.equal(first.count, 1);
const lastAllowed = evaluateFixedWindowRate(1_000, 119, 30_000, 60_000, 120);
assert.equal(lastAllowed.allowed, true);
assert.equal(lastAllowed.count, 120);
const blocked = evaluateFixedWindowRate(1_000, 120, 30_000, 60_000, 120);
assert.equal(blocked.allowed, false);
assert.ok(blocked.retryAfterMs > 0);
const newWindow = evaluateFixedWindowRate(1_000, 120, 61_000, 60_000, 120);
assert.equal(newWindow.allowed, true);
assert.equal(newWindow.count, 1);

const [
  limiter,
  start,
  submit,
  reveal,
  economyState,
  economyCallables,
  leaderboardCallable,
  account,
  rules,
] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/callableRateLimit.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/secureStart.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/secureSubmit.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/secureReveal.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyStateCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCallables.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/leaderboardCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/account.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/firestore.rules'), 'utf8'),
]);

assert.match(limiter, /maxActions: 120/);
assert.match(limiter, /windowMs: 60 \* 1000/);
assert.match(limiter, /maxActions: 5/);
assert.match(limiter, /windowMs: 10 \* 60 \* 1000/);
assert.match(limiter, /db\.collection\('serverRateLimits'\)\.doc\(uid\)/);
assert.match(limiter, /resource-exhausted/);
assert.match(limiter, /enforceGlobalCallableRateLimit/);
assert.match(limiter, /enforceAccountExportRateLimit/);

assert.match(start, /maxQuizStartsPerWindow = 12/);
assert.match(start, /evaluateFixedWindowRate/);
assert.match(submit, /await enforceGlobalCallableRateLimit\(uid\)/);
assert.match(reveal, /await enforceGlobalCallableRateLimit\(uid\)/);
assert.match(economyState, /await enforceGlobalCallableRateLimit\(uid\)/);
assert.equal(
  (economyCallables.match(/await enforceGlobalCallableRateLimit\(uid\)/g) || []).length,
  4,
  'Daily, Spin, Shop und Power-up müssen alle global begrenzt sein.',
);
assert.match(
  leaderboardCallable,
  /const uid = request\.auth\?\.uid;\s*if \(uid\) await enforceGlobalCallableRateLimit\(uid\);/,
  'Angemeldete Ranglistenleser müssen denselben globalen Callable-Limiter verwenden.',
);
assert.match(
  leaderboardCallable,
  /getEffectivePublicLeaderboardLimit\(normalizedLimit, Boolean\(uid\)\)/,
  'Gastzugriffe müssen einen engeren serverseitigen Antwortdeckel verwenden.',
);
assert.match(leaderboardCallable, /const PUBLIC_CACHE_TTL_MS = 15_000/);
assert.match(leaderboardCallable, /publicLeaderboardCache\.expiresAt > now/);
assert.match(leaderboardCallable, /publicLeaderboardCache\.sourceLimit >= fetchLimit/);
assert.match(leaderboardCallable, /const fetchLimit = Math\.min\(200, requestedLimit \* 2\)/);
assert.doesNotMatch(
  leaderboardCallable,
  /ipAddress|request\.rawRequest|x-forwarded-for|remoteAddress/,
  'Der Gast-Ranglistenschutz darf keine IP-Adressen speichern oder auswerten.',
);

const exportBlock = account.slice(
  account.indexOf('export const exportMyData'),
  account.indexOf('export const deleteMyAccount'),
);
const deleteBlock = account.slice(account.indexOf('export const deleteMyAccount'));
assert.match(exportBlock, /await enforceAccountExportRateLimit\(uid\)/);
assert.doesNotMatch(
  deleteBlock,
  /enforceAccountExportRateLimit|enforceGlobalCallableRateLimit/,
  'Kontolöschung soll nicht wegen vorheriger normaler Nutzung rate-limited werden.',
);
assert.match(deleteBlock, /batch\.delete\(db\.collection\('serverRateLimits'\)\.doc\(uid\)\)/);
assert.match(rules, /match \/serverRateLimits\/\{userId\}/);
assert.match(rules, /allow read, write: if false;/);

console.log('Globale Callable-, Gast-Ranglisten-, Export- und Quizstart-Limits sowie datensparsames Caching geprüft.');
