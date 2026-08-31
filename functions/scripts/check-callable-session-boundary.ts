import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const economyService = await readFile(
  resolve(repoRoot, 'wissenpur/src/services/economyService.ts'),
  'utf8',
);

assert.match(economyService, /import \{ auth \} from ['"]\.\.\/firebase['"]/);
assert.match(economyService, /class CallableAuthSessionChangedError extends Error/);
assert.match(economyService, /const runForCurrentAuthenticatedSession = async <T>/);
assert.match(economyService, /const expectedUser = auth\.currentUser;/);
assert.match(economyService, /const expectedUid = expectedUser\.uid;/);
assert.match(
  economyService,
  /auth\.currentUser !== expectedUser \|\| auth\.currentUser\?\.uid !== expectedUid/,
  'Nicht nur die UID, sondern die konkrete Firebase-User-Sitzung muss stabil bleiben.',
);

for (const callable of [
  'getMyEconomyStateCallable',
  'startSecureRankedQuizCallable',
  'submitRankedQuizCallable',
  'revealSecureRankedQuizCallable',
  'claimDailyQuestRewardCallable',
  'spinDailyWheelCallable',
  'purchaseShopItemCallable',
  'consumePowerUpCallable',
]) {
  assert.match(
    economyService,
    new RegExp(`runForCurrentAuthenticatedSession\\(\\(\\) =>[\\s\\S]{0,120}${callable.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\(`),
    `${callable} muss durch die Auth-Sitzungsgrenze laufen.`,
  );
}

assert.doesNotMatch(
  economyService,
  /const result = await (?:getMyEconomyStateCallable|startSecureRankedQuizCallable|submitRankedQuizCallable|revealSecureRankedQuizCallable|claimDailyQuestRewardCallable|spinDailyWheelCallable|purchaseShopItemCallable|consumePowerUpCallable)\(/,
  'Exportierte Economy-Operationen dürfen Callables nicht direkt ohne Session-Wrapper awaiten.',
);

console.log('Ranked-, Economy-, Shop-, Daily-, Glücksrad- und Power-up-Callables gegen stale Auth-Sitzungen geprüft.');
