export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: Difficulty;
  imageUrl?: string;
}

export interface CategoryStats {
  roundsPlayed: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface CustomQuiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}

export interface UserStats {
  uid?: string;
  displayName?: string;
  customName?: string;
  age?: number;
  photoURL?: string;
  customPhotoURL?: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  roundsPlayed: number;
  correctAnswers: number;
  totalQuestionsAnswered: number;
  dailyQuestionsAnswered?: number;
  lastDailyQuestionsDate?: string | null;
  dailyRewardClaimed?: boolean;
  lastPlayedDate: string | null;
  lastDailyRewardDate?: string | null;
  lastCategory?: CategoryId | 'all' | 'daily' | 'review' | 'blitz' | 'custom' | 'project';
  achievements?: string[];
  coins: number;
  wrongQuestions?: Question[];
  weeklyGoal?: WeeklyGoal;
  categoryStats?: Record<string, CategoryStats>;
  customDifficultyTimes?: Record<string, number>;
  darkMode?: boolean;
  customQuizzes?: CustomQuiz[];
  powerUps?: {
    fiftyFifty: number;
    timeFreeze: number;
    secondChance: number;
  };
  unlockedAvatars?: string[];
  unlockedTitles?: string[];
  equippedTitle?: string;
}

export interface WeeklyGoal {
  type: 'rounds' | 'correctAnswers' | 'dailyChallenges';
  target: number;
  current: number;
  lastResetDate: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalPoints: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'points' | 'streak' | 'correct' | 'rounds' | 'categories';
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'newbie', title: 'Neuling', description: 'Erreiche 100 Punkte', icon: '🧠', threshold: 100, type: 'points' },
  { id: 'scholar', title: 'Gelehrter', description: 'Erreiche 1.000 Punkte', icon: '📚', threshold: 1000, type: 'points' },
  { id: 'master', title: 'Meister', description: 'Erreiche 5.000 Punkte', icon: '🎓', threshold: 5000, type: 'points' },
  { id: 'legend', title: 'Legende', description: 'Erreiche 10.000 Punkte', icon: '👑', threshold: 10000, type: 'points' },
  { id: 'streak_3', title: 'Dranbleiber', description: '3 Tage Streak', icon: '🔥', threshold: 3, type: 'streak' },
  { id: 'streak_7', title: 'Wochen-Held', description: '7 Tage Streak', icon: '⚡', threshold: 7, type: 'streak' },
  { id: 'streak_30', title: 'Unaufhaltsam', description: '30 Tage Streak', icon: '💎', threshold: 30, type: 'streak' },
  { id: 'perfect_10', title: 'Perfekt', description: '10 Fragen in einer Runde richtig', icon: '🎯', threshold: 10, type: 'correct' },
  { id: 'correct_100', title: 'Wissensprofi', description: '100 richtige Antworten insgesamt', icon: '✅', threshold: 100, type: 'correct' },
  { id: 'correct_500', title: 'Lexikon', description: '500 richtige Antworten insgesamt', icon: '📖', threshold: 500, type: 'correct' },
  { id: 'all_categories', title: 'Allrounder', description: 'Spiele in allen Kategorien', icon: '🌈', threshold: 10, type: 'categories' },
  { id: 'rounds_50', title: 'Dauerbrenner', description: '50 Quiz-Runden gespielt', icon: '🔄', threshold: 50, type: 'rounds' }
];

export interface Level {
  level: number;
  name: string;
  minPoints: number;
  color: string;
  icon: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Anfänger', minPoints: 0, color: 'text-slate-400', icon: '🌱' },
  { level: 2, name: 'Neugierig', minPoints: 250, color: 'text-blue-500', icon: '🔍' },
  { level: 3, name: 'Wissenssammler', minPoints: 1000, color: 'text-purple-500', icon: '📚' },
  { level: 4, name: 'Denkprofi', minPoints: 2500, color: 'text-amber-500', icon: '🧠' },
  { level: 5, name: 'Wissensmeister', minPoints: 5000, color: 'text-rose-500', icon: '🎓' },
  { level: 6, name: 'Universalgenie', minPoints: 10000, color: 'text-emerald-500', icon: '👑' },
];

export const getLevelInfo = (points: number) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].minPoints) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
    } else {
      break;
    }
  }

  if (!nextLevel) {
    return {
      ...currentLevel,
      progress: 100,
      pointsToNext: 0,
      nextLevelName: 'Max Level'
    };
  }

  const range = nextLevel.minPoints - currentLevel.minPoints;
  const progress = ((points - currentLevel.minPoints) / range) * 100;

  return {
    ...currentLevel,
    progress: Math.min(100, Math.max(0, progress)),
    pointsToNext: nextLevel.minPoints - points,
    nextLevelName: nextLevel.name
  };
};

export type CategoryId = 'allgemein' | 'geschichte' | 'geografie' | 'wissenschaft' | 'technik' | 'sprache' | 'deutschland' | 'tiere' | 'weltall' | 'sport' | 'kunst' | 'musik' | 'filme' | 'literatur' | 'medizin' | 'natur' | 'wirtschaft' | 'politik' | 'mythologie' | 'videospiele' | 'flaggen';

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// --- Multiplayer / Online Duel Types ---

export type PlayerStatus = 'online' | 'ready' | 'playing' | 'finished';

export interface MultiplayerPlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
  status: PlayerStatus;
  score: number;
  currentAnswer?: number | null; // index of the selected option, null if not answered
  answerTime?: number; // time taken to answer
}

export type GameState = 'waiting' | 'starting' | 'playing' | 'round_end' | 'finished';

export type League = 'Bronze' | 'Silber' | 'Gold' | 'Platin' | 'Diamant' | 'Elite' | 'Meister';

export interface RankInfo {
  rating: number;
  league: League;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

export interface MatchResult {
  matchId: string;
  date: number;
  mode: '1v1' | '3p' | '4p';
  placement: number;
  ratingChange: number;
  newRating: number;
}

export interface OnlineProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  rankInfo: RankInfo;
  matchHistory: MatchResult[];
}

export interface MatchmakingQueue {
  userId: string;
  mode: '1v1' | '3p' | '4p';
  rating: number;
  joinedAt: number;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  categoryId: CategoryId | 'all';
  numberOfQuestions: number;
  timePerQuestion: number;
  players: Record<string, MultiplayerPlayer>; // Keyed by uid
  state: GameState;
  currentRound: number;
  totalRounds: number;
  currentQuestionId?: string | null;
  roundWinnerId?: string | null;
  overallWinnerId?: string | null;
  createdAt: number;
}
