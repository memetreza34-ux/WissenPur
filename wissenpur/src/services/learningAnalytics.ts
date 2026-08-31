import type { CategoryStats, UserStats } from '../types';

export const MAX_LEARNING_HISTORY = 80;
export const ANALYTICS_STORAGE_KEY = 'wissenpur_learning_history_v1';
export const ANALYTICS_OWNER_KEY = 'wissenpur_learning_history_owner_v1';

export type LearningSessionKind = 'ranked' | 'mock';

export interface LearningSessionRecord {
  id: string;
  completedAt: number;
  kind: LearningSessionKind;
  label: string;
  category: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface LearningCategoryInsight {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
  rounds: number;
}

export interface LearningAnalyticsSummary {
  sessions: number;
  recentAccuracy: number | null;
  previousAccuracy: number | null;
  trendPoints: number | null;
  strongestCategory: LearningCategoryInsight | null;
  weakestCategory: LearningCategoryInsight | null;
  recommendation: {
    type: 'review' | 'weak-category' | 'mixed' | 'baseline';
    title: string;
    detail: string;
    category?: string;
  };
}

export interface EconomySnapshot {
  roundsPlayed: number;
  correctAnswers: number;
  totalQuestionsAnswered: number;
  lastDailyChallengeDate: string | null;
  categoryStats: Record<string, CategoryStats>;
}

const clampInt = (value: unknown, min: number, max: number): number => {
  const parsed = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : min;
  return Math.min(max, Math.max(min, parsed));
};

const safeString = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const createEconomySnapshot = (stats: UserStats): EconomySnapshot => ({
  roundsPlayed: clampInt(stats.roundsPlayed, 0, 1_000_000),
  correctAnswers: clampInt(stats.correctAnswers, 0, 100_000_000),
  totalQuestionsAnswered: clampInt(stats.totalQuestionsAnswered, 0, 100_000_000),
  lastDailyChallengeDate: safeString(stats.lastDailyChallengeDate, 10) || null,
  categoryStats: structuredClone(stats.categoryStats || {}),
});

const normalizeRecord = (value: unknown): LearningSessionRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Partial<LearningSessionRecord>;
  if (raw.kind !== 'ranked' && raw.kind !== 'mock') return null;
  const id = safeString(raw.id, 120);
  const label = safeString(raw.label, 100);
  const category = safeString(raw.category, 50) || 'all';
  const completedAt = clampInt(raw.completedAt, 0, Number.MAX_SAFE_INTEGER);
  const correct = clampInt(raw.correct, 0, 30);
  const total = clampInt(raw.total, 1, 30);
  if (!id || !label || completedAt <= 0 || correct > total) return null;
  return {
    id,
    completedAt,
    kind: raw.kind,
    label,
    category,
    correct,
    total,
    accuracy: Math.round(correct / total * 100),
  };
};

export const normalizeLearningHistory = (value: unknown): LearningSessionRecord[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const normalized: LearningSessionRecord[] = [];
  for (const raw of value) {
    const record = normalizeRecord(raw);
    if (!record || seen.has(record.id)) continue;
    seen.add(record.id);
    normalized.push(record);
  }
  return normalized
    .sort((left, right) => right.completedAt - left.completedAt)
    .slice(0, MAX_LEARNING_HISTORY);
};

export const appendLearningSession = (
  history: readonly LearningSessionRecord[],
  record: LearningSessionRecord,
): LearningSessionRecord[] =>
  normalizeLearningHistory([record, ...history]);

const categoryDelta = (
  before: Record<string, CategoryStats>,
  after: Record<string, CategoryStats>,
): string | null => {
  const candidates = Object.keys(after).filter((category) => {
    const previous = before[category];
    const current = after[category];
    if (!current) return false;
    return current.roundsPlayed - (previous?.roundsPlayed || 0) === 1 &&
      current.totalQuestions - (previous?.totalQuestions || 0) > 0;
  });
  return candidates.length === 1 ? candidates[0] : null;
};

export const deriveRankedSession = (
  before: EconomySnapshot,
  after: EconomySnapshot,
  completedAt = Date.now(),
): LearningSessionRecord | null => {
  if (after.roundsPlayed - before.roundsPlayed !== 1) return null;
  const correct = after.correctAnswers - before.correctAnswers;
  const total = after.totalQuestionsAnswered - before.totalQuestionsAnswered;
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 30 || correct < 0 || correct > total) return null;

  const category = categoryDelta(before.categoryStats, after.categoryStats) || 'all';
  const dailyCompleted = before.lastDailyChallengeDate !== after.lastDailyChallengeDate && Boolean(after.lastDailyChallengeDate);
  const label = dailyCompleted
    ? 'Daily Challenge'
    : category === 'all'
      ? 'Gewertete Prüfung – gemischt'
      : 'Gewertete Prüfung';

  return {
    id: `ranked-${after.roundsPlayed}-${completedAt}`,
    completedAt,
    kind: 'ranked',
    label,
    category: dailyCompleted ? 'daily' : category,
    correct,
    total,
    accuracy: Math.round(correct / total * 100),
  };
};

const weightedAccuracy = (sessions: readonly LearningSessionRecord[]): number | null => {
  const totals = sessions.reduce((result, session) => ({
    correct: result.correct + session.correct,
    total: result.total + session.total,
  }), { correct: 0, total: 0 });
  return totals.total > 0 ? Math.round(totals.correct / totals.total * 100) : null;
};

export const buildCategoryInsights = (
  categoryStats: Record<string, CategoryStats> | undefined,
): LearningCategoryInsight[] => Object.entries(categoryStats || {})
  .filter(([, value]) => value.totalQuestions > 0)
  .map(([category, value]) => ({
    category,
    correct: value.correctAnswers,
    total: value.totalQuestions,
    accuracy: Math.round(value.correctAnswers / value.totalQuestions * 100),
    rounds: value.roundsPlayed,
  }))
  .sort((left, right) => left.accuracy - right.accuracy || right.total - left.total);

export const buildLearningAnalytics = (
  history: readonly LearningSessionRecord[],
  categoryStats?: Record<string, CategoryStats>,
  dueCards = 0,
): LearningAnalyticsSummary => {
  const normalized = normalizeLearningHistory(history);
  const recent = normalized.slice(0, 5);
  const previous = normalized.slice(5, 10);
  const recentAccuracy = weightedAccuracy(recent);
  const previousAccuracy = weightedAccuracy(previous);
  const trendPoints = recentAccuracy !== null && previousAccuracy !== null
    ? recentAccuracy - previousAccuracy
    : null;
  const categories = buildCategoryInsights(categoryStats);
  const weakestCategory = categories[0] || null;
  const strongestCategory = categories.length > 0
    ? [...categories].sort((left, right) => right.accuracy - left.accuracy || right.total - left.total)[0]
    : null;

  let recommendation: LearningAnalyticsSummary['recommendation'];
  if (dueCards > 0) {
    recommendation = {
      type: 'review',
      title: `${dueCards} fällige Karte${dueCards === 1 ? '' : 'n'} wiederholen`,
      detail: 'Spaced Repetition hat Vorrang, bevor du neue Fragen startest.',
    };
  } else if (weakestCategory && weakestCategory.total >= 5 && weakestCategory.accuracy < 80) {
    recommendation = {
      type: 'weak-category',
      title: `${weakestCategory.category} gezielt trainieren`,
      detail: `Aktuell ${weakestCategory.accuracy}% richtig bei ${weakestCategory.total} beantworteten Fragen. Starte eine kurze 10-Fragen-Runde.`,
      category: weakestCategory.category,
    };
  } else if (normalized.length > 0) {
    recommendation = {
      type: 'mixed',
      title: 'Gemischten Wissenscheck starten',
      detail: 'Deine bekannten Bereiche sind stabil. Eine gemischte Runde hält die Wissensbreite aktiv.',
    };
  } else {
    recommendation = {
      type: 'baseline',
      title: 'Erste gewertete Runde spielen',
      detail: 'Nach der ersten neuen Prüfung kann WissenPur einen persönlichen Verlauf und Trends berechnen.',
    };
  }

  return {
    sessions: normalized.length,
    recentAccuracy,
    previousAccuracy,
    trendPoints,
    strongestCategory,
    weakestCategory,
    recommendation,
  };
};
