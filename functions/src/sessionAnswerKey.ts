export interface SessionAnswerKeyEntry {
  questionId: string;
  correctAnswer: number;
  optionCount: number;
  explanation: string;
}

export const readSessionAnswerKey = (
  value: unknown,
  questionIds: readonly string[],
): SessionAnswerKeyEntry[] | null => {
  if (!Array.isArray(value) || value.length !== questionIds.length) return null;

  const allowedIds = new Set(questionIds);
  const entries = new Map<string, SessionAnswerKeyEntry>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const data = raw as Record<string, unknown>;
    const questionId = typeof data.questionId === 'string'
      ? data.questionId.trim()
      : '';
    const optionCount = data.optionCount;
    const correctAnswer = data.correctAnswer;
    const explanation = typeof data.explanation === 'string'
      ? data.explanation.trim().slice(0, 5_000)
      : '';

    if (
      !questionId ||
      !allowedIds.has(questionId) ||
      entries.has(questionId) ||
      typeof optionCount !== 'number' ||
      !Number.isInteger(optionCount) ||
      optionCount < 2 ||
      optionCount > 10 ||
      typeof correctAnswer !== 'number' ||
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= optionCount
    ) {
      return null;
    }

    entries.set(questionId, {
      questionId,
      correctAnswer,
      optionCount,
      explanation,
    });
  }

  const ordered = questionIds.map((questionId) => entries.get(questionId));
  if (ordered.some((entry) => !entry)) return null;
  return ordered as SessionAnswerKeyEntry[];
};
