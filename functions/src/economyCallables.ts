import { randomInt } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { db, enforceAppCheck } from './database.js';
import {
  applyRankedRound,
  applySpinReward,
  berlinDateKey,
  claimDailyQuest,
  consumePowerUpItem,
  EconomyDomainError,
  normalizeEconomy,
  purchaseShopItem as applyShopPurchase,
  rewardFromRoll,
  stringOrNull,
  toPublicEconomy,
  type EconomyState,
  type QuizMode,
} from './economyCore.js';
import { QUESTION_BANK } from './generated/questionBank.js';
import {
  readSessionAnswerKey,
  type SessionAnswerKeyEntry,
} from './sessionAnswerKey.js';

const maxQuestionsPerSession = 30;

interface BankQuestion {
  id: string;
  correctAnswer: number;
  optionCount: number;
  explanation: string;
}

interface SubmitQuizRequest {
  sessionId?: unknown;
  answers?: unknown;
}

interface PurchaseRequest {
  itemId?: unknown;
}

interface ConsumePowerUpRequest {
  powerUp?: unknown;
}

const questionById = new Map<string, BankQuestion>(
  QUESTION_BANK.map((question) => [
    question.id,
    {
      id: question.id,
      correctAnswer: question.correctAnswer,
      optionCount: question.optionCount,
      explanation: question.explanation,
    },
  ]),
);

function requireUser(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      'unauthenticated',
      'Bitte melde dich an, um Online-Fortschritt zu speichern.',
    );
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

function parseQuizMode(value: unknown): QuizMode {
  if (value === 'daily' || value === 'blitz') return value;
  return 'standard';
}

function parseAnswers(value: unknown): Map<string, number> {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxQuestionsPerSession) {
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
    if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < -1 || answer > 9) {
      throw new HttpsError('invalid-argument', 'Ein Antwortindex ist ungültig.');
    }
    answers.set(questionId, answer);
  }
  return answers;
}

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) return error;
  if (error instanceof EconomyDomainError) {
    return new HttpsError(error.code, error.message);
  }
  logger.error('Unexpected economy error', error);
  return new HttpsError('internal', 'Die Aktion konnte nicht sicher verarbeitet werden.');
}

function fallbackAnswerKey(questionIds: readonly string[]): SessionAnswerKeyEntry[] {
  return questionIds.map((questionId) => {
    const question = questionById.get(questionId);
    if (!question) {
      throw new HttpsError(
        'failed-precondition',
        'Der Fragenkatalog wurde aktualisiert. Bitte starte eine neue Runde.',
      );
    }
    return {
      questionId,
      correctAnswer: question.correctAnswer,
      optionCount: question.optionCount,
      explanation: question.explanation,
    };
  });
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

export const submitRankedQuiz = onCall<SubmitQuizRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      const sessionId = requireString(request.data.sessionId, 'sessionId', 100);
      const answers = parseAnswers(request.data.answers);
      const sessionRef = db.collection('quizSessions').doc(sessionId);
      const userRef = db.collection('users').doc(uid);
      const leaderboardRef = db.collection('leaderboard').doc(uid);
      const today = berlinDateKey();

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
          throw new HttpsError(
            'permission-denied',
            'Diese Quizrunde gehört zu einem anderen Konto.',
          );
        }

        if (session.status === 'submitted') {
          const previousResult = session.result;
          if (!previousResult || typeof previousResult !== 'object') {
            throw new HttpsError(
              'failed-precondition',
              'Diese Runde wurde bereits verarbeitet, enthält aber kein gültiges Ergebnis.',
            );
          }
          return previousResult;
        }

        const expiresAt = session.expiresAt;
        if (!(expiresAt instanceof Timestamp) || expiresAt.toMillis() < Date.now()) {
          throw new HttpsError('deadline-exceeded', 'Diese Quizrunde ist abgelaufen.');
        }

        const questionIds = Array.isArray(session.questionIds)
          ? session.questionIds.filter((entry): entry is string => typeof entry === 'string')
          : [];
        if (questionIds.length < 1 || questionIds.length > maxQuestionsPerSession) {
          throw new HttpsError('failed-precondition', 'Die Quizrunde enthält ungültige Fragen.');
        }
        if (new Set(questionIds).size !== questionIds.length) {
          throw new HttpsError('failed-precondition', 'Die Quizrunde enthält doppelte Fragen.');
        }
        if (answers.size !== questionIds.length) {
          throw new HttpsError(
            'invalid-argument',
            'Für jede Frage muss genau ein Antwortwert übertragen werden.',
          );
        }

        const allowedIds = new Set(questionIds);
        for (const questionId of answers.keys()) {
          if (!allowedIds.has(questionId)) {
            throw new HttpsError(
              'invalid-argument',
              'Die Antwort gehört nicht zu dieser Quizrunde.',
            );
          }
        }

        const answerKey = readSessionAnswerKey(session.answerKey, questionIds)
          || fallbackAnswerKey(questionIds);
        let correct = 0;
        for (const key of answerKey) {
          const answer = answers.get(key.questionId);
          if (answer !== -1 && (answer === undefined || answer >= key.optionCount)) {
            throw new HttpsError('invalid-argument', 'Ein Antwortindex passt nicht zur Frage.');
          }
          if (answer === key.correctAnswer) correct += 1;
        }

        const total = questionIds.length;
        const mode = parseQuizMode(session.mode);
        const category = typeof session.category === 'string' ? session.category : 'all';
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const state = normalizeEconomy(userData, today);
        const outcome = applyRankedRound(state, {
          correct,
          total,
          mode,
          category,
          today,
        });
        const publicState = toPublicEconomy(outcome.state);
        const submissionResult = {
          sessionId,
          correct,
          total,
          pointsEarned: outcome.pointsEarned,
          coinsEarned: outcome.coinsEarned,
          achievementsUnlocked: outcome.achievementsUnlocked,
          stats: publicState,
        };

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(
          leaderboardRef,
          leaderboardProfile(uid, userData, outcome.state, request.auth?.token),
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
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const claimDailyQuestReward = onCall(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      const userRef = db.collection('users').doc(uid);
      const leaderboardRef = db.collection('leaderboard').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const previousAchievements = currentState.achievements.length;
        const nextState = claimDailyQuest(currentState, today);
        const achievementsUnlocked = nextState.achievements.length - previousAchievements;
        const publicState = toPublicEconomy(nextState);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(
          leaderboardRef,
          leaderboardProfile(uid, userData, nextState, request.auth?.token),
          { merge: true },
        );

        return {
          pointsEarned: 100,
          coinsEarned: 50 + achievementsUnlocked * 50,
          achievementsUnlocked,
          stats: publicState,
        };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const spinDailyWheel = onCall(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const reward = rewardFromRoll(randomInt(100));
        const nextState = applySpinReward(currentState, today, reward);
        const publicState = toPublicEconomy(nextState);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { reward, stats: publicState };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const purchaseShopItem = onCall<PurchaseRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      const itemId = requireString(request.data.itemId, 'itemId', 100);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const purchase = applyShopPurchase(currentState, itemId);
        const publicState = toPublicEconomy(purchase.state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return {
          itemId: purchase.itemId,
          cost: purchase.cost,
          stats: publicState,
        };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const consumePowerUp = onCall<ConsumePowerUpRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      const powerUp = requireString(request.data.powerUp, 'powerUp', 50);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const consumed = consumePowerUpItem(currentState, powerUp);
        const publicState = toPublicEconomy(consumed.state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { powerUp: consumed.powerUp, stats: publicState };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);
