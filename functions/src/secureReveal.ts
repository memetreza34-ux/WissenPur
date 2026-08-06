import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { db, enforceAppCheck } from './database.js';
import { readSessionAnswerKey } from './sessionAnswerKey.js';

interface RevealRequest {
  sessionId?: unknown;
}

function requireText(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', 'Die Sitzungs-ID ist ungültig.');
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 100) {
    throw new HttpsError('invalid-argument', 'Die Sitzungs-ID ist ungültig.');
  }
  return trimmed;
}

export const revealSecureRankedQuiz = onCall<RevealRequest>(
  { enforceAppCheck },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Bitte melde dich an.');
    }

    const sessionId = requireText(request.data.sessionId);
    const snapshot = await db.collection('quizSessions').doc(sessionId).get();
    if (!snapshot.exists) {
      throw new HttpsError('not-found', 'Diese Quizrunde wurde nicht gefunden.');
    }

    const session = snapshot.data() as Record<string, unknown>;
    if (session.uid !== uid) {
      throw new HttpsError('permission-denied', 'Diese Quizrunde gehört zu einem anderen Konto.');
    }
    if (session.status !== 'submitted') {
      throw new HttpsError('failed-precondition', 'Lösungen werden erst nach der Abgabe freigegeben.');
    }

    const questionIds = Array.isArray(session.questionIds)
      ? session.questionIds.filter((value): value is string => typeof value === 'string')
      : [];
    if (
      questionIds.length < 1 ||
      questionIds.length > 30 ||
      new Set(questionIds).size !== questionIds.length
    ) {
      throw new HttpsError('failed-precondition', 'Die Quizrunde enthält ungültige Fragen.');
    }

    const answerKey = readSessionAnswerKey(session.answerKey, questionIds);
    if (!answerKey) {
      throw new HttpsError(
        'failed-precondition',
        'Der unveränderliche Sicherheitssnapshot dieser Runde fehlt oder ist beschädigt. Eine Detailauswertung ist nicht möglich.',
      );
    }

    return {
      sessionId,
      answers: answerKey.map((entry) => ({
        questionId: entry.questionId,
        correctAnswer: entry.correctAnswer,
        explanation: entry.explanation,
      })),
    };
  },
);
