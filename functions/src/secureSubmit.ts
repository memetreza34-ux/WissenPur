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
  berlinDateKey,
  EconomyDomainError,
  normalizeEconomy,
  stringOrNull,
  toPublicEconomy,
  type EconomyState,
  type QuizMode,
} from './economyCore.js';
import { readSessionAnswerKey } from './sessionAnswerKey.js';

const maxQuestionsPerSession = 30;

interface SubmitQuizRequest {
  sessionId?: unknown;
  answers?: unknown;
}

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
    if (
      typeof answer !== 'number' ||
      !Number.isInteger(answer) ||
      answer < -1 ||
      answer > 9
    ) {
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
  logger.error('Unexpected secure quiz submission error', error);
  return new HttpsError('internal', 'Die Abgabe konnte nicht sicher verarbeitet werden.');
}

function safeHttpsImage(value: unknown): string {
  const candidate = stringOrNull(value, 1_000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
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
  const providerPhoto = safeHttpsImage(authToken?.picture);
  const photoURL = safeHttpsImage(state.customPhotoURL) || providerPhoto;

  return {
    uid,
    displayName,
    photoURL,
    totalPoints: state.totalPoints,
    economyVersion: state.economyVersion,
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
      const leaderboardRef = db.collection('trustedLeaderboard').doc(uid);
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
          if (!previousResult || typeof previousResult !== 'object' || Array.isArray(previousResult)) {
            throw new HttpsError(
              'failed-precondition',
              'Diese Runde wurde bereits verarbeitet, enthält aber kein gültiges Ergebnis.',
            );
          }
          return previousResult;
        }

        if (session.status !== 'active') {
          throw new HttpsError(
            'failed-precondition',
            'Diese Quizrunde befindet sich nicht in einem abgabefähigen Zustand.',
          );
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

        const answerKey = readSessionAnswerKey(session.answerKey, questionIds);
        if (!answerKey) {
          throw new HttpsError(
            'failed-precondition',
            'Der unveränderliche Sicherheitssnapshot dieser Runde fehlt oder ist beschädigt. Bitte starte eine neue Runde.',
          );
        }

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

      logger.info('Secure ranked quiz submitted', { uid, sessionId });
      return result;
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);
