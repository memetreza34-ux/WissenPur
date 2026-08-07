import type { CustomQuiz, Question } from '../types';
import {
  estimateLearningLibraryBytes,
  MAX_IMPORTED_QUESTIONS,
  MAX_LIBRARY_DECKS,
  MAX_LIBRARY_QUESTIONS,
  MAX_LIBRARY_SERIALIZED_BYTES,
} from './learningSetImport';

export interface LearningLibraryPolicyResult {
  decks: CustomQuiz[];
  changed: boolean;
  reason: 'none' | 'deck-limit' | 'question-limit' | 'byte-limit' | 'invalid-entry';
}

const validQuestion = (value: unknown): value is Question => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const question = value as Partial<Question>;
  return typeof question.id === 'string' && question.id.length > 0 && question.id.length <= 150 &&
    typeof question.question === 'string' && question.question.length > 0 && question.question.length <= 500 &&
    Array.isArray(question.options) && question.options.length >= 2 && question.options.length <= 6 &&
    question.options.every((option) => typeof option === 'string' && option.length > 0 && option.length <= 250) &&
    typeof question.correctAnswer === 'number' && Number.isInteger(question.correctAnswer) &&
    question.correctAnswer >= 0 && question.correctAnswer < question.options.length &&
    typeof question.explanation === 'string' && question.explanation.length <= 2_000;
};

const normalizeDeck = (value: unknown): CustomQuiz | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const deck = value as Partial<CustomQuiz>;
  if (
    typeof deck.id !== 'string' || !deck.id.trim() || deck.id.length > 150 ||
    typeof deck.title !== 'string' || !deck.title.trim() || deck.title.length > 100 ||
    typeof deck.createdAt !== 'number' || !Number.isFinite(deck.createdAt) ||
    !Array.isArray(deck.questions)
  ) return null;

  const questions = deck.questions
    .filter(validQuestion)
    .slice(0, MAX_IMPORTED_QUESTIONS);
  if (questions.length === 0) return null;

  return {
    id: deck.id.trim(),
    title: deck.title.trim(),
    createdAt: Math.max(0, Math.trunc(deck.createdAt)),
    questions,
  };
};

export const applyLearningLibraryPolicy = (value: unknown): LearningLibraryPolicyResult => {
  if (!Array.isArray(value)) {
    return { decks: [], changed: value !== undefined && value !== null, reason: 'invalid-entry' };
  }

  const decks: CustomQuiz[] = [];
  let totalQuestions = 0;
  let changed = false;
  let reason: LearningLibraryPolicyResult['reason'] = 'none';

  for (const rawDeck of value) {
    if (decks.length >= MAX_LIBRARY_DECKS) {
      changed = true;
      reason = reason === 'none' ? 'deck-limit' : reason;
      break;
    }

    const deck = normalizeDeck(rawDeck);
    if (!deck) {
      changed = true;
      reason = reason === 'none' ? 'invalid-entry' : reason;
      continue;
    }

    const remainingQuestions = MAX_LIBRARY_QUESTIONS - totalQuestions;
    if (remainingQuestions <= 0) {
      changed = true;
      reason = reason === 'none' ? 'question-limit' : reason;
      break;
    }

    const limitedDeck = deck.questions.length > remainingQuestions
      ? { ...deck, questions: deck.questions.slice(0, remainingQuestions) }
      : deck;
    if (limitedDeck.questions.length !== deck.questions.length) {
      changed = true;
      reason = reason === 'none' ? 'question-limit' : reason;
    }

    const candidate = [...decks, limitedDeck];
    if (estimateLearningLibraryBytes(candidate) > MAX_LIBRARY_SERIALIZED_BYTES) {
      changed = true;
      reason = reason === 'none' ? 'byte-limit' : reason;
      break;
    }

    decks.push(limitedDeck);
    totalQuestions += limitedDeck.questions.length;
  }

  if (decks.length !== value.length) changed = true;
  return { decks, changed, reason };
};

export const assertLearningLibraryWithinPolicy = (decks: readonly CustomQuiz[]): void => {
  const result = applyLearningLibraryPolicy(decks);
  if (result.changed || result.decks.length !== decks.length) {
    throw new Error('Die Lernset-Bibliothek überschreitet die zulässigen Größen- oder Datenlimits.');
  }
};
