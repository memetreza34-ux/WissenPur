import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const firebaseApp = getApps()[0] ?? initializeApp();
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b';
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK !== 'false';
const db = getFirestore(firebaseApp, DATABASE_ID);

interface RecordRoundRequest {
  roundId: unknown;
  correct: unknown;
  total: unknown;
  mode?: unknown;
  category?: unknown;
}

interface PowerUps {
  fiftyFifty: number;
  timeFreeze: number;
  secondChance: number;
}

interface EconomyState {
  economyVersion: 1;
  totalPoints: number;
  coins: number;
  currentStreak: number;
  bestStreak: number;
  roundsPlayed: number;
  correctAnswers: number;
  totalQuestionsAnswered: number;
  dailyQuestionsAnswered: number;
  lastDailyQuestionsDate: string;
  dailyRewardClaimed: boolean;
  lastPlayedDate: string | null;
  lastDailyChallengeDate: string | null;
  lastDailyRewardDate: string | null;
  lastSpinDate: string | null;
  achievements: string[];
  powerUps: PowerUps;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  categoryStats: Record<string, {
    roundsPlayed: number;
    totalScore: number;
    correctAnswers: number;
    totalQuestions: number;
  }>;
  weeklyGoal: {
    type: 'rounds' | 'correctAnswers' | 'dailyChallenges';
    target: number;
    current: number;
    lastResetDate: string;
  };
}

function dateKey(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function startOfWeekKey(today: string): string {
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - weekday + 1);
  return date.toISOString().slice(0, 10);
}

function dateDifference(previous: string | null, current: string): number | null {
  if (!previous) return null;
  const previousMs = Date.parse(`${previous}T00:00:00Z`);
  const currentMs = Date.parse(`${current}T00:00:00Z`);
  if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return null;
  return Math.round((currentMs - previousMs) / 86_400_000);
}

function integer(value: unknown, fallback: number, min = 0, max = 100_000_000): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function requiredInteger(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new HttpsError('invalid-argument', `${field} ist ungültig.`);
  }
  return value;
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} ist ungültig.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new HttpsError('invalid-argument', `${field} ist ungültig.`);
  }
  return trimmed;
}

function optionalDate(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length <= 100))].slice(0, 100);
}

function defaultState(today: string): EconomyState {
  return {
    economyVersion: 1,
    totalPoints: 0,
    coins: 0,
    currentStreak: 0,
    bestStreak: 0,
    roundsPlayed: 0,
    correctAnswers: 0,
    totalQuestionsAnswered: 0,
    dailyQuestionsAnswered: 0,
    lastDailyQuestionsDate: today,
    dailyRewardClaimed: false,
    lastPlayedDate: null,
    lastDailyChallengeDate: null,
    lastDailyRewardDate: null,
    lastSpinDate: null,
    achievements: [],
    powerUps: { fiftyFifty: 3, timeFreeze: 3, secondChance: 3 },
    unlockedAvatars: ['default'],
    unlockedTitles: ['Neuling'],
    equippedTitle: 'Neuling',
    categoryStats: {},
    weeklyGoal: {
      type: 'rounds',
      target: 5,
      current: 0,
      lastResetDate: startOfWeekKey(today),
    },
  };
}

function normalizeState(data: Record<string, unknown> | undefined, today: string): EconomyState {
  if (!data || data.economyVersion !== 1) return defaultState(today);

  const base = defaultState(today);
  const powerUps = data.powerUps && typeof data.powerUps === 'object' && !Array.isArray(data.powerUps)
    ? data.powerUps as Record<string, unknown>
    : {};
  const categoryStats = data.categoryStats && typeof data.categoryStats === 'object' && !Array.isArray(data.categoryStats)
    ? data.categoryStats as EconomyState['categoryStats']
    : {};
  const weeklyGoalRaw = data.weeklyGoal && typeof data.weeklyGoal === 'object' && !Array.isArray(data.weeklyGoal)
    ? data.weeklyGoal as Record<string, unknown>
    : {};
  const weeklyType = weeklyGoalRaw.type === 'correctAnswers' || weeklyGoalRaw.type === 'dailyChallenges'
    ? weeklyGoalRaw.type
    : 'rounds';
  const week = startOfWeekKey(today);

  return {
    economyVersion: 1,
    totalPoints: integer(data.totalPoints, 0, 0, 10_000_000),
    coins: integer(data.coins, 0, 0, 1_000_000),
    currentStreak: integer(data.currentStreak, 0, 0, 10_000),
    bestStreak: integer(data.bestStreak, 0, 0, 10_000),
    roundsPlayed: integer(data.roundsPlayed, 0),
    correctAnswers: integer(data.correctAnswers, 0),
    totalQuestionsAnswered: integer(data.totalQuestionsAnswered, 0),
    dailyQuestionsAnswered: optionalDate(data.lastDailyQuestionsDate) === today
      ? integer(data.dailyQuestionsAnswered, 0, 0, 10_000)
      : 0,
    lastDailyQuestionsDate: today,
    dailyRewardClaimed: optionalDate(data.lastDailyQuestionsDate) === today && data.dailyRewardClaimed === true,
    lastPlayedDate: optionalDate(data.lastPlayedDate),
    lastDailyChallengeDate: optionalDate(data.lastDailyChallengeDate),
    lastDailyRewardDate: optionalDate(data.lastDailyRewardDate),
    lastSpinDate: optionalDate(data.lastSpinDate),
    achievements: stringArray(data.achievements, []),
    powerUps: {
      fiftyFifty: integer(powerUps.fiftyFifty, base.powerUps.fiftyFifty, 0, 10_000),
      timeFreeze: integer(powerUps.timeFreeze, base.powerUps.timeFreeze, 0, 10_000),
      secondChance: integer(powerUps.secondChance, base.powerUps.secondChance, 0, 10_000),
    },
    unlockedAvatars: stringArray(data.unlockedAvatars, base.unlockedAvatars),
    unlockedTitles: stringArray(data.unlockedTitles, base.unlockedTitles),
    equippedTitle: typeof data.equippedTitle === 'string' ? data.equippedTitle.slice(0, 100) : base.equippedTitle,
    categoryStats,
    weeklyGoal: {
      type: weeklyType,
      target: integer(weeklyGoalRaw.target, base.weeklyGoal.target, 1, 1_000),
      current: optionalDate(weeklyGoalRaw.lastResetDate) === week
        ? integer(weeklyGoalRaw.current, 0, 0, 1_000)
        : 0,
      lastResetDate: week,
    },
  };
}

function leaderboardData(
  uid: string,
  data: Record<string, unknown> | undefined,
  totalPoints: number,
  token: Record<string, unknown> | undefined,
) {
  const nameCandidates = [data?.customName, data?.displayName, token?.name];
  const displayName = nameCandidates.find(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0,
  )?.trim().slice(0, 100) || 'WissenPur-Nutzer';

  const photoCandidates = [data?.customPhotoURL, data?.photoURL];
  const photoURL = photoCandidates.find(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.length <= 1_000,
  ) || '';

  return {
    uid,
    displayName,
    photoURL,
    totalPoints,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Transitional scoring endpoint for the current monolithic UI. The function
 * ignores client-calculated points and coins, bounds all counters, rate-limits
 * submissions, and calculates rewards itself. Static ranked sessions remain
 * the stronger long-term path.
 */
export const recordRoundResult = onCall<RecordRoundRequest>(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Bitte melde dich an, um Online-Fortschritt zu speichern.');
    }

    const roundId = requiredString(request.data.roundId, 'roundId', 100);
    const total = requiredInteger(request.data.total, 'total', 1, 30);
    const correct = requiredInteger(request.data.correct, 'correct', 0, total);
    const mode = request.data.mode === 'daily' || request.data.mode === 'blitz'
      ? request.data.mode
      : 'standard';
    const category = typeof request.data.category === 'string'
      ? request.data.category.trim().slice(0, 50)
      : 'all';

    const receiptRef = db.collection('roundReceipts').doc(`${uid}_${roundId}`);
    const userRef = db.collection('users').doc(uid);
    const leaderboardRef = db.collection('leaderboard').doc(uid);
    const today = dateKey();

    return db.runTransaction(async (transaction) => {
      const [receiptSnapshot, userSnapshot] = await Promise.all([
        transaction.get(receiptRef),
        transaction.get(userRef),
      ]);

      if (receiptSnapshot.exists) return receiptSnapshot.data()?.result;

      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const lastSubmitted = userData?.lastRoundSubmittedAt;
      if (lastSubmitted instanceof Timestamp && Date.now() - lastSubmitted.toMillis() < 15_000) {
        throw new HttpsError('resource-exhausted', 'Bitte warte kurz, bevor du die nächste Runde speicherst.');
      }

      const state = normalizeState(userData, today);
      const firstDaily = mode === 'daily' && state.lastDailyChallengeDate !== today;
      const pointsEarned = correct * 10 + (firstDaily ? 50 : 0);
      const coinsEarned = correct + 5 + (firstDaily ? 15 : 0);
      const streakGap = dateDifference(state.lastPlayedDate, today);

      if (state.lastPlayedDate !== today) {
        state.currentStreak = streakGap === 1 ? state.currentStreak + 1 : 1;
      }
      state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
      state.lastPlayedDate = today;
      state.totalPoints += pointsEarned;
      state.coins += coinsEarned;
      state.roundsPlayed += 1;
      state.correctAnswers += correct;
      state.totalQuestionsAnswered += total;
      state.dailyQuestionsAnswered += total;

      if (firstDaily) {
        state.lastDailyChallengeDate = today;
        state.lastDailyRewardDate = today;
      }

      if (category !== 'all' && category !== 'daily' && category !== 'blitz') {
        const previous = state.categoryStats[category] || {
          roundsPlayed: 0,
          totalScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
        };
        state.categoryStats[category] = {
          roundsPlayed: previous.roundsPlayed + 1,
          totalScore: previous.totalScore + pointsEarned,
          correctAnswers: previous.correctAnswers + correct,
          totalQuestions: previous.totalQuestions + total,
        };
      }

      if (state.weeklyGoal.type === 'rounds') {
        state.weeklyGoal.current = Math.min(state.weeklyGoal.target, state.weeklyGoal.current + 1);
      } else if (state.weeklyGoal.type === 'correctAnswers') {
        state.weeklyGoal.current = Math.min(state.weeklyGoal.target, state.weeklyGoal.current + correct);
      } else if (firstDaily) {
        state.weeklyGoal.current = Math.min(state.weeklyGoal.target, state.weeklyGoal.current + 1);
      }

      const result = {
        roundId,
        correct,
        total,
        pointsEarned,
        coinsEarned,
        trustedLevel: 'bounded-client-result',
        stats: state,
      };

      transaction.set(userRef, {
        uid,
        ...state,
        lastRoundSubmittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(
        leaderboardRef,
        leaderboardData(uid, userData, state.totalPoints, request.auth?.token),
        { merge: true },
      );
      transaction.create(receiptRef, {
        uid,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
        result,
      });

      return result;
    });
  },
);
