import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { QUESTION_BANK } from './generated/questionBank.js';

const firebaseApp = getApps()[0] ?? initializeApp();
const databaseId = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b';
const db = getFirestore(firebaseApp, databaseId);
const enforceAppCheck = process.env.ENFORCE_APP_CHECK !== 'false';
const questionById = new Map(QUESTION_BANK.map((question) => [question.id, question]));

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

    return {
      sessionId,
      answers: questionIds.map((questionId) => {
        const question = questionById.get(questionId);
        if (!question) {
          throw new HttpsError('failed-precondition', 'Der Fragenkatalog wurde aktualisiert.');
        }
        return {
          questionId,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        };
      }),
    };
  },
);
