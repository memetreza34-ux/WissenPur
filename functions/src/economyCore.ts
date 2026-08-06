export const ECONOMY_VERSION = 1 as const;

export type QuizMode = 'standard' | 'daily' | 'blitz';
export type PowerUpId = 'fiftyFifty' | 'timeFreeze' | 'secondChance';
export type EconomyErrorCode =
  | 'invalid-argument'
  | 'failed-precondition'
  | 'already-exists'
  | 'not-found';

export class EconomyDomainError extends Error {
  constructor(
    public readonly code: EconomyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'EconomyDomainError';
  }
}

export interface WeeklyGoal {
  type: 'rounds' | 'correctAnswers' | 'dailyChallenges';
  target: number;
  current: number;
  lastResetDate: string;
}

export interface CategoryStat {
  roundsPlayed: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface EconomyState {
  economyVersion: typeof ECONOMY_VERSION;
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
  powerUps: Record<PowerUpId, number>;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  customPhotoURL?: string;
  categoryStats: Record<string, CategoryStat>;
  weeklyGoal: WeeklyGoal;
}

export interface PublicEconomyState {
  economyVersion: typeof ECONOMY_VERSION;
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
  powerUps: Record<PowerUpId, number>;
  unlockedAvatars: string[];
  unlockedTitles: string[];
  equippedTitle: string;
  customPhotoURL: string | null;
  categoryStats: Record<string, CategoryStat>;
  weeklyGoal: WeeklyGoal;
}

export interface RankedRoundInput {
  correct: number;
  total: number;
  mode: QuizMode;
  category: string;
  today: string;
}

export interface RankedRoundOutcome {
  state: EconomyState;
  pointsEarned: number;
  coinsEarned: number;
  achievementsUnlocked: number;
  firstDailyCompletion: boolean;
}

export interface SpinReward {
  type: 'coins' | PowerUpId;
  amount: number;
}

export const SHOP_CATALOG = {
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

export type ShopItemId = keyof typeof SHOP_CATALOG;

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

export const clampInt = (
  value: unknown,
  fallback: number,
  min = 0,
  max = 10_000_000,
): number => {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
};

export const stringOrNull = (value: unknown, maxLength = 100): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
};

const stringList = (value: unknown, maxItems: number, fallback: string[]): string[] => {
  if (!Array.isArray(value)) return [...fallback];
  return [...new Set(
    value.filter((entry): entry is string =>
      typeof entry === 'string' && entry.length > 0 && entry.length <= 100,
    ),
  )].slice(0, maxItems);
};

export const berlinDateKey = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const startOfWeekKey = (today: string): string => {
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - weekday + 1);
  return date.toISOString().slice(0, 10);
};

export const dayDifference = (previous: string | null, current: string): number | null => {
  if (!previous) return null;
  const previousMs = Date.parse(`${previous}T00:00:00Z`);
  const currentMs = Date.parse(`${current}T00:00:00Z`);
  if (!Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return null;
  return Math.round((currentMs - previousMs) / 86_400_000);
};

const normalizeCategoryStats = (value: unknown): Record<string, CategoryStat> => {
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
};

const normalizeWeeklyGoal = (value: unknown, today: string): WeeklyGoal => {
  const week = startOfWeekKey(today);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { type: 'rounds', target: 5, current: 0, lastResetDate: week };
  }

  const data = value as Record<string, unknown>;
  const type = data.type === 'correctAnswers' || data.type === 'dailyChallenges'
    ? data.type
    : 'rounds';
  const fallbackTarget = type === 'correctAnswers' ? 30 : type === 'dailyChallenges' ? 3 : 5;
  const target = clampInt(data.target, fallbackTarget, 1, 1_000);
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
};

export const defaultEconomy = (today: string): EconomyState => ({
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
  weeklyGoal: {
    type: 'rounds',
    target: 5,
    current: 0,
    lastResetDate: startOfWeekKey(today),
  },
});

export const normalizeEconomy = (
  data: Record<string, unknown> | undefined,
  today: string,
): EconomyState => {
  if (!data || data.economyVersion !== ECONOMY_VERSION) return defaultEconomy(today);

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
    lastDailyQuestionsDate: stringOrNull(data.lastDailyQuestionsDate, 10) || today,
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
};

export const awardAchievements = (state: EconomyState, roundCorrect = 0): number => {
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
};

export const toPublicEconomy = (state: EconomyState): PublicEconomyState => ({
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
  achievements: [...state.achievements],
  powerUps: { ...state.powerUps },
  unlockedAvatars: [...state.unlockedAvatars],
  unlockedTitles: [...state.unlockedTitles],
  equippedTitle: state.equippedTitle,
  customPhotoURL: state.customPhotoURL || null,
  categoryStats: structuredClone(state.categoryStats),
  weeklyGoal: { ...state.weeklyGoal },
});

export const applyRankedRound = (
  originalState: EconomyState,
  input: RankedRoundInput,
): RankedRoundOutcome => {
  const { correct, total, mode, category, today } = input;
  if (!Number.isInteger(total) || total < 1 || total > 30) {
    throw new EconomyDomainError('invalid-argument', 'Die Anzahl der Fragen ist ungültig.');
  }
  if (!Number.isInteger(correct) || correct < 0 || correct > total) {
    throw new EconomyDomainError('invalid-argument', 'Die Anzahl richtiger Antworten ist ungültig.');
  }

  const state = structuredClone(originalState);
  const firstDailyCompletion = mode === 'daily' && state.lastDailyChallengeDate !== today;
  const pointsEarned = correct * 10 + (firstDailyCompletion ? 50 : 0);
  const baseCoinsEarned = correct + 5 + (firstDailyCompletion ? 15 : 0);

  const streakDifference = dayDifference(state.lastPlayedDate, today);
  if (state.lastPlayedDate !== today) {
    state.currentStreak = streakDifference === 1 ? state.currentStreak + 1 : 1;
  }
  state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
  state.lastPlayedDate = today;

  state.totalPoints += pointsEarned;
  state.coins += baseCoinsEarned;
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
  return {
    state,
    pointsEarned,
    coinsEarned: baseCoinsEarned + achievementsUnlocked * 50,
    achievementsUnlocked,
    firstDailyCompletion,
  };
};

export const claimDailyQuest = (originalState: EconomyState, today: string): EconomyState => {
  const state = structuredClone(originalState);
  if (state.lastDailyQuestionsDate !== today || state.dailyQuestionsAnswered < 10) {
    throw new EconomyDomainError(
      'failed-precondition',
      'Beantworte heute zuerst mindestens 10 Ranglistenfragen.',
    );
  }
  if (state.dailyRewardClaimed) {
    throw new EconomyDomainError(
      'already-exists',
      'Die heutige Quest-Belohnung wurde bereits abgeholt.',
    );
  }

  state.dailyRewardClaimed = true;
  state.totalPoints += 100;
  state.coins += 50;
  awardAchievements(state);
  return state;
};

export const rewardFromRoll = (roll: number): SpinReward => {
  if (!Number.isInteger(roll) || roll < 0 || roll > 99) {
    throw new EconomyDomainError('invalid-argument', 'Der Glücksradwert ist ungültig.');
  }
  if (roll < 35) return { type: 'coins', amount: 25 };
  if (roll < 60) return { type: 'coins', amount: 50 };
  if (roll < 75) return { type: 'fiftyFifty', amount: 1 };
  if (roll < 87) return { type: 'timeFreeze', amount: 1 };
  if (roll < 95) return { type: 'secondChance', amount: 1 };
  return { type: 'coins', amount: 100 };
};

export const applySpinReward = (
  originalState: EconomyState,
  today: string,
  reward: SpinReward,
): EconomyState => {
  const state = structuredClone(originalState);
  if (state.lastSpinDate === today) {
    throw new EconomyDomainError(
      'already-exists',
      'Das tägliche Glücksrad wurde heute bereits genutzt.',
    );
  }
  if (reward.type === 'coins') state.coins += reward.amount;
  else state.powerUps[reward.type] += reward.amount;
  state.lastSpinDate = today;
  return state;
};

export const purchaseShopItem = (
  originalState: EconomyState,
  itemId: string,
): { state: EconomyState; itemId: ShopItemId; cost: number } => {
  if (!(itemId in SHOP_CATALOG)) {
    throw new EconomyDomainError('not-found', 'Dieser Shop-Artikel existiert nicht.');
  }
  const typedItemId = itemId as ShopItemId;
  const item = SHOP_CATALOG[typedItemId];
  const state = structuredClone(originalState);

  if (state.coins < item.cost) {
    throw new EconomyDomainError('failed-precondition', 'Du hast nicht genügend Münzen.');
  }
  if (item.kind === 'avatar' && state.unlockedAvatars.includes(typedItemId)) {
    throw new EconomyDomainError('already-exists', 'Dieser Avatar ist bereits freigeschaltet.');
  }
  if (item.kind === 'title' && state.unlockedTitles.includes(typedItemId)) {
    throw new EconomyDomainError('already-exists', 'Dieser Titel ist bereits freigeschaltet.');
  }

  state.coins -= item.cost;
  if (item.kind === 'powerUp') {
    state.powerUps[item.powerUp] += 1;
  } else if (item.kind === 'avatar') {
    state.unlockedAvatars.push(typedItemId);
    state.customPhotoURL = item.url;
  } else {
    state.unlockedTitles.push(typedItemId);
    state.equippedTitle = typedItemId;
  }

  return { state, itemId: typedItemId, cost: item.cost };
};

export const consumePowerUpItem = (
  originalState: EconomyState,
  powerUp: string,
): { state: EconomyState; powerUp: PowerUpId } => {
  if (powerUp !== 'fiftyFifty' && powerUp !== 'timeFreeze' && powerUp !== 'secondChance') {
    throw new EconomyDomainError('invalid-argument', 'Dieses Power-up existiert nicht.');
  }
  const state = structuredClone(originalState);
  if (state.powerUps[powerUp] < 1) {
    throw new EconomyDomainError('failed-precondition', 'Dieses Power-up ist nicht verfügbar.');
  }
  state.powerUps[powerUp] -= 1;
  return { state, powerUp };
};
