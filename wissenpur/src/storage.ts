import { UserStats, Question, WeeklyGoal, CategoryId, ACHIEVEMENTS } from './types';
import { auth } from './firebase';
import {
  claimServerDailyReward,
  consumeServerPowerUp,
  purchaseServerShopItem,
  recordServerRoundResult,
  type PowerUpId,
} from './services/economyService';

const STORAGE_KEY = 'wissenpur_user_stats';

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
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
    lastResetDate: getStartOfWeek()
  };
};

const INITIAL_WEEKLY_GOAL: WeeklyGoal = getRandomGoal();

const INITIAL_STATS: UserStats = {
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
  weeklyGoal: INITIAL_WEEKLY_GOAL,
  categoryStats: {},
  customDifficultyTimes: {
    leicht: 25,
    mittel: 15,
    schwer: 10,
    all: 15
  },
  darkMode: false,
  customQuizzes: [],
  powerUps: {
    fiftyFifty: 3,
    timeFreeze: 3,
    secondChance: 3
  },
  unlockedAvatars: ['default'],
  unlockedTitles: ['Neuling'],
  equippedTitle: 'Neuling',
  achievements: []
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const currentWeekStart = getStartOfWeek();

  if (!stored) return INITIAL_STATS;
  try {
    const parsed = JSON.parse(stored);
    const stats: UserStats = {
      ...INITIAL_STATS,
      ...parsed,
      wrongQuestions: parsed.wrongQuestions || [],
      weeklyGoal: parsed.weeklyGoal || INITIAL_WEEKLY_GOAL,
      dailyQuestionsAnswered: parsed.dailyQuestionsAnswered || 0,
      lastDailyQuestionsDate: parsed.lastDailyQuestionsDate || null,
      dailyRewardClaimed: parsed.dailyRewardClaimed || false,
      customDifficultyTimes: parsed.customDifficultyTimes || INITIAL_STATS.customDifficultyTimes,
      powerUps: parsed.powerUps || INITIAL_STATS.powerUps,
      unlockedAvatars: parsed.unlockedAvatars || INITIAL_STATS.unlockedAvatars,
      unlockedTitles: parsed.unlockedTitles || INITIAL_STATS.unlockedTitles,
      equippedTitle: parsed.equippedTitle || INITIAL_STATS.equippedTitle,
      achievements: parsed.achievements || []
    };

    const today = new Date().toISOString().split('T')[0];
    if (stats.lastDailyQuestionsDate !== today) {
      stats.dailyQuestionsAnswered = 0;
      stats.dailyRewardClaimed = false;
      stats.lastDailyQuestionsDate = today;
      saveStats(stats);
    }

    if (stats.lastPlayedDate) {
      const lastPlayed = new Date(stats.lastPlayedDate);
      const todayDate = new Date();
      const diffTime = Math.abs(todayDate.getTime() - lastPlayed.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1 && todayDate.toDateString() !== lastPlayed.toDateString()) {
        stats.currentStreak = 0;
        saveStats(stats);
      }
    }

    if (stats.weeklyGoal && stats.weeklyGoal.lastResetDate !== currentWeekStart) {
      stats.weeklyGoal = getRandomGoal();
      saveStats(stats);
    }

    return stats;
  } catch {
    return INITIAL_STATS;
  }
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const publishStatsUpdate = (stats: UserStats) => {
  saveStats(stats);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: stats }));
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

const createRoundId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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
  const alreadyExists = stats.wrongQuestions?.some(q => q.id === question.id);

  if (!alreadyExists) {
    const updatedStats = {
      ...stats,
      wrongQuestions: [...(stats.wrongQuestions || []), question]
    };
    saveStats(updatedStats);
    return updatedStats;
  }
  return stats;
};

export const removeWrongQuestion = (questionId: string) => {
  const stats = getStats();
  const updatedStats = {
    ...stats,
    wrongQuestions: (stats.wrongQuestions || []).filter(q => q.id !== questionId)
  };
  saveStats(updatedStats);
  return updatedStats;
};

export const claimDailyReward = () => {
  const stats = getStats();
  if (!stats.dailyRewardClaimed && (stats.dailyQuestionsAnswered || 0) >= 10) {
    const updatedStats = {
      ...stats,
      dailyRewardClaimed: true,
      coins: (stats.coins || 0) + 50,
      totalPoints: stats.totalPoints + 100
    };
    saveStats(updatedStats);

    if (auth.currentUser) {
      reconcileServerMutation(claimServerDailyReward(), 'Daily-Quest-Belohnung');
    }

    return updatedStats;
  }
  return stats;
};

export const buyPowerUp = (type: PowerUpId, cost: number) => {
  const stats = getStats();
  if ((stats.coins || 0) >= cost) {
    const updatedStats = {
      ...stats,
      coins: (stats.coins || 0) - cost,
      powerUps: {
        ...stats.powerUps!,
        [type]: (stats.powerUps![type] || 0) + 1
      }
    };
    saveStats(updatedStats);

    if (auth.currentUser) {
      reconcileServerMutation(purchaseServerShopItem(type), 'Power-up-Kauf');
    }

    return updatedStats;
  }
  return stats;
};

export const usePowerUp = (type: PowerUpId) => {
  const stats = getStats();
  if ((stats.powerUps?.[type] || 0) > 0) {
    const updatedStats = {
      ...stats,
      powerUps: {
        ...stats.powerUps!,
        [type]: stats.powerUps![type] - 1
      }
    };
    saveStats(updatedStats);

    if (auth.currentUser) {
      reconcileServerMutation(consumeServerPowerUp(type), 'Power-up-Nutzung');
    }

    return updatedStats;
  }
  return stats;
};

export const buyAvatar = (avatarId: string, cost: number, avatarUrl: string) => {
  const stats = getStats();
  if ((stats.coins || 0) >= cost && !stats.unlockedAvatars?.includes(avatarId)) {
    const updatedStats = {
      ...stats,
      coins: (stats.coins || 0) - cost,
      unlockedAvatars: [...(stats.unlockedAvatars || []), avatarId],
      customPhotoURL: avatarUrl
    };
    saveStats(updatedStats);

    if (auth.currentUser) {
      reconcileServerMutation(purchaseServerShopItem(avatarId), 'Avatar-Kauf');
    }

    return updatedStats;
  }
  return stats;
};

export const buyTitle = (titleId: string, cost: number) => {
  const stats = getStats();
  if ((stats.coins || 0) >= cost && !stats.unlockedTitles?.includes(titleId)) {
    const updatedStats = {
      ...stats,
      coins: (stats.coins || 0) - cost,
      unlockedTitles: [...(stats.unlockedTitles || []), titleId],
      equippedTitle: titleId
    };
    saveStats(updatedStats);

    if (auth.currentUser) {
      reconcileServerMutation(purchaseServerShopItem(titleId), 'Titel-Kauf');
    }

    return updatedStats;
  }
  return stats;
};

export const equipAvatar = (avatarId: string, avatarUrl: string) => {
  const stats = getStats();
  if (stats.unlockedAvatars?.includes(avatarId)) {
    const updatedStats = { ...stats, customPhotoURL: avatarUrl };
    saveStats(updatedStats);
    return updatedStats;
  }
  return stats;
};

export const equipTitle = (titleId: string) => {
  const stats = getStats();
  if (stats.unlockedTitles?.includes(titleId)) {
    const updatedStats = { ...stats, equippedTitle: titleId };
    saveStats(updatedStats);
    return updatedStats;
  }
  return stats;
};

export const updateStatsAfterRound = (
  points: number,
  correct: number,
  total: number,
  category: CategoryId | 'all' | 'daily' | 'blitz' | 'review' | 'custom' | 'project',
  isDailyReward: boolean = false
) => {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  let newStreak = stats.currentStreak;
  if (stats.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastPlayedDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  const serverEconomy = stats.economyVersion === 1;
  const trustedDisplayPoints = correct * 10;
  const roundPoints = serverEconomy ? trustedDisplayPoints : points;

  const updatedStats: UserStats = {
    ...stats,
    totalPoints: stats.totalPoints + roundPoints + (isDailyReward ? 50 : 0),
    coins: (stats.coins || 0) + correct + 5 + (isDailyReward ? 15 : 0),
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    roundsPlayed: stats.roundsPlayed + 1,
    correctAnswers: stats.correctAnswers + correct,
    totalQuestionsAnswered: stats.totalQuestionsAnswered + total,
    dailyQuestionsAnswered: (stats.lastDailyQuestionsDate === today ? (stats.dailyQuestionsAnswered || 0) : 0) + total,
    dailyRewardClaimed: stats.lastDailyQuestionsDate === today ? stats.dailyRewardClaimed : false,
    lastDailyQuestionsDate: today,
    lastPlayedDate: today,
    lastDailyRewardDate: isDailyReward ? today : stats.lastDailyRewardDate,
    lastCategory: category,
    categoryStats: {
      ...(stats.categoryStats || {}),
      ...(category !== 'all' && category !== 'daily' && category !== 'blitz' && category !== 'review' && category !== 'custom' && category !== 'project' ? {
        [category]: {
          roundsPlayed: (stats.categoryStats?.[category]?.roundsPlayed || 0) + 1,
          totalScore: (stats.categoryStats?.[category]?.totalScore || 0) + roundPoints,
          correctAnswers: (stats.categoryStats?.[category]?.correctAnswers || 0) + correct,
          totalQuestions: (stats.categoryStats?.[category]?.totalQuestions || 0) + total,
        }
      } : {})
    },
    weeklyGoal: {
      ...stats.weeklyGoal!,
      current: stats.weeklyGoal!.type === 'rounds'
        ? stats.weeklyGoal!.current + 1
        : stats.weeklyGoal!.type === 'correctAnswers'
        ? stats.weeklyGoal!.current + correct
        : stats.weeklyGoal!.type === 'dailyChallenges' && isDailyReward
        ? stats.weeklyGoal!.current + 1
        : stats.weeklyGoal!.current
    }
  };

  const newAchievements = new Set(updatedStats.achievements || []);
  ACHIEVEMENTS.forEach(achievement => {
    if (!newAchievements.has(achievement.id)) {
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
            ? correct >= achievement.threshold
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
  });

  if (newAchievements.size > (updatedStats.achievements?.length || 0)) {
    updatedStats.achievements = Array.from(newAchievements);
  }

  saveStats(updatedStats);

  if (auth.currentUser && total > 0 && total <= 30) {
    const mode = category === 'daily' ? 'daily' : category === 'blitz' ? 'blitz' : 'standard';
    reconcileServerMutation(
      recordServerRoundResult(createRoundId(), correct, total, mode, category),
      'Quizrunde'
    );
  }

  return updatedStats;
};
