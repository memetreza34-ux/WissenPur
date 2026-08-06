import { httpsCallable } from 'firebase/functions';
import { Difficulty, UserStats } from '../types';
import { functions } from './functionsClient';

export type RankedQuizMode = 'standard' | 'daily' | 'blitz';
export type RankedDifficulty = Difficulty | 'all';
export type PowerUpId = 'fiftyFifty' | 'timeFreeze' | 'secondChance';

export interface RankedAnswer {
  questionId: string;
  answer: number;
}

export interface SecureRankedQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  explanation: string;
  difficulty: Difficulty;
  imageUrl?: string;
}

export interface RevealedRankedAnswer {
  questionId: string;
  correctAnswer: number;
  explanation: string;
}

export interface ServerEconomyStats extends UserStats {
  economyVersion: number;
  lastDailyChallengeDate?: string | null;
  lastSpinDate?: string | null;
}

interface StartRankedQuizResponse {
  sessionId: string;
  expiresAt: number;
  ranked: true;
}

export interface StartSecureRankedQuizResponse extends StartRankedQuizResponse {
  questions: SecureRankedQuestion[];
}

export interface EconomyResponse {
  stats: ServerEconomyStats;
}

export interface SubmitRankedQuizResponse extends EconomyResponse {
  sessionId: string;
  correct: number;
  total: number;
  pointsEarned: number;
  coinsEarned: number;
  achievementsUnlocked: number;
}

export interface SpinResponse extends EconomyResponse {
  reward: {
    type: 'coins' | PowerUpId;
    amount: number;
  };
}

const startSecureRankedQuizCallable = httpsCallable<
  { mode: RankedQuizMode; category: string; difficulty: RankedDifficulty; count: number },
  StartSecureRankedQuizResponse
>(functions, 'startSecureRankedQuiz');

const submitRankedQuizCallable = httpsCallable<
  { sessionId: string; answers: RankedAnswer[] },
  SubmitRankedQuizResponse
>(functions, 'submitRankedQuiz');

const revealSecureRankedQuizCallable = httpsCallable<
  { sessionId: string },
  { sessionId: string; answers: RevealedRankedAnswer[] }
>(functions, 'revealSecureRankedQuiz');

const claimDailyQuestRewardCallable = httpsCallable<Record<string, never>, EconomyResponse>(
  functions,
  'claimDailyQuestReward',
);

const spinDailyWheelCallable = httpsCallable<Record<string, never>, SpinResponse>(
  functions,
  'spinDailyWheel',
);

const purchaseShopItemCallable = httpsCallable<
  { itemId: string },
  EconomyResponse & { itemId: string; cost: number }
>(functions, 'purchaseShopItem');

const consumePowerUpCallable = httpsCallable<
  { powerUp: PowerUpId },
  EconomyResponse & { powerUp: PowerUpId }
>(functions, 'consumePowerUp');

export const startSecureRankedQuizSession = async (
  mode: RankedQuizMode,
  category: string,
  difficulty: RankedDifficulty,
  count: number,
): Promise<StartSecureRankedQuizResponse> => {
  const result = await startSecureRankedQuizCallable({ mode, category, difficulty, count });
  return result.data;
};

export const submitRankedQuizSession = async (
  sessionId: string,
  answers: RankedAnswer[],
): Promise<SubmitRankedQuizResponse> => {
  const result = await submitRankedQuizCallable({ sessionId, answers });
  return result.data;
};

export const revealSecureRankedQuizSession = async (
  sessionId: string,
): Promise<RevealedRankedAnswer[]> => {
  const result = await revealSecureRankedQuizCallable({ sessionId });
  return result.data.answers;
};

export const claimServerDailyReward = async (): Promise<EconomyResponse> => {
  const result = await claimDailyQuestRewardCallable({});
  return result.data;
};

export const spinServerDailyWheel = async (): Promise<SpinResponse> => {
  const result = await spinDailyWheelCallable({});
  return result.data;
};

export const purchaseServerShopItem = async (
  itemId: string,
): Promise<EconomyResponse & { itemId: string; cost: number }> => {
  const result = await purchaseShopItemCallable({ itemId });
  return result.data;
};

export const consumeServerPowerUp = async (
  powerUp: PowerUpId,
): Promise<EconomyResponse & { powerUp: PowerUpId }> => {
  const result = await consumePowerUpCallable({ powerUp });
  return result.data;
};

export const getCallableErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return 'Die Online-Funktion ist momentan nicht verfügbar.';
};
