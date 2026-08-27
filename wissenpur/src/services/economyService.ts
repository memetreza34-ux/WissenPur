import { httpsCallable } from 'firebase/functions';
import { auth } from '../firebase';
import { Difficulty, UserStats } from '../types';
import { assertFunctionsClientReady, functions } from './functionsClient';
import { getPublicErrorMessage } from './publicErrorMessage';

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

class CallableAuthSessionChangedError extends Error {
  constructor() {
    super('Die Kontositzung hat sich während der Online-Aktion geändert. Bitte starte die Aktion erneut.');
    this.name = 'CallableAuthSessionChangedError';
  }
}

const runForCurrentAuthenticatedSession = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  assertFunctionsClientReady();
  const expectedUser = auth.currentUser;
  if (!expectedUser) throw new Error('Bitte melde dich zuerst an.');
  const expectedUid = expectedUser.uid;

  const result = await operation();

  if (auth.currentUser !== expectedUser || auth.currentUser?.uid !== expectedUid) {
    throw new CallableAuthSessionChangedError();
  }

  return result;
};

const getMyEconomyStateCallable = httpsCallable<Record<string, never>, EconomyResponse>(
  functions,
  'getMyEconomyState',
);

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

const equipShopAvatarCallable = httpsCallable<
  { avatarId: string },
  EconomyResponse & { avatarId: string }
>(functions, 'equipShopAvatar');

const consumePowerUpCallable = httpsCallable<
  { powerUp: PowerUpId },
  EconomyResponse & { powerUp: PowerUpId }
>(functions, 'consumePowerUp');

export const getServerEconomyState = async (): Promise<EconomyResponse> => {
  const result = await runForCurrentAuthenticatedSession(() => getMyEconomyStateCallable({}));
  return result.data;
};

export const startSecureRankedQuizSession = async (
  mode: RankedQuizMode,
  category: string,
  difficulty: RankedDifficulty,
  count: number,
): Promise<StartSecureRankedQuizResponse> => {
  const result = await runForCurrentAuthenticatedSession(() =>
    startSecureRankedQuizCallable({ mode, category, difficulty, count }),
  );
  return result.data;
};

export const submitRankedQuizSession = async (
  sessionId: string,
  answers: RankedAnswer[],
): Promise<SubmitRankedQuizResponse> => {
  const result = await runForCurrentAuthenticatedSession(() =>
    submitRankedQuizCallable({ sessionId, answers }),
  );
  return result.data;
};

export const revealSecureRankedQuizSession = async (
  sessionId: string,
): Promise<RevealedRankedAnswer[]> => {
  const result = await runForCurrentAuthenticatedSession(() =>
    revealSecureRankedQuizCallable({ sessionId }),
  );
  return result.data.answers;
};

export const claimServerDailyReward = async (): Promise<EconomyResponse> => {
  const result = await runForCurrentAuthenticatedSession(() => claimDailyQuestRewardCallable({}));
  return result.data;
};

export const spinServerDailyWheel = async (): Promise<SpinResponse> => {
  const result = await runForCurrentAuthenticatedSession(() => spinDailyWheelCallable({}));
  return result.data;
};

export const purchaseServerShopItem = async (
  itemId: string,
): Promise<EconomyResponse & { itemId: string; cost: number }> => {
  const result = await runForCurrentAuthenticatedSession(() => purchaseShopItemCallable({ itemId }));
  return result.data;
};

export const equipServerShopAvatar = async (
  avatarId: string,
): Promise<EconomyResponse & { avatarId: string }> => {
  const result = await runForCurrentAuthenticatedSession(() => equipShopAvatarCallable({ avatarId }));
  return result.data;
};

export const consumeServerPowerUp = async (
  powerUp: PowerUpId,
): Promise<EconomyResponse & { powerUp: PowerUpId }> => {
  const result = await runForCurrentAuthenticatedSession(() => consumePowerUpCallable({ powerUp }));
  return result.data;
};

export const getCallableErrorMessage = (error: unknown): string =>
  getPublicErrorMessage(error, 'Die Online-Funktion ist momentan nicht verfügbar.');
