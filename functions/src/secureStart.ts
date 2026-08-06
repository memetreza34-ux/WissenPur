import { randomInt, randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { db, enforceAppCheck } from './database.js';
import { QUESTION_BANK } from './generated/questionBank.js';

const sessionTtlMs = 30 * 60 * 1000;
const maxQuestions = 30;

type RankedMode = 'standard' | 'daily' | 'blitz';
type RankedDifficulty = 'all' | 'leicht' | 'mittel' | 'schwer';

interface StartSecureQuizRequest {
  mode?: unknown;
  category?: unknown;
  difficulty?: unknown;
  count?: unknown;
}

function requireUser(request: { auth?: { uid?: string } }): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Bitte melde dich für eine gewertete Runde an.');
  }
  return uid;
}

function parseMode(value: unknown): RankedMode {
  if (value === 'daily' || value === 'blitz') return value;
  return 'standard';
}

function parseDifficulty(value: unknown): RankedDifficulty {
  if (value === 'leicht' || value === 'mittel' || value === 'schwer') return value;
  return 'all';
}

function parseCategory(value: unknown): string {
  if (typeof value !== 'string') return 'all';
  const category = value.trim().slice(0, 50);
  return category || 'all';
}

function parseCount(value: unknown, mode: RankedMode): number {
  if (mode === 'daily') return 10;
  const fallback = mode === 'blitz' ? 30 : 10;
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  return Math.min(maxQuestions, Math.max(1, value));
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export const startSecureRankedQuiz = onCall<StartSecureQuizRequest>(
  { enforceAppCheck },
  async (request) => {
    const uid = requireUser(request);
    const mode = parseMode(request.data.mode);
    const category = parseCategory(request.data.category);
    const difficulty = parseDifficulty(request.data.difficulty);
    const count = parseCount(request.data.count, mode);

    let candidates = QUESTION_BANK.filter((question) =>
      (category === 'all' || mode === 'daily' || mode === 'blitz' || question.category === category) &&
      (difficulty === 'all' || question.difficulty === difficulty),
    );

    if (candidates.length < count && difficulty !== 'all') {
      candidates = QUESTION_BANK.filter((question) =>
        category === 'all' || mode === 'daily' || mode === 'blitz' || question.category === category,
      );
    }

    if (candidates.length < count) {
      throw new HttpsError(
        'failed-precondition',
        `Für diese Auswahl sind nur ${candidates.length} geprüfte Fragen verfügbar.`,
      );
    }

    const selected = shuffle(candidates).slice(0, count);
    const sessionId = randomUUID();
    const now = Date.now();

    await db.collection('quizSessions').doc(sessionId).create({
      uid,
      questionIds: selected.map((question) => question.id),
      mode,
      category: mode === 'daily' ? 'daily' : mode === 'blitz' ? 'blitz' : category,
      difficulty,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + sessionTtlMs),
    });

    return {
      sessionId,
      expiresAt: now + sessionTtlMs,
      ranked: true as const,
      questions: selected.map((question) => ({
        id: question.id,
        category: question.category,
        question: question.question,
        options: [...question.options],
        explanation: '',
        difficulty: question.difficulty,
        imageUrl: question.imageUrl || undefined,
      })),
    };
  },
);
