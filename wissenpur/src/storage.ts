import { UserStats, Question, WeeklyGoal, CategoryId, ACHIEVEMENTS } from './types';
import { auth } from './firebase';
import {
  claimServerDailyReward,
  consumeServerPowerUp,
  purchaseServerShopItem,
  type PowerUpId,
} from './services/economyService';

const STORAGE_KEY = 'wissenpur_user_stats';
const STORAGE_OWNER_KEY = 'wissenpur_user_stats_owner';
const LEARNING_PLAN_STORAGE_KEY = 'wissenpur_learning_plan';

const berlinDateKey = (date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getStartOfWeek = (): string => {
  const todayKey = berlinDateKey();
  const today = new Date(`${todayKey}T12:00:00`);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + diff);
  return berlinDateKey(today);
};

const GOAL_TYPES: { type: WeeklyGoal['type']; target: number }[] = [
  { type: 'rounds', target: 5 },
  { type: 'correctAnswers', target: 30 },
  { type: 'dailyChallenges', target: 3 },
  { type: 'rounds', target: 10 },
  { type: 'correctAnswers', target: 50 },
  { type: 'rounds', target: 3 },
  { type: 'correctAnswers', target: 20 },
];

const getRandomGoal = (): WeeklyGoal => {
  const random = GOAL_TYPES[Math.floor(Math.random() * GOAL_TYPES.length)];
  return {
    ...random,
    current: 0,
    lastResetDate: getStartOfWeek(),
  };
};

const createInitialStats = (): UserStats => ({
  totalPoints: 0,
  coins: 0,
  currentStreak: 0,
  bestStreak: 0,
  roundsPlayed: 0,
  correctAnswers: 0,
  totalQuestionsAnswered: 0,
  dailyQuestionsAnswered: 0,
  lastDailyQuestionsDate: null,
  dailyRewardClaimed: false,
  lastPlayedDate: null,
  wrongQuestions: [],
  weeklyGoal: getRandomGoal(),
  categoryStats: {},
  customDifficultyTimes: {
    leicht: 25,
    mittel: 15,
    schwer: 10,
    all: 15,
  },
  darkMode: false,
  customQuizzes: [],
  powerUps: {
    fiftyFifty: 3,
    timeFreeze: 3,
    secondChance: 3,
  },
  unlockedAvatars: ['default'],
  unlockedTitles: ['Neuling'],
  equippedTitle: 'Neuling',
  achievements: [],
});

const publishAccountStorageReset = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wissenpur:account-storage-reset'));
  }
};

export const clearLocalAccountData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_OWNER_KEY);
  localStorage.removeItem(LEARNING_PLAN_STORAGE_KEY);
  publishAccountStorageReset();
};

export const isLocalAccountDataReadable = (): boolean => {
  const ownerUid = localStorage.getItem(STORAGE_OWNER_KEY);
  if (!ownerUid) return true;
  return auth.currentUser?.uid === ownerUid;
};

export const prepareLocalAccountDataForWrite = (): void => {
  const ownerUid = localStorage.getItem(STORAGE_OWNER_KEY);
  const activeUid = auth.currentUser?.uid || null;

  if (ownerUid && ownerUid !== activeUid) {
    clearLocalAccountData();
  }

  if (activeUid) {
    localStorage.setItem(STORAGE_OWNER_KEY, activeUid);
  }
};

const parseStoredStats = (stored: string): UserStats => {
  const parsed = JSON.parse(stored) as Partial<UserStats>;
  const initial = createInitialStats();
  return {
    ...initial,
    ...parsed,
    wrongQuestions: parsed.wrongQuestions || [],
    weeklyGoal: parsed.weeklyGoal || initial.weeklyGoal,
    dailyQuestionsAnswered: parsed.dailyQuestionsAnswered || 0,
    lastDailyQuestionsDate: parsed.lastDailyQuestionsDate || null,
    dailyRewardClaimed: parsed.dailyRewardClaimed || false,
    customDifficultyTimes: parsed.customDifficultyTimes || initial.customDifficultyTimes,
    powerUps: parsed.powerUps || initial.powerUps,
    unlockedAvatars: parsed.unlockedAvatars || initial.unlockedAvatars,
    unlockedTitles: parsed.unlockedTitles || initial.unlockedTitles,
    equippedTitle: parsed.equippedTitle || initial.equippedTitle,
    achievements: parsed.achievements || [],
    customQuizzes: parsed.customQuizzes || [],
    categoryStats: parsed.categoryStats || {},
  };
};

export const getStats = (): UserStats => {
  if (!isLocalAccountDataReadable()) return createInitialStats();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return createInitialStats();

  try {
    const stats = parseStoredStats(stored);
    const today = berlinDateKey();
    let changed = false;

    if (stats.lastDailyQuestionsDate !== today) {
      stats.dailyQuestionsAnswered = 0;
      stats.dailyRewardClaimed = false;
      stats.lastDailyQuestionsDate = today;
      changed = true;
    }

    if (stats.lastPlayedDate) {
      const lastPlayed = new Date(`${stats.lastPlayedDate}T12:00:00`);
      const todayDate = new Date(`${today}T12:00:00`);
      const diffDays = Math.round(
        (todayDate.getTime() - lastPlayed.getTime()) / 86_400_000,
      );
      if (diffDays > 1 && stats.currentStreak !== 0) {
        stats.currentStreak = 0;
        changed = true;
      }
    }

    const currentWeekStart = getStartOfWeek();
    if (!stats.weeklyGoal || stats.weeklyGoal.lastResetDate !== currentWeekStart) {
      stats.weeklyGoal = getRandomGoal();
      changed = true;
    }

    if (changed) saveStats(stats);
    return stats;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return createInitialStats();
  }
};

export const saveStats = (stats: UserStats): void => {
  prepareLocalAccountDataForWrite();
  const activeUid = auth.currentUser?.uid;
  const scopedStats = activeUid ? { ...stats, uid: activeUid } : { ...stats, uid: undefined };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scopedStats));
};

const publishStatsUpdate = (stats: UserStats) => {
  saveStats(stats);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: stats }),
    );
  }
};

const applyServerStats = (serverStats: UserStats): UserStats => {
  const localStats = getStats();
  const merged: UserStats = {
    ...localStats,
    ...serverStats,
    customName: localStats.customName,
    age: localStats.age,
    wrongQuestions: localStats.wrongQuestions || [],
    customDifficultyTimes: localStats.customDifficultyTimes,
    darkMode: localStats.darkMode,
    customQuizzes: localStats.customQuizzes || [],
    customPhotoURL: serverStats.customPhotoURL ?? localStats.customPhotoURL,
  };
  publishStatsUpdate(merged);
  return merged;
};

const reconcileServerMutation = (
  operation: Promise<{ stats: UserStats }>,
  label: string,
) => {
  void operation
    .then(({ stats }) => applyServerStats(stats))
    .catch((error) => {
      console.warn(`${label} konnte nicht mit dem Server abgeglichen werden.`, error);
    });
};

export const saveCustomPhoto = (dataUrl: string) => {
  const stats = getStats();
  const updatedStats = { ...stats, customPhotoURL: dataUrl };
  saveStats(updatedStats);
  return updatedStats;
};

export const saveUserDetails = (name?: string, age?: number) => {
  const stats = getStats();
  const updatedStats = { ...stats };
  if (name !== undefined) updatedStats.customName = name;
  if (age !== undefined) updatedStats.age = age;
  saveStats(updatedStats);
  return updatedStats;
};

export const saveWrongQuestion = (question: Question) => {
  const stats = getStats();
  const alreadyExists = stats.wrongQuestions?.some((entry) => entry.id === question.id);
  if (alreadyExists) return stats;

  const updatedStats = {
    ...stats,
    wrongQuestions: [...(stats.wrongQuestions || []), question].slice(-300),
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const removeWrongQuestion = (questionId: string) => {
  const stats = getStats();
  const updatedStats = {
    ...stats,
    wrongQuestions: (stats.wrongQuestions || []).filter((entry) => entry.id !== questionId),
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const claimDailyReward = () => {
  const stats = getStats();
  if (auth.currentUser) {
    reconcileServerMutation(claimServerDailyReward(), 'Daily-Quest-Belohnung');
    return stats;
  }

  if (!stats.dailyRewardClaimed && (stats.dailyQuestionsAnswered || 0) >= 10) {
    const updatedStats = {
      ...stats,
      dailyRewardClaimed: true,
      coins: (stats.coins || 0) + 50,
      totalPoints: stats.totalPoints + 100,
    };
    saveStats(updatedStats);
    return updatedStats;
  }
  return stats;
};

export const buyPowerUp = (type: PowerUpId, cost: number) => {
  const stats = getStats();
  if (auth.currentUser) {
    reconcileServerMutation(purchaseServerShopItem(type), 'Power-up-Kauf');
    return stats;
  }

  if ((stats.coins || 0) < cost) return stats;
  const updatedStats = {
    ...stats,
    coins: (stats.coins || 0) - cost,
    powerUps: {
      ...stats.powerUps!,
      [type]: (stats.powerUps?.[type] || 0) + 1,
    },
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const usePowerUp = (type: PowerUpId) => {
  const stats = getStats();
  if (auth.currentUser) {
    reconcileServerMutation(consumeServerPowerUp(type), 'Power-up-Nutzung');
    return stats;
  }

  if ((stats.powerUps?.[type] || 0) <= 0) return stats;
  const updatedStats = {
    ...stats,
    powerUps: {
      ...stats.powerUps!,
      [type]: stats.powerUps![type] - 1,
    },
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const buyAvatar = (avatarId: string, cost: number, avatarUrl: string) => {
  const stats = getStats();
  if (auth.currentUser) {
    reconcileServerMutation(purchaseServerShopItem(avatarId), 'Avatar-Kauf');
    return stats;
  }

  if ((stats.coins || 0) < cost || stats.unlockedAvatars?.includes(avatarId)) return stats;
  const updatedStats = {
    ...stats,
    coins: (stats.coins || 0) - cost,
    unlockedAvatars: [...(stats.unlockedAvatars || []), avatarId],
    customPhotoURL: avatarUrl,
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const buyTitle = (titleId: string, cost: number) => {
  const stats = getStats();
  if (auth.currentUser) {
    reconcileServerMutation(purchaseServerShopItem(titleId), 'Titel-Kauf');
    return stats;
  }

  if ((stats.coins || 0) < cost || stats.unlockedTitles?.includes(titleId)) return stats;
  const updatedStats = {
    ...stats,
    coins: (stats.coins || 0) - cost,
    unlockedTitles: [...(stats.unlockedTitles || []), titleId],
    equippedTitle: titleId,
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const equipAvatar = (avatarId: string, avatarUrl: string) => {
  const stats = getStats();
  if (!stats.unlockedAvatars?.includes(avatarId)) return stats;
  const updatedStats = { ...stats, customPhotoURL: avatarUrl };
  saveStats(updatedStats);
  return updatedStats;
};

export const equipTitle = (titleId: string) => {
  const stats = getStats();
  if (!stats.unlockedTitles?.includes(titleId)) return stats;
  const updatedStats = { ...stats, equippedTitle: titleId };
  saveStats(updatedStats);
  return updatedStats;
};

export const updateStatsAfterRound = (
  points: number,
  correct: number,
  total: number,
  category: CategoryId | 'all' | 'daily' | 'blitz' | 'review' | 'custom' | 'project',
  isDailyReward = false,
) => {
  const stats = getStats();

  // Authenticated economy values are written only by verified Cloud Functions.
  // Local practice rounds must not create points, coins, streaks or leaderboard progress.
  if (auth.currentUser && stats.economyVersion === 1) return stats;

  const today = berlinDateKey();
  let newStreak = stats.currentStreak;
  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date(`${today}T12:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    newStreak = stats.lastPlayedDate === berlinDateKey(yesterday)
      ? newStreak + 1
      : 1;
  }

  const safeCorrect = Math.max(0, Math.min(Math.trunc(correct), Math.trunc(total)));
  const safeTotal = Math.max(0, Math.min(30, Math.trunc(total)));
  const roundPoints = Math.max(0, Math.trunc(points));
  const categoryEligible = ![
    'all',
    'daily',
    'blitz',
    'review',
    'custom',
    'project',
  ].includes(category);

  const updatedStats: UserStats = {
    ...stats,
    totalPoints: stats.totalPoints + roundPoints + (isDailyReward ? 50 : 0),
    coins: (stats.coins || 0) + safeCorrect + 5 + (isDailyReward ? 15 : 0),
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    roundsPlayed: stats.roundsPlayed + 1,
    correctAnswers: stats.correctAnswers + safeCorrect,
    totalQuestionsAnswered: stats.totalQuestionsAnswered + safeTotal,
    dailyQuestionsAnswered:
      (stats.lastDailyQuestionsDate === today ? stats.dailyQuestionsAnswered || 0 : 0) + safeTotal,
    dailyRewardClaimed:
      stats.lastDailyQuestionsDate === today ? stats.dailyRewardClaimed : false,
    lastDailyQuestionsDate: today,
    lastPlayedDate: today,
    lastDailyRewardDate: isDailyReward ? today : stats.lastDailyRewardDate,
    lastCategory: category,
    categoryStats: {
      ...(stats.categoryStats || {}),
      ...(categoryEligible
        ? {
            [category]: {
              roundsPlayed: (stats.categoryStats?.[category]?.roundsPlayed || 0) + 1,
              totalScore: (stats.categoryStats?.[category]?.totalScore || 0) + roundPoints,
              correctAnswers: (stats.categoryStats?.[category]?.correctAnswers || 0) + safeCorrect,
              totalQuestions: (stats.categoryStats?.[category]?.totalQuestions || 0) + safeTotal,
            },
          }
        : {}),
    },
    weeklyGoal: {
      ...stats.weeklyGoal!,
      current:
        stats.weeklyGoal!.type === 'rounds'
          ? stats.weeklyGoal!.current + 1
          : stats.weeklyGoal!.type === 'correctAnswers'
            ? stats.weeklyGoal!.current + safeCorrect
            : stats.weeklyGoal!.type === 'dailyChallenges' && isDailyReward
              ? stats.weeklyGoal!.current + 1
              : stats.weeklyGoal!.current,
    },
  };

  const newAchievements = new Set(updatedStats.achievements || []);
  for (const achievement of ACHIEVEMENTS) {
    if (newAchievements.has(achievement.id)) continue;

    let earned = false;
    switch (achievement.type) {
      case 'points':
        earned = updatedStats.totalPoints >= achievement.threshold;
        break;
      case 'streak':
        earned = updatedStats.currentStreak >= achievement.threshold;
        break;
      case 'correct':
        earned = achievement.id === 'perfect_10'
          ? safeCorrect >= achievement.threshold
          : updatedStats.correctAnswers >= achievement.threshold;
        break;
      case 'rounds':
        earned = updatedStats.roundsPlayed >= achievement.threshold;
        break;
      case 'categories':
        earned = Object.keys(updatedStats.categoryStats || {}).length >= achievement.threshold;
        break;
    }

    if (earned) {
      newAchievements.add(achievement.id);
      updatedStats.coins += 50;
    }
  }

  updatedStats.achievements = [...newAchievements];
  saveStats(updatedStats);
  return updatedStats;
};
