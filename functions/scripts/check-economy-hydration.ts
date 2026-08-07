import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeEconomy } from '../src/economyCore.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const legacy = normalizeEconomy({
  economyVersion: 0,
  totalPoints: 99_999,
  coins: 50_000,
  roundsPlayed: 900,
  correctAnswers: 8_000,
  totalQuestionsAnswered: 9_000,
}, '2026-08-07');
assert.equal(legacy.economyVersion, 1);
assert.equal(legacy.totalPoints, 0, 'Legacy-/Gastpunkte dürfen nicht in die authentifizierte Economy migrieren.');
assert.equal(legacy.coins, 0);
assert.equal(legacy.roundsPlayed, 0);
assert.equal(legacy.correctAnswers, 0);
assert.equal(legacy.totalQuestionsAnswered, 0);

const trusted = normalizeEconomy({
  economyVersion: 1,
  totalPoints: 420,
  coins: 33,
  roundsPlayed: 7,
}, '2026-08-07');
assert.equal(trusted.totalPoints, 420);
assert.equal(trusted.coins, 33);
assert.equal(trusted.roundsPlayed, 7);

const [callable, entry, economyService, firebaseService, storage] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/economyStateCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/entry.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/economyService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/storage.ts'), 'utf8'),
]);

assert.match(callable, /getMyEconomyState = onCall/);
assert.match(callable, /\{ enforceAppCheck \}/);
assert.match(callable, /normalizeEconomy\(userData, today\)/);
assert.match(callable, /userData\.economyVersion !== state\.economyVersion/);
assert.match(callable, /transaction\.set\(userRef/);
assert.match(entry, /getMyEconomyState/);
assert.match(economyService, /functions,\s*'getMyEconomyState'/);
assert.match(economyService, /export const getServerEconomyState/);
assert.match(firebaseService, /existingData\.economyVersion === 1/);
assert.match(firebaseService, /\(await getServerEconomyState\(\)\)\.stats/);
assert.match(firebaseService, /let hydratedAuthUid: string \| null = null/);

const persistIndex = firebaseService.indexOf('const persisted = await persistProfileOnly(hydratedStats);');
const markHydratedIndex = firebaseService.indexOf('hydratedAuthUid = currentUser.uid;');
assert.ok(persistIndex >= 0 && markHydratedIndex > persistIndex, 'Hydrierung darf erst nach erfolgreichem Persistieren als abgeschlossen gelten.');

assert.match(storage, /if \(auth\.currentUser\) return stats;/);
assert.doesNotMatch(storage, /auth\.currentUser && stats\.economyVersion === 1/);

console.log('Autoritative Economy-Hydrierung, Legacy-Reset und signierte Local-Mutation-Sperre geprüft.');
