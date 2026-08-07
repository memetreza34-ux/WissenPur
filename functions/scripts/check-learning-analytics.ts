import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAX_LEARNING_HISTORY,
  appendLearningSession,
  buildLearningAnalytics,
  createEconomySnapshot,
  deriveRankedSession,
  normalizeLearningHistory,
  type LearningSessionRecord,
} from '../../wissenpur/src/services/learningAnalytics.ts';
import type { UserStats } from '../../wissenpur/src/types.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const baseStats = (overrides: Partial<UserStats> = {}): UserStats => ({
  totalPoints: 0,
  coins: 0,
  currentStreak: 0,
  bestStreak: 0,
  roundsPlayed: 3,
  correctAnswers: 18,
  totalQuestionsAnswered: 30,
  dailyQuestionsAnswered: 0,
  lastPlayedDate: '2026-08-06',
  wrongQuestions: [],
  categoryStats: {
    technik: {
      roundsPlayed: 2,
      totalScore: 120,
      correctAnswers: 12,
      totalQuestions: 20,
    },
  },
  ...overrides,
});

const before = createEconomySnapshot(baseStats());
const after = createEconomySnapshot(baseStats({
  roundsPlayed: 4,
  correctAnswers: 26,
  totalQuestionsAnswered: 40,
  categoryStats: {
    technik: {
      roundsPlayed: 3,
      totalScore: 200,
      correctAnswers: 20,
      totalQuestions: 30,
    },
  },
}));
const ranked = deriveRankedSession(before, after, 1_000);
assert.ok(ranked);
assert.equal(ranked.category, 'technik');
assert.equal(ranked.correct, 8);
assert.equal(ranked.total, 10);
assert.equal(ranked.accuracy, 80);
assert.equal(ranked.label, 'Gewertete Prüfung');

const hydrationJump = deriveRankedSession(before, createEconomySnapshot(baseStats({
  roundsPlayed: 7,
  correctAnswers: 35,
  totalQuestionsAnswered: 60,
})), 2_000);
assert.equal(hydrationJump, null, 'Mehrere nachgeladene Altrunden dürfen keine falsche Session erzeugen.');

const daily = deriveRankedSession(
  createEconomySnapshot(baseStats({ lastDailyChallengeDate: null })),
  createEconomySnapshot(baseStats({
    roundsPlayed: 4,
    correctAnswers: 25,
    totalQuestionsAnswered: 40,
    lastDailyChallengeDate: '2026-08-07',
  })),
  3_000,
);
assert.ok(daily);
assert.equal(daily.category, 'daily');
assert.equal(daily.label, 'Daily Challenge');

const malformed = normalizeLearningHistory([
  ranked,
  ranked,
  { id: '', label: '', completedAt: -1, correct: 99, total: 0 },
  { id: 'unknown-kind', label: 'Manipuliert', completedAt: 4_000, correct: 1, total: 1, kind: 'other' },
]);
assert.equal(malformed.length, 1, 'Doppelte, ungültige und unbekannte Verlaufseinträge müssen entfernt werden.');

let history: LearningSessionRecord[] = [];
for (let index = 0; index < MAX_LEARNING_HISTORY + 10; index += 1) {
  history = appendLearningSession(history, {
    id: `session-${index}`,
    completedAt: 10_000 + index,
    kind: 'ranked',
    label: 'Gewertete Prüfung',
    category: 'technik',
    correct: 8,
    total: 10,
    accuracy: 80,
  });
}
assert.equal(history.length, MAX_LEARNING_HISTORY);
assert.equal(history[0]?.id, `session-${MAX_LEARNING_HISTORY + 9}`);

const trendHistory: LearningSessionRecord[] = [
  ...Array.from({ length: 5 }, (_, index) => ({
    id: `recent-${index}`,
    completedAt: 20_000 - index,
    kind: 'ranked' as const,
    label: 'Gewertete Prüfung',
    category: 'technik',
    correct: 8,
    total: 10,
    accuracy: 80,
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    id: `previous-${index}`,
    completedAt: 10_000 - index,
    kind: 'ranked' as const,
    label: 'Gewertete Prüfung',
    category: 'geschichte',
    correct: 6,
    total: 10,
    accuracy: 60,
  })),
];

const summary = buildLearningAnalytics(trendHistory, {
  technik: { roundsPlayed: 5, totalScore: 400, correctAnswers: 40, totalQuestions: 50 },
  geschichte: { roundsPlayed: 4, totalScore: 180, correctAnswers: 18, totalQuestions: 40 },
}, 0);
assert.equal(summary.recentAccuracy, 80);
assert.equal(summary.previousAccuracy, 60);
assert.equal(summary.trendPoints, 20);
assert.equal(summary.weakestCategory?.category, 'geschichte');
assert.equal(summary.strongestCategory?.category, 'technik');
assert.equal(summary.recommendation.type, 'weak-category');

const dueSummary = buildLearningAnalytics(trendHistory, undefined, 7);
assert.equal(dueSummary.recommendation.type, 'review');
assert.match(dueSummary.recommendation.title, /7 fällige Karten/);

const [main, panel, accountBoundary, privacyPanel] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningAnalyticsPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountSessionBoundary.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountPrivacyPanel.tsx'), 'utf8'),
]);
assert.match(main, /<LearningAnalyticsPanel\s*\/>/);
assert.match(panel, /deriveRankedSession/);
assert.match(panel, /MAX_LEARNING_HISTORY|analytics-updated/);
assert.match(panel, /keine Antworten oder Fragentexte/);
assert.match(panel, /beeinflusst weder Punkte noch Rangliste/);
assert.match(panel, /hydrationSuppressUntilRef/);
assert.match(panel, /setInterval\(check, 1500\)/);
assert.match(accountBoundary, /wissenpur:account-storage-reset/);
assert.match(accountBoundary, /authResolved/);
assert.match(privacyPanel, /readLocalAnalyticsForUser/);
assert.match(privacyPanel, /localDevice/);
assert.match(privacyPanel, /learningAnalytics: localLearningAnalytics/);
assert.match(privacyPanel, /nur auf diesem Gerät gespeicherte persönliche Lernanalyse/);

console.log('Lernanalyse, Verlauf, Trend, lokaler Datenexport und Tagesempfehlungen geprüft.');
