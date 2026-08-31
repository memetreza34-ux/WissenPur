import type { CategoryId, Difficulty, Question } from '../types';

const MAX_WRONG_QUESTIONS = 300;
const categoryIds = new Set<CategoryId>([
  'allgemein', 'geschichte', 'geografie', 'wissenschaft', 'technik',
  'sprache', 'deutschland', 'tiere', 'weltall', 'sport', 'kunst',
  'musik', 'filme', 'literatur', 'medizin', 'natur', 'wirtschaft',
  'politik', 'mythologie', 'videospiele', 'flaggen',
]);

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : '';

const normalizeDifficulty = (value: unknown): Difficulty | undefined =>
  value === 'leicht' || value === 'mittel' || value === 'schwer' ? value : undefined;

const normalizeWrongQuestion = (value: unknown): Question | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const id = text(raw.id, 150);
  const question = text(raw.question, 500);
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => text(option, 250)).filter(Boolean).slice(0, 6)
    : [];
  const normalizedOptions = options.map((option) => option.toLocaleLowerCase('de-DE'));
  const correctAnswer = raw.correctAnswer;
  const explanation = text(raw.explanation, 2_000);

  if (
    !id || !question || !explanation || options.length < 2 ||
    new Set(normalizedOptions).size !== options.length ||
    typeof correctAnswer !== 'number' || !Number.isInteger(correctAnswer) ||
    correctAnswer < 0 || correctAnswer >= options.length
  ) return null;

  const categoryText = text(raw.category, 50) as CategoryId;
  const category = categoryIds.has(categoryText) ? categoryText : 'allgemein';
  const difficulty = normalizeDifficulty(raw.difficulty);

  // Wrong-question history is user-controlled profile content. Keep it fully
  // text-only so legacy or manipulated entries cannot trigger remote image
  // requests when error training is opened.
  return {
    id,
    category,
    question,
    options,
    correctAnswer,
    explanation,
    ...(difficulty ? { difficulty } : {}),
  };
};

/** Current-device questions win on duplicate IDs; cloud-only questions follow. */
export const mergeWrongQuestions = (
  localValue: unknown,
  cloudValue: unknown,
): Question[] => {
  const result: Question[] = [];
  const ids = new Set<string>();

  for (const source of [localValue, cloudValue]) {
    if (!Array.isArray(source)) continue;
    for (const raw of source) {
      if (result.length >= MAX_WRONG_QUESTIONS) return result;
      const question = normalizeWrongQuestion(raw);
      if (!question || ids.has(question.id)) continue;
      ids.add(question.id);
      result.push(question);
    }
  }

  return result;
};
