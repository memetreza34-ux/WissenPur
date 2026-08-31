import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  awardAchievements,
  defaultEconomy,
  type CategoryStat,
} from '../src/economyCore.js';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const categoryStat = (): CategoryStat => ({
  roundsPlayed: 1,
  totalScore: 10,
  correctAnswers: 1,
  totalQuestions: 1,
});

test('Allrounder unlocks at ten distinct ranked categories, not nine', () => {
  const state = defaultEconomy('2026-08-31');
  state.categoryStats = Object.fromEntries(
    Array.from({ length: 9 }, (_, index) => [`category-${index + 1}`, categoryStat()]),
  );

  awardAchievements(state);
  assert.equal(state.achievements.includes('all_categories'), false);

  state.categoryStats['category-10'] = categoryStat();
  const unlocked = awardAchievements(state);
  assert.equal(unlocked, 1);
  assert.equal(state.achievements.includes('all_categories'), true);
});

test('frontend Allrounder copy matches the server threshold', async () => {
  const frontendTypes = await readFile(resolve(repoRoot, 'wissenpur/src/types.ts'), 'utf8');
  assert.match(
    frontendTypes,
    /id: 'all_categories',[^\n]*description: 'Spiele in 10 verschiedenen Kategorien'[^\n]*threshold: 10,[^\n]*type: 'categories'/,
  );
  assert.doesNotMatch(
    frontendTypes,
    /id: 'all_categories',[^\n]*description: 'Spiele in allen Kategorien'/,
  );
});
