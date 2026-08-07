import type { CustomQuiz, Question } from '../types';

export const isQuestionDue = (question: Question, now = Date.now()): boolean => {
  const nextReviewDate = question.srsData?.nextReviewDate;
  return typeof nextReviewDate !== 'number' || !Number.isFinite(nextReviewDate) || nextReviewDate <= now;
};

export const getDueQuestions = (
  questions: readonly Question[],
  now = Date.now(),
): Question[] => questions.filter((question) => isQuestionDue(question, now));

export const getDueQuestionsFromDeck = (
  deck: CustomQuiz,
  now = Date.now(),
): Question[] => getDueQuestions(deck.questions, now);

export const getDueQuestionsFromLibrary = (
  decks: readonly CustomQuiz[],
  now = Date.now(),
): Question[] => decks.flatMap((deck) => getDueQuestionsFromDeck(deck, now));
