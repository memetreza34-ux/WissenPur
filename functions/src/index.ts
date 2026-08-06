import { randomInt, randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { QUESTION_BANK } from './generated/questionBank.js';

setGlobalOptions({
  region: 'europe-west1',
  memory: '256MiB',
  timeoutSeconds: 30,
  maxInstances: 10,
});

initializeApp();

const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b';
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK !== 'false';
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_QUESTIONS_PER_SESSION = 30;
const ECONOMY_VERSION = 1;

const db = getFirestore(DATABASE_ID);

interface BankQuestion {
  id: string;
  category: string;
  correctAnswer: number;
  optionCount: number;
}

const questionById = new Map<string, BankQuestion>(
  QUESTION_BANK.map((question) => [
    question.id,
    {
      id: question.id,
      category: question.category,
      correctAnswer: question.correctAnswer,
      optionCount: question.optionCount,
    },
  ]),
);

type QuizMode = 'standard' | 'daily' | 'blitz';
type PowerUpId = 'fiftyFifty' | 'timeFreeze' | 'secondChance';

type WeeklyGoal = {
  type: 'rounds' | 'correctAnswers' | 'dailyChallenges';
  target: number;
  current: number;
  lastResetDate: string;
};

type CategoryStat = {
  roundsPlayed: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
};

type EconomyState = {
  economyVersion: number;
  totalPoints: number;
  coins: number;
  currentStreak: number;
  bestStreak: number;
  roundsPlayed: number;
  correctAnswers: number;
  totalQuestionsAnswered: number;
  dailyQuestionsAnswered: number;
  lastDailyQuestionsDate: string | null;
  dailyRewardClaimed: boolean;
  lastPlayedDate: string | null;
  lastDailyChallengeDate: string | null;
  lastDailyRewardDate: string | null;
  lastSpinDate: string | null;
  achievements: string[];
  powerUps: Record<PowerUpId, number>;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  customPhotoURL?: string;
  categoryStats: Record<string, CategoryStat>;
  weeklyGoal: WeeklyGoal;
};

const ACHIEVEMENTS = [
  { id: 'newbie', type: 'points', threshold: 100 },
  { id: 'scholar', type: 'points', threshold: 1_000 },
  { id: 'master', type: 'points', threshold: 5_000 },
  { id: 'legend', type: 'points', threshold: 10_000 },
  { id: 'streak_3', type: 'streak', threshold: 3 },
  { id: 'streak_7', type: 'streak', threshold: 7 },
  { id: 'streak_30', type: 'streak', threshold: 30 },
  { id: 'perfect_10', type: 'roundCorrect', threshold: 10 },
  { id: 'correct_100', type: 'correct', threshold: 100 },
  { id: 'correct_500', type: 'correct', threshold: 500 },
  { id: 'all_categories', type: 'categories', threshold: 10 },
  { id: 'rounds_50', type: 'rounds', threshold: 50 },
] as const;

const SHOP_CATALOG = {
  fiftyFifty: { kind: 'powerUp', cost: 50, powerUp: 'fiftyFifty' },
  timeFreeze: { kind: 'powerUp', cost: 75, powerUp: 'timeFreeze' },
  secondChance: { kind: 'powerUp', cost: 100, powerUp: 'secondChance' },
  avatar1: {
    kind: 'avatar',
    cost: 200,
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  },
  avatar2: {
    kind: 'avatar',
    cost: 300,
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
  },
  avatar3: {
    kind: 'avatar',
    cost: 500,
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avery',
  },
  avatar4: {
    kind: 'avatar',
    cost: 800,
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1',
  },
  avatar5: {
    kind: 'avatar',
    cost: 1_000,
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2',
  },
  'Quiz-Gott': { kind: 'title', cost: 500 },
  Alleswisser: { kind: 'title', cost: 1_000 },
  Legende: { kind: 'title', cost: 2_500 },
} as const;

type ShopItemId = keyof typeof SHOP_CATALOG;

interface StartQuizRequest {
  questionIds: unknown;
  mode?: unknown;
  category?: unknown;
}

interface SubmitQuizRequest {
  sessionId: unknown;
  answers: unknown;
}

interface PurchaseRequest {
  itemId: unknown;
}

interface ConsumePowerUpRequest {
  powerUp: unknown;
}

function requireUser(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Bitte melde dich an, um Online-Fortschritt zu speichern.');
  }
  return uid;
}

function requireString(value: unknown, field: string, maxLength = 100): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} muss ein Text sein.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new HttpsError('invalid-argument', `${field} ist ungültig.`);
  }
  return trimmed;
}

function clampInt(value: unknown, fallback: number, min = 0, max = 10_000_000): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function stringOrNull(value: unknown, maxLength = 100): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function stringList(value: unknown, maxItems: number, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return [...new Set(value.filter((entry): entry is string => typeof entry === 'string' && entry.length <= 100))].slice(0, maxItems);
}

function dateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

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

function dayDifference(previous: string | null, current: string): number | null {
  if (!previous) return null;
  const previousMs = Date.parse(`${previous}T00:00:00Z`);
  const currentMs = Date.parse(`${current}T00:00:00Z`);
  if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return null;
  return Math.round((currentMs - previousMs) / 86_400_000);
}

function normalizeCategoryStats(value: unknown): Record<string, CategoryStat> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, CategoryStat> = {};
  for (const [category, raw] of Object.entries(value).slice(0, 50)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const data = raw as Record<string, unknown>;
    result[category] = {
      roundsPlayed: clampInt(data.roundsPlayed, 0, 0, 1_000_000),
      totalScore: clampInt(data.totalScore, 0, 0, 100_000_000),
      correctAnswers: clampInt(data.correctAnswers, 0, 0, 100_000_000),
      totalQuestions: clampInt(data.totalQuestions, 0, 0, 100_000_000),
    };
  }
  return result;
}

function normalizeWeeklyGoal(value: unknown, today: string): WeeklyGoal {
  const week = startOfWeekKey(today);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { type: 'rounds', target: 5, current: 0, lastResetDate: week };
  }

  const data = value as Record<string, unknown>;
  const type = data.type === 'correctAnswers' || data.type === 'dailyChallenges' ? data.type : 'rounds';
  const target = clampInt(data.target, type === 'correctAnswers' ? 30 : type === 'dailyChallenges' ? 3 : 5, 1, 1_000);
  const lastResetDate = stringOrNull(data.lastResetDate, 10);

  if (lastResetDate !== week) {
    return { type, target, current: 0, lastResetDate: week };
  }

  return {
    type,
    target,
    current: clampInt(data.current, 0, 0, target),
    lastResetDate: week,
  };
}

function defaultEconomy(today: string): EconomyState {
  return {
    economyVersion: ECONOMY_VERSION,
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
    weeklyGoal: { type: 'rounds', target: 5, current: 0, lastResetDate: startOfWeekKey(today) },
  };
}

function normalizeEconomy(data: Record<string, unknown> | undefined, today: string): EconomyState {
  if (!data || data.economyVersion !== ECONOMY_VERSION) {
    return defaultEconomy(today);
  }

  const powerUpsRaw = data.powerUps && typeof data.powerUps === 'object' && !Array.isArray(data.powerUps)
    ? data.powerUps as Record<string, unknown>
    : {};

  const state: EconomyState = {
    economyVersion: ECONOMY_VERSION,
    totalPoints: clampInt(data.totalPoints, 0),
    coins: clampInt(data.coins, 0, 0, 1_000_000),
    currentStreak: clampInt(data.currentStreak, 0, 0, 10_000),
    bestStreak: clampInt(data.bestStreak, 0, 0, 10_000),
    roundsPlayed: clampInt(data.roundsPlayed, 0, 0, 1_000_000),
    correctAnswers: clampInt(data.correctAnswers, 0, 0, 100_000_000),
    totalQuestionsAnswered: clampInt(data.totalQuestionsAnswered, 0, 0, 100_000_000),
    dailyQuestionsAnswered: clampInt(data.dailyQuestionsAnswered, 0, 0, 10_000),
    lastDailyQuestionsDate: stringOrNull(data.lastDailyQuestionsDate, 10),
    dailyRewardClaimed: data.dailyRewardClaimed === true,
    lastPlayedDate: stringOrNull(data.lastPlayedDate, 10),
    lastDailyChallengeDate: stringOrNull(data.lastDailyChallengeDate, 10),
    lastDailyRewardDate: stringOrNull(data.lastDailyRewardDate, 10),
    lastSpinDate: stringOrNull(data.lastSpinDate, 10),
    achievements: stringList(data.achievements, 100, []),
    powerUps: {
      fiftyFifty: clampInt(powerUpsRaw.fiftyFifty, 0, 0, 10_000),
      timeFreeze: clampInt(powerUpsRaw.timeFreeze, 0, 0, 10_000),
      secondChance: clampInt(powerUpsRaw.secondChance, 0, 0, 10_000),
    },
    unlockedAvatars: stringList(data.unlockedAvatars, 50, ['default']),
    unlockedTitles: stringList(data.unlockedTitles, 50, ['Neuling']),
    equippedTitle: stringOrNull(data.equippedTitle, 100) || 'Neuling',
    categoryStats: normalizeCategoryStats(data.categoryStats),
    weeklyGoal: normalizeWeeklyGoal(data.weeklyGoal, today),
  };

  const customPhotoURL = stringOrNull(data.customPhotoURL, 1_000);
  if (customPhotoURL) state.customPhotoURL = customPhotoURL;

  if (state.lastDailyQuestionsDate !== today) {
    state.dailyQuestionsAnswered = 0;
    state.dailyRewardClaimed = false;
    state.lastDailyQuestionsDate = today;
  }

  return state;
}

function awardAchievements(state: EconomyState, roundCorrect = 0): number {
  const unlocked = new Set(state.achievements);
  const categoryCount = Object.keys(state.categoryStats).length;
  let newlyUnlocked = 0;

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) continue;

    const earned =
      (achievement.type === 'points' && state.totalPoints >= achievement.threshold) ||
      (achievement.type === 'streak' && state.currentStreak >= achievement.threshold) ||
      (achievement.type === 'roundCorrect' && roundCorrect >= achievement.threshold) ||
      (achievement.type === 'correct' && state.correctAnswers >= achievement.threshold) ||
      (achievement.type === 'categories' && categoryCount >= achievement.threshold) ||
      (achievement.type === 'rounds' && state.roundsPlayed >= achievement.threshold);

    if (earned) {
      unlocked.add(achievement.id);
      newlyUnlocked += 1;
    }
  }

  state.achievements = [...unlocked];
  state.coins += newlyUnlocked * 50;
  return newlyUnlocked;
}

function publicEconomy(state: EconomyState) {
  return {
    economyVersion: state.economyVersion,
    totalPoints: state.totalPoints,
    coins: state.coins,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    roundsPlayed: state.roundsPlayed,
    correctAnswers: state.correctAnswers,
    totalQuestionsAnswered: state.totalQuestionsAnswered,
    dailyQuestionsAnswered: state.dailyQuestionsAnswered,
    lastDailyQuestionsDate: state.lastDailyQuestionsDate,
    dailyRewardClaimed: state.dailyRewardClaimed,
    lastPlayedDate: state.lastPlayedDate,
    lastDailyChallengeDate: state.lastDailyChallengeDate,
    lastDailyRewardDate: state.lastDailyRewardDate,
    lastSpinDate: state.lastSpinDate,
    achievements: state.achievements,
    powerUps: state.powerUps,
    unlockedAvatars: state.unlockedAvatars,
    unlockedTitles: state.unlockedTitles,
    equippedTitle: state.equippedTitle,
    customPhotoURL: state.customPhotoURL || null,
    categoryStats: state.categoryStats,
    weeklyGoal: state.weeklyGoal,
  };
}

function leaderboardProfile(
  uid: string,
  userData: Record<string, unknown> | undefined,
  state: EconomyState,
  authToken: Record<string, unknown> | undefined,
) {
  const customName = stringOrNull(userData?.customName, 100);
  const storedName = stringOrNull(userData?.displayName, 100);
  const tokenName = stringOrNull(authToken?.name, 100);
  const displayName = customName || storedName || tokenName || 'WissenPur-Nutzer';

  const storedPhoto = stringOrNull(userData?.photoURL, 1_000);
  const photoURL = state.customPhotoURL || storedPhoto || '';

  return {
    uid,
    displayName,
    photoURL,
    totalPoints: state.totalPoints,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function parseQuizMode(value: unknown): QuizMode {
  if (value === 'daily' || value === 'blitz') return value;
  return 'standard';
}

function parseQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_QUESTIONS_PER_SESSION) {
    throw new HttpsError('invalid-argument', `Eine Ranglistenrunde benötigt 1 bis ${MAX_QUESTIONS_PER_SESSION} Fragen.`);
  }

  const questionIds = value.map((entry) => requireString(entry, 'questionId', 120));
  if (new Set(questionIds).size !== questionIds.length) {
    throw new HttpsError('invalid-argument', 'Eine Frage darf pro Runde nur einmal vorkommen.');
  }

  const missing = questionIds.filter((id) => !questionById.has(id));
  if (missing.length > 0) {
    throw new HttpsError(
      'failed-precondition',
      'KI-, Projekt- und benutzerdefinierte Fragen sind Übungsmodus und vergeben keine Ranglistenpunkte.',
    );
  }

  return questionIds;
}

function parseAnswers(value: unknown): Map<string, number> {
  if (!Array.isArray(value) || value.length > MAX_QUESTIONS_PER_SESSION) {
    throw new HttpsError('invalid-argument', 'Die Antworten sind ungültig.');
  }

  const answers = new Map<string, number>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new HttpsError('invalid-argument', 'Eine Antwort ist ungültig.');
    }
    const entry = raw as Record<string, unknown>;
    const questionId = requireString(entry.questionId, 'questionId', 120);
    if (answers.has(questionId)) {
      throw new HttpsError('invalid-argument', 'Eine Frage wurde mehrfach beantwortet.');
    }
    const answer = entry.answer;
    if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < -1 || answer > 3) {
      throw new HttpsError('invalid-argument', 'Ein Antwortindex ist ungültig.');
    }
    answers.set(questionId, answer);
  }
  return answers;
}

export const startRankedQuiz = onCall<StartQuizRequest>(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const questionIds = parseQuestionIds(request.data.questionIds);
    const mode = parseQuizMode(request.data.mode);
    const category = typeof request.data.category === 'string'
      ? request.data.category.trim().slice(0, 50)
      : 'all';

    if (mode === 'daily' && questionIds.length !== 10) {
      throw new HttpsError('invalid-argument', 'Die Daily Challenge muss genau 10 Fragen enthalten.');
    }

    const sessionId = randomUUID();
    const now = Date.now();

    await db.collection('quizSessions').doc(sessionId).create({
      uid,
      questionIds,
      mode,
      category,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + SESSION_TTL_MS),
    });

    logger.info('Ranked quiz session created', { uid, sessionId, mode, questionCount: questionIds.length });

    return {
      sessionId,
      expiresAt: now + SESSION_TTL_MS,
      ranked: true,
    };
  },
);

export const submitRankedQuiz = onCall<SubmitQuizRequest>(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const sessionId = requireString(request.data.sessionId, 'sessionId', 100);
    const answers = parseAnswers(request.data.answers);
    const sessionRef = db.collection('quizSessions').doc(sessionId);
    const userRef = db.collection('users').doc(uid);
    const leaderboardRef = db.collection('leaderboard').doc(uid);
    const today = dateKey();

    const result = await db.runTransaction(async (transaction) => {
      const [sessionSnapshot, userSnapshot] = await Promise.all([
        transaction.get(sessionRef),
        transaction.get(userRef),
      ]);

      if (!sessionSnapshot.exists) {
        throw new HttpsError('not-found', 'Diese Quizrunde wurde nicht gefunden.');
      }

      const session = sessionSnapshot.data() as Record<string, unknown>;
      if (session.uid !== uid) {
        throw new HttpsError('permission-denied', 'Diese Quizrunde gehört zu einem anderen Konto.');
      }

      if (session.status === 'submitted') {
        return session.result;
      }

      const expiresAt = session.expiresAt;
      if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() < Date.now()) {
        throw new HttpsError('deadline-exceeded', 'Diese Quizrunde ist abgelaufen.');
      }

      const questionIds = Array.isArray(session.questionIds)
        ? session.questionIds.filter((entry): entry is string => typeof entry === 'string')
        : [];
      const allowedIds = new Set(questionIds);

      for (const questionId of answers.keys()) {
        if (!allowedIds.has(questionId)) {
          throw new HttpsError('invalid-argument', 'Die Antwort gehört nicht zu dieser Quizrunde.');
        }
      }

      let correct = 0;
      for (const questionId of questionIds) {
        const question = questionById.get(questionId);
        if (!question) {
          throw new HttpsError('failed-precondition', 'Der Fragenkatalog wurde aktualisiert. Bitte starte eine neue Runde.');
        }
        if (answers.get(questionId) === question.correctAnswer) correct += 1;
      }

      const total = questionIds.length;
      const mode = parseQuizMode(session.mode);
      const category = typeof session.category === 'string' ? session.category : 'all';
      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const state = normalizeEconomy(userData, today);

      const firstDailyCompletion = mode === 'daily' && state.lastDailyChallengeDate !== today;
      const pointsEarned = correct * 10 + (firstDailyCompletion ? 50 : 0);
      const coinsEarned = correct + 5 + (firstDailyCompletion ? 15 : 0);

      const streakDifference = dayDifference(state.lastPlayedDate, today);
      if (state.lastPlayedDate !== today) {
        state.currentStreak = streakDifference === 1 ? state.currentStreak + 1 : 1;
      }
      state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
      state.lastPlayedDate = today;

      state.totalPoints += pointsEarned;
      state.coins += coinsEarned;
      state.roundsPlayed += 1;
      state.correctAnswers += correct;
      state.totalQuestionsAnswered += total;
      state.dailyQuestionsAnswered += total;
      state.lastDailyQuestionsDate = today;

      if (firstDailyCompletion) {
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
      } else if (firstDailyCompletion) {
        state.weeklyGoal.current = Math.min(state.weeklyGoal.target, state.weeklyGoal.current + 1);
      }

      const achievementsUnlocked = awardAchievements(state, correct);
      const publicState = publicEconomy(state);
      const submissionResult = {
        sessionId,
        correct,
        total,
        pointsEarned,
        coinsEarned: coinsEarned + achievementsUnlocked * 50,
        achievementsUnlocked,
        stats: publicState,
      };

      transaction.set(userRef, {
        uid,
        ...publicState,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(
        leaderboardRef,
        leaderboardProfile(uid, userData, state, request.auth?.token),
        { merge: true },
      );
      transaction.update(sessionRef, {
        status: 'submitted',
        submittedAt: FieldValue.serverTimestamp(),
        result: submissionResult,
      });

      return submissionResult;
    });

    logger.info('Ranked quiz submitted', { uid, sessionId });
    return result;
  },
);

export const claimDailyQuestReward = onCall(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const userRef = db.collection('users').doc(uid);
    const leaderboardRef = db.collection('leaderboard').doc(uid);
    const today = dateKey();

    return db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const state = normalizeEconomy(userData, today);

      if (state.lastDailyQuestionsDate !== today || state.dailyQuestionsAnswered < 10) {
        throw new HttpsError('failed-precondition', 'Beantworte heute zuerst mindestens 10 Ranglistenfragen.');
      }
      if (state.dailyRewardClaimed) {
        throw new HttpsError('already-exists', 'Die heutige Quest-Belohnung wurde bereits abgeholt.');
      }

      state.dailyRewardClaimed = true;
      state.totalPoints += 100;
      state.coins += 50;
      const achievementsUnlocked = awardAchievements(state);
      const publicState = publicEconomy(state);

      transaction.set(userRef, {
        uid,
        ...publicState,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(
        leaderboardRef,
        leaderboardProfile(uid, userData, state, request.auth?.token),
        { merge: true },
      );

      return {
        pointsEarned: 100,
        coinsEarned: 50 + achievementsUnlocked * 50,
        achievementsUnlocked,
        stats: publicState,
      };
    });
  },
);

export const spinDailyWheel = onCall(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const userRef = db.collection('users').doc(uid);
    const today = dateKey();

    return db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const state = normalizeEconomy(userData, today);

      if (state.lastSpinDate === today) {
        throw new HttpsError('already-exists', 'Das tägliche Glücksrad wurde heute bereits genutzt.');
      }

      const roll = randomInt(100);
      let reward: { type: 'coins' | PowerUpId; amount: number };
      if (roll < 35) reward = { type: 'coins', amount: 25 };
      else if (roll < 60) reward = { type: 'coins', amount: 50 };
      else if (roll < 75) reward = { type: 'fiftyFifty', amount: 1 };
      else if (roll < 87) reward = { type: 'timeFreeze', amount: 1 };
      else if (roll < 95) reward = { type: 'secondChance', amount: 1 };
      else reward = { type: 'coins', amount: 100 };

      if (reward.type === 'coins') state.coins += reward.amount;
      else state.powerUps[reward.type] += reward.amount;
      state.lastSpinDate = today;

      const publicState = publicEconomy(state);
      transaction.set(userRef, {
        uid,
        ...publicState,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return { reward, stats: publicState };
    });
  },
);

export const purchaseShopItem = onCall<PurchaseRequest>(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const itemId = requireString(request.data.itemId, 'itemId', 100) as ShopItemId;
    const item = SHOP_CATALOG[itemId];
    if (!item) {
      throw new HttpsError('not-found', 'Dieser Shop-Artikel existiert nicht.');
    }

    const userRef = db.collection('users').doc(uid);
    const today = dateKey();

    return db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const state = normalizeEconomy(userData, today);

      if (state.coins < item.cost) {
        throw new HttpsError('failed-precondition', 'Du hast nicht genügend Münzen.');
      }

      if (item.kind === 'avatar' && state.unlockedAvatars.includes(itemId)) {
        throw new HttpsError('already-exists', 'Dieser Avatar ist bereits freigeschaltet.');
      }
      if (item.kind === 'title' && state.unlockedTitles.includes(itemId)) {
        throw new HttpsError('already-exists', 'Dieser Titel ist bereits freigeschaltet.');
      }

      state.coins -= item.cost;
      if (item.kind === 'powerUp') {
        state.powerUps[item.powerUp] += 1;
      } else if (item.kind === 'avatar') {
        state.unlockedAvatars.push(itemId);
        state.customPhotoURL = item.url;
      } else {
        state.unlockedTitles.push(itemId);
        state.equippedTitle = itemId;
      }

      const publicState = publicEconomy(state);
      transaction.set(userRef, {
        uid,
        ...publicState,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return { itemId, cost: item.cost, stats: publicState };
    });
  },
);

export const consumePowerUp = onCall<ConsumePowerUpRequest>(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const uid = requireUser(request);
    const powerUp = requireString(request.data.powerUp, 'powerUp', 50) as PowerUpId;
    if (powerUp !== 'fiftyFifty' && powerUp !== 'timeFreeze' && powerUp !== 'secondChance') {
      throw new HttpsError('invalid-argument', 'Dieses Power-up existiert nicht.');
    }

    const userRef = db.collection('users').doc(uid);
    const today = dateKey();

    return db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.exists ? userSnapshot.data() as Record<string, unknown> : undefined;
      const state = normalizeEconomy(userData, today);

      if (state.powerUps[powerUp] < 1) {
        throw new HttpsError('failed-precondition', 'Dieses Power-up ist nicht verfügbar.');
      }

      state.powerUps[powerUp] -= 1;
      const publicState = publicEconomy(state);
      transaction.set(userRef, {
        uid,
        ...publicState,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return { powerUp, stats: publicState };
    });
  },
);
