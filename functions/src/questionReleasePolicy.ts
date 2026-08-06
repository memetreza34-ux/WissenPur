export interface RankedQuestionCandidate {
  id: string;
  category: string;
  question: string;
  explanation: string;
}

export type QuestionExclusionReason =
  | 'time-sensitive'
  | 'duplicate-question';

export interface QuestionExclusion {
  id: string;
  category: string;
  reason: QuestionExclusionReason;
  duplicateOf?: string;
}

const timeSensitivePatterns = [
  /\baktuell(?:e|er|es|en|em)?\b/i,
  /\bderzeit\b/i,
  /\bzurzeit\b/i,
  /\bmomentan\b/i,
  /\bgegenwärtig(?:e|er|es|en|em)?\b/i,
  /\bheute\b/i,
  /\bstand\s+(?:19|20)\d{2}\b/i,
  /\bweltrangliste\b/i,
  /\bhält\s+den\s+rekord\b/i,
  /\brekord\s+für\b/i,
  /\brekordweltmeister\b/i,
  /\bmeisten\s+einwohner\b/i,
  /\bmeisten\s+muttersprachler\b/i,
  /\bmeisten\s+monde\b/i,
  /\bamtierend(?:e|er|es|en|em)?\b/i,
  /\bwer\s+ist\s+(?:der|die)\s+.*\b(?:präsident|bundeskanzler|ministerpräsident|papst)\b/i,
];

export const normalizeQuestionText = (value: string): string =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isTimeSensitiveRankedQuestion = (
  candidate: RankedQuestionCandidate,
): boolean => {
  const searchable = `${candidate.question}\n${candidate.explanation}`;
  return timeSensitivePatterns.some((pattern) => pattern.test(searchable));
};

export const selectReleaseQuestions = <T extends RankedQuestionCandidate>(
  questions: readonly T[],
): { accepted: T[]; excluded: QuestionExclusion[] } => {
  const accepted: T[] = [];
  const excluded: QuestionExclusion[] = [];
  const firstQuestionByText = new Map<string, string>();

  for (const question of questions) {
    if (isTimeSensitiveRankedQuestion(question)) {
      excluded.push({
        id: question.id,
        category: question.category,
        reason: 'time-sensitive',
      });
      continue;
    }

    const normalizedText = normalizeQuestionText(question.question);
    const duplicateOf = firstQuestionByText.get(normalizedText);
    if (duplicateOf) {
      excluded.push({
        id: question.id,
        category: question.category,
        reason: 'duplicate-question',
        duplicateOf,
      });
      continue;
    }

    firstQuestionByText.set(normalizedText, question.id);
    accepted.push(question);
  }

  return { accepted, excluded };
};
