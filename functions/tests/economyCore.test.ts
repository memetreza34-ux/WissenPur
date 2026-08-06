import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyRankedRound,
  applySpinReward,
  claimDailyQuest,
  consumePowerUpItem,
  defaultEconomy,
  EconomyDomainError,
  normalizeEconomy,
  purchaseShopItem,
  rewardFromRoll,
  startOfWeekKey,
} from '../src/economyCore.js';

const expectDomainError = (
  code: EconomyDomainError['code'],
  action: () => unknown,
) => {
  assert.throws(action, (error: unknown) =>
    error instanceof EconomyDomainError && error.code === code,
  );
};

test('default economy initializes server-owned fields', () => {
  const state = defaultEconomy('2026-08-06');

  assert.equal(state.economyVersion, 1);
  assert.equal(state.totalPoints, 0);
  assert.equal(state.coins, 0);
  assert.equal(state.currentStreak, 0);
  assert.equal(state.lastDailyQuestionsDate, '2026-08-06');
  assert.deepEqual(state.powerUps, {
    fiftyFifty: 3,
    timeFreeze: 3,
    secondChance: 3,
  });
  assert.deepEqual(state.weeklyGoal, {
    type: 'rounds',
    target: 5,
    current: 0,
    lastResetDate: startOfWeekKey('2026-08-06'),
  });
});

test('normalization resets daily progress on a new Berlin date', () => {
  const state = normalizeEconomy({
    ...defaultEconomy('2026-08-05'),
    dailyQuestionsAnswered: 18,
    dailyRewardClaimed: true,
  }, '2026-08-06');

  assert.equal(state.dailyQuestionsAnswered, 0);
  assert.equal(state.dailyRewardClaimed, false);
  assert.equal(state.lastDailyQuestionsDate, '2026-08-06');
});

test('ranked rounds update points, category progress and weekly goals', () => {
  const start = defaultEconomy('2026-08-06');
  const outcome = applyRankedRound(start, {
    correct: 7,
    total: 10,
    mode: 'standard',
    category: 'technik',
    today: '2026-08-06',
  });

  assert.equal(outcome.pointsEarned, 70);
  assert.equal(outcome.coinsEarned, 12);
  assert.equal(outcome.achievementsUnlocked, 0);
  assert.equal(outcome.state.totalPoints, 70);
  assert.equal(outcome.state.coins, 12);
  assert.equal(outcome.state.roundsPlayed, 1);
  assert.equal(outcome.state.currentStreak, 1);
  assert.equal(outcome.state.weeklyGoal.current, 1);
  assert.deepEqual(outcome.state.categoryStats.technik, {
    roundsPlayed: 1,
    totalScore: 70,
    correctAnswers: 7,
    totalQuestions: 10,
  });

  assert.equal(start.totalPoints, 0, 'The original state must remain immutable.');
});

test('daily bonus is granted only on the first daily completion', () => {
  const first = applyRankedRound(defaultEconomy('2026-08-06'), {
    correct: 10,
    total: 10,
    mode: 'daily',
    category: 'daily',
    today: '2026-08-06',
  });

  assert.equal(first.firstDailyCompletion, true);
  assert.equal(first.pointsEarned, 150);
  assert.equal(first.state.lastDailyChallengeDate, '2026-08-06');
  assert.ok(first.achievementsUnlocked >= 1);

  const second = applyRankedRound(first.state, {
    correct: 10,
    total: 10,
    mode: 'daily',
    category: 'daily',
    today: '2026-08-06',
  });

  assert.equal(second.firstDailyCompletion, false);
  assert.equal(second.pointsEarned, 100);
});

test('streak increments on consecutive days and resets after a gap', () => {
  const dayOne = applyRankedRound(defaultEconomy('2026-08-04'), {
    correct: 1,
    total: 1,
    mode: 'standard',
    category: 'all',
    today: '2026-08-04',
  }).state;
  const dayTwo = applyRankedRound(dayOne, {
    correct: 1,
    total: 1,
    mode: 'standard',
    category: 'all',
    today: '2026-08-05',
  }).state;
  const afterGap = applyRankedRound(dayTwo, {
    correct: 1,
    total: 1,
    mode: 'standard',
    category: 'all',
    today: '2026-08-08',
  }).state;

  assert.equal(dayOne.currentStreak, 1);
  assert.equal(dayTwo.currentStreak, 2);
  assert.equal(afterGap.currentStreak, 1);
  assert.equal(afterGap.bestStreak, 2);
});

test('daily quest requires ten ranked questions and can be claimed once', () => {
  const insufficient = defaultEconomy('2026-08-06');
  insufficient.dailyQuestionsAnswered = 9;
  expectDomainError('failed-precondition', () =>
    claimDailyQuest(insufficient, '2026-08-06'),
  );

  const eligible = defaultEconomy('2026-08-06');
  eligible.dailyQuestionsAnswered = 10;
  const claimed = claimDailyQuest(eligible, '2026-08-06');
  assert.equal(claimed.dailyRewardClaimed, true);
  assert.equal(claimed.totalPoints, 100);
  assert.ok(claimed.coins >= 50);

  expectDomainError('already-exists', () =>
    claimDailyQuest(claimed, '2026-08-06'),
  );
});

test('spin reward boundaries are deterministic and one spin is allowed per date', () => {
  const cases = [
    [0, { type: 'coins', amount: 25 }],
    [34, { type: 'coins', amount: 25 }],
    [35, { type: 'coins', amount: 50 }],
    [59, { type: 'coins', amount: 50 }],
    [60, { type: 'fiftyFifty', amount: 1 }],
    [74, { type: 'fiftyFifty', amount: 1 }],
    [75, { type: 'timeFreeze', amount: 1 }],
    [86, { type: 'timeFreeze', amount: 1 }],
    [87, { type: 'secondChance', amount: 1 }],
    [94, { type: 'secondChance', amount: 1 }],
    [95, { type: 'coins', amount: 100 }],
    [99, { type: 'coins', amount: 100 }],
  ] as const;

  for (const [roll, expected] of cases) {
    assert.deepEqual(rewardFromRoll(roll), expected);
  }
  expectDomainError('invalid-argument', () => rewardFromRoll(-1));
  expectDomainError('invalid-argument', () => rewardFromRoll(100));

  const state = defaultEconomy('2026-08-06');
  const spun = applySpinReward(state, '2026-08-06', { type: 'coins', amount: 25 });
  assert.equal(spun.coins, 25);
  assert.equal(spun.lastSpinDate, '2026-08-06');
  expectDomainError('already-exists', () =>
    applySpinReward(spun, '2026-08-06', { type: 'coins', amount: 25 }),
  );
});

test('shop purchases and power-up consumption validate balances and inventory', () => {
  const poorState = defaultEconomy('2026-08-06');
  expectDomainError('failed-precondition', () =>
    purchaseShopItem(poorState, 'avatar1'),
  );
  expectDomainError('not-found', () =>
    purchaseShopItem(poorState, 'not-a-real-item'),
  );

  const funded = defaultEconomy('2026-08-06');
  funded.coins = 300;
  const avatarPurchase = purchaseShopItem(funded, 'avatar1');
  assert.equal(avatarPurchase.state.coins, 100);
  assert.ok(avatarPurchase.state.unlockedAvatars.includes('avatar1'));
  assert.match(avatarPurchase.state.customPhotoURL || '', /dicebear/);
  expectDomainError('already-exists', () =>
    purchaseShopItem(avatarPurchase.state, 'avatar1'),
  );

  const powerUpPurchase = purchaseShopItem(funded, 'fiftyFifty');
  assert.equal(powerUpPurchase.state.powerUps.fiftyFifty, 4);
  assert.equal(powerUpPurchase.state.coins, 250);

  const consumed = consumePowerUpItem(powerUpPurchase.state, 'fiftyFifty');
  assert.equal(consumed.state.powerUps.fiftyFifty, 3);
  expectDomainError('invalid-argument', () =>
    consumePowerUpItem(consumed.state, 'unknown'),
  );

  const empty = defaultEconomy('2026-08-06');
  empty.powerUps.secondChance = 0;
  expectDomainError('failed-precondition', () =>
    consumePowerUpItem(empty, 'secondChance'),
  );
});
