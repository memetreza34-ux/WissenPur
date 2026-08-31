import type { CustomQuiz, Difficulty, Question } from '../types';
import type { SRSData } from './srsService';
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
  reason: 'none' | 'deck-limit' | 'question-limit' | 'byte-limit' | 'invalid-entry' | 'duplicate-id';
}

interface NormalizedValue<T> {
  value: T | null;
  changed: boolean;
  duplicateId: boolean;
}

const normalizeString = (value: unknown, maxLength: number): string =>
  typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    : '';

const normalizeDifficulty = (value: unknown): Difficulty | undefined =>
  value === 'leicht' || value === 'mittel' || value === 'schwer'
    ? value
    : undefined;

const normalizeSrsData = (value: unknown): SRSData | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const data = value as Record<string, unknown>;
  if (
    typeof data.interval !== 'number' || !Number.isFinite(data.interval) || data.interval < 0 || data.interval > 36_500 ||
    typeof data.easeFactor !== 'number' || !Number.isFinite(data.easeFactor) || data.easeFactor < 1.3 || data.easeFactor > 5 ||
    typeof data.repetitions !== 'number' || !Number.isInteger(data.repetitions) || data.repetitions < 0 || data.repetitions > 10_000 ||
    typeof data.nextReviewDate !== 'number' || !Number.isFinite(data.nextReviewDate) || data.nextReviewDate < 0
  ) return undefined;
  return {
    interval: data.interval,
    easeFactor: data.easeFactor,
    repetitions: data.repetitions,
    nextReviewDate: data.nextReviewDate,
  };
};

const makeUniqueId = (
  base: string,
  usedIds: Set<string>,
  maxLength = 150,
): { id: string; duplicate: boolean } => {
  const normalizedBase = base.slice(0, maxLength);
  if (!usedIds.has(normalizedBase)) {
    usedIds.add(normalizedBase);
    return { id: normalizedBase, duplicate: false };
  }

  let suffix = 2;
  while (true) {
    const suffixText = `-${suffix}`;
    const candidate = `${normalizedBase.slice(0, maxLength - suffixText.length)}${suffixText}`;
    if (!usedIds.has(candidate)) {
      usedIds.add(candidate);
      return { id: candidate, duplicate: true };
    }
    suffix += 1;
  }
};

const normalizeQuestion = (
  value: unknown,
  usedQuestionIds: Set<string>,
): NormalizedValue<Question> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { value: null, changed: true, duplicateId: false };
  }

  const raw = value as Record<string, unknown>;
  const baseId = normalizeString(raw.id, 150);
  const question = normalizeString(raw.question, 500);
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => normalizeString(option, 250)).filter(Boolean).slice(0, 6)
    : [];
  const normalizedOptions = options.map((option) => option.toLocaleLowerCase('de-DE'));
  const correctAnswer = raw.correctAnswer;
  const explanation = normalizeString(raw.explanation, 2_000);

  if (
    !baseId ||
    !question ||
    options.length < 2 ||
    new Set(normalizedOptions).size !== options.length ||
    typeof correctAnswer !== 'number' ||
    !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 ||
    correctAnswer >= options.length ||
    !explanation
  ) {
    return { value: null, changed: true, duplicateId: false };
  }

  const uniqueId = makeUniqueId(baseId, usedQuestionIds);
  const category = normalizeString(raw.category, 50) || 'allgemein';
  const difficulty = normalizeDifficulty(raw.difficulty);
  const srsData = normalizeSrsData(raw.srsData);
  const allowedKeys = new Set([
    'id', 'category', 'question', 'options', 'correctAnswer', 'explanation',
    'difficulty', 'srsData',
  ]);

  const normalized: Question = {
    id: uniqueId.id,
    category,
    question,
    options,
    correctAnswer,
    explanation,
    ...(difficulty ? { difficulty } : {}),
    ...(srsData ? { srsData } : {}),
  };

  const changed = uniqueId.duplicate ||
    Object.keys(raw).some((key) => !allowedKeys.has(key)) ||
    raw.id !== normalized.id ||
    raw.category !== normalized.category ||
    raw.question !== normalized.question ||
    !Array.isArray(raw.options) ||
    raw.options.length !== normalized.options.length ||
    raw.options.some((option, index) => option !== normalized.options[index]) ||
    raw.explanation !== normalized.explanation ||
    (raw.difficulty !== undefined && raw.difficulty !== difficulty) ||
    raw.imageUrl !== undefined ||
    (raw.srsData !== undefined && !srsData);

  return { value: normalized, changed, duplicateId: uniqueId.duplicate };
};

const normalizeDeck = (
  value: unknown,
  usedDeckIds: Set<string>,
  usedQuestionIds: Set<string>,
): NormalizedValue<CustomQuiz> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { value: null, changed: true, duplicateId: false };
  }

  const raw = value as Record<string, unknown>;
  const baseId = normalizeString(raw.id, 150);
  const title = normalizeString(raw.title, 100);
  const createdAt = raw.createdAt;
  if (
    !baseId ||
    !title ||
    typeof createdAt !== 'number' ||
    !Number.isFinite(createdAt) ||
    !Array.isArray(raw.questions)
  ) {
    return { value: null, changed: true, duplicateId: false };
  }

  const uniqueId = makeUniqueId(baseId, usedDeckIds);
  const normalizedQuestions: Question[] = [];
  let changed = uniqueId.duplicate || raw.questions.length > MAX_IMPORTED_QUESTIONS;
  let duplicateId = uniqueId.duplicate;

  for (const rawQuestion of raw.questions.slice(0, MAX_IMPORTED_QUESTIONS)) {
    const normalizedQuestion = normalizeQuestion(rawQuestion, usedQuestionIds);
    if (!normalizedQuestion.value) {
      changed = true;
      continue;
    }
    normalizedQuestions.push(normalizedQuestion.value);
    changed ||= normalizedQuestion.changed;
    duplicateId ||= normalizedQuestion.duplicateId;
  }

  if (normalizedQuestions.length === 0) {
    return { value: null, changed: true, duplicateId };
  }

  const normalizedCreatedAt = Math.max(0, Math.trunc(createdAt));
  const allowedKeys = new Set(['id', 'title', 'questions', 'createdAt']);
  changed ||= Object.keys(raw).some((key) => !allowedKeys.has(key)) ||
    raw.id !== uniqueId.id ||
    raw.title !== title ||
    raw.createdAt !== normalizedCreatedAt ||
    normalizedQuestions.length !== raw.questions.length;

  return {
    value: {
      id: uniqueId.id,
      title,
      createdAt: normalizedCreatedAt,
      questions: normalizedQuestions,
    },
    changed,
    duplicateId,
  };
};

export const applyLearningLibraryPolicy = (value: unknown): LearningLibraryPolicyResult => {
  if (value === undefined || value === null) {
    return { decks: [], changed: false, reason: 'none' };
  }
  if (!Array.isArray(value)) {
    return { decks: [], changed: true, reason: 'invalid-entry' };
  }

  const decks: CustomQuiz[] = [];
  const usedDeckIds = new Set<string>();
  const usedQuestionIds = new Set<string>();
  let totalQuestions = 0;
  let changed = false;
  let reason: LearningLibraryPolicyResult['reason'] = 'none';

  for (const rawDeck of value) {
    if (decks.length >= MAX_LIBRARY_DECKS) {
      changed = true;
      reason = reason === 'none' ? 'deck-limit' : reason;
      break;
    }

    const normalizedDeck = normalizeDeck(rawDeck, usedDeckIds, usedQuestionIds);
    if (!normalizedDeck.value) {
      changed = true;
      reason = reason === 'none' ? 'invalid-entry' : reason;
      continue;
    }
    if (normalizedDeck.changed) {
      changed = true;
      reason = reason === 'none'
        ? normalizedDeck.duplicateId ? 'duplicate-id' : 'invalid-entry'
        : reason;
    }

    const remainingQuestions = MAX_LIBRARY_QUESTIONS - totalQuestions;
    if (remainingQuestions <= 0) {
      changed = true;
      reason = reason === 'none' ? 'question-limit' : reason;
      break;
    }

    const limitedDeck = normalizedDeck.value.questions.length > remainingQuestions
      ? { ...normalizedDeck.value, questions: normalizedDeck.value.questions.slice(0, remainingQuestions) }
      : normalizedDeck.value;
    if (limitedDeck.questions.length !== normalizedDeck.value.questions.length) {
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
