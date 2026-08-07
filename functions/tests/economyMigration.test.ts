import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEconomy } from '../src/economyCore.js';

test('legacy client-writable economy fields are discarded before server ownership', () => {
  const migrated = normalizeEconomy({
    economyVersion: 0,
    totalPoints: 9_999_999,
    coins: 999_999,
    currentStreak: 9_999,
    bestStreak: 9_999,
    roundsPlayed: 500_000,
    correctAnswers: 50_000_000,
    totalQuestionsAnswered: 50_000_000,
    achievements: ['legend', 'master'],
    powerUps: {
      fiftyFifty: 9_999,
      timeFreeze: 9_999,
      secondChance: 9_999,
    },
    unlockedAvatars: ['default', 'avatar1', 'avatar2'],
    unlockedTitles: ['Neuling', 'Quiz-Gott', 'Legende'],
    equippedTitle: 'Legende',
    categoryStats: {
      technik: {
        roundsPlayed: 9_999,
        totalScore: 9_999_999,
        correctAnswers: 9_999,
        totalQuestions: 10_000,
      },
    },
  }, '2026-08-07');

  assert.equal(migrated.economyVersion, 1);
  assert.equal(migrated.totalPoints, 0);
  assert.equal(migrated.coins, 0);
  assert.equal(migrated.currentStreak, 0);
  assert.equal(migrated.bestStreak, 0);
  assert.equal(migrated.roundsPlayed, 0);
  assert.equal(migrated.correctAnswers, 0);
  assert.equal(migrated.totalQuestionsAnswered, 0);
  assert.deepEqual(migrated.achievements, []);
  assert.deepEqual(migrated.categoryStats, {});
  assert.deepEqual(migrated.powerUps, {
    fiftyFifty: 3,
    timeFreeze: 3,
    secondChance: 3,
  });
  assert.deepEqual(migrated.unlockedAvatars, ['default']);
  assert.deepEqual(migrated.unlockedTitles, ['Neuling']);
  assert.equal(migrated.equippedTitle, 'Neuling');
});

test('server-owned economy version remains normalizable', () => {
  const state = normalizeEconomy({
    economyVersion: 1,
    totalPoints: 120,
    coins: 40,
    roundsPlayed: 2,
    correctAnswers: 12,
    totalQuestionsAnswered: 20,
  }, '2026-08-07');

  assert.equal(state.totalPoints, 120);
  assert.equal(state.coins, 40);
  assert.equal(state.roundsPlayed, 2);
  assert.equal(state.correctAnswers, 12);
  assert.equal(state.totalQuestionsAnswered, 20);
});
