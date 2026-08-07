import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLearningLibraries } from '../../wissenpur/src/services/learningLibraryMerge.ts';
import { applyLearningLibraryPolicy } from '../../wissenpur/src/services/learningLibraryPolicy.ts';
import {
  estimateLearningLibraryBytes,
  LearningSetImportError,
  MAX_IMPORTED_QUESTIONS,
  MAX_LIBRARY_DECKS,
  MAX_LIBRARY_QUESTIONS,
  MAX_LIBRARY_SERIALIZED_BYTES,
  parseLearningSetImport,
  serializeLearningSet,
} from '../../wissenpur/src/services/learningSetImport.ts';
import {
  getDueQuestions,
  getDueQuestionsFromDeck,
  getDueQuestionsFromLibrary,
  isQuestionDue,
} from '../../wissenpur/src/services/reviewQueue.ts';
import type { CustomQuiz, Question } from '../../wissenpur/src/types.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const jsonImport = parseLearningSetImport(JSON.stringify({
  title: 'Elektrotechnik AP1',
  questions: [
    {
      question: 'Welche Einheit hat die elektrische Spannung?',
      options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
      correctAnswer: 0,
      explanation: 'Die Spannung wird in Volt angegeben.',
      category: 'technik',
      difficulty: 'leicht',
    },
    {
      question: 'Welche Antwort ist richtig?',
      options: ['A', 'B', 'C'],
      correctAnswer: 1,
      explanation: 'B ist die zweite Option.',
    },
  ],
}), 'ap1.json', 1_000);

assert.equal(jsonImport.format, 'json');
assert.equal(jsonImport.deck.title, 'Elektrotechnik AP1');
assert.equal(jsonImport.deck.questions.length, 2);
assert.equal(jsonImport.deck.questions[0]?.correctAnswer, 0);
assert.equal(jsonImport.deck.questions[1]?.correctAnswer, 1);
assert.match(jsonImport.deck.questions[0]?.id || '', /^import-elektrotechnik-ap1-/);
assert.equal(new Set(jsonImport.deck.questions.map((question) => question.id)).size, 2);
assert.ok(estimateLearningLibraryBytes([jsonImport.deck]) > 0);
assert.ok(MAX_LIBRARY_QUESTIONS >= MAX_IMPORTED_QUESTIONS);
assert.ok(MAX_LIBRARY_SERIALIZED_BYTES < 1_000_000);

const cleanPolicy = applyLearningLibraryPolicy([jsonImport.deck]);
assert.equal(cleanPolicy.changed, false);
assert.equal(cleanPolicy.reason, 'none');
assert.deepEqual(cleanPolicy.decks, [jsonImport.deck]);

const duplicatePolicy = applyLearningLibraryPolicy([
  jsonImport.deck,
  { ...jsonImport.deck, id: `${jsonImport.deck.id}-copy`, title: 'Elektrotechnik Kopie' },
]);
assert.equal(duplicatePolicy.changed, true);
assert.equal(duplicatePolicy.reason, 'duplicate-id');
assert.equal(duplicatePolicy.decks.length, 2);
const duplicateQuestionIds = duplicatePolicy.decks.flatMap((deck) =>
  deck.questions.map((question) => question.id),
);
assert.equal(new Set(duplicateQuestionIds).size, duplicateQuestionIds.length);
assert.ok(duplicateQuestionIds.every((id) => id.length <= 150));

const secondPolicyPass = applyLearningLibraryPolicy(duplicatePolicy.decks);
assert.equal(secondPolicyPass.changed, false, 'Normalisierung muss idempotent sein.');
assert.deepEqual(secondPolicyPass.decks, duplicatePolicy.decks);

const invalidQuestionPolicy = applyLearningLibraryPolicy([{
  ...jsonImport.deck,
  questions: [
    ...jsonImport.deck.questions,
    {
      id: 'invalid-question',
      category: 'technik',
      question: 'Ungültig',
      options: ['gleich', 'gleich'],
      correctAnswer: 0,
      explanation: 'Doppelte Optionen.',
    },
  ],
}]);
assert.equal(invalidQuestionPolicy.changed, true);
assert.equal(invalidQuestionPolicy.reason, 'invalid-entry');
assert.equal(invalidQuestionPolicy.decks[0]?.questions.length, 2);

const csvImport = parseLearningSetImport([
  'frage;option1;option2;option3;option4;richtig;erklaerung;kategorie;schwierigkeit',
  'Welche Netzspannung ist üblich?;230 V;24 V;12 V;400 V;1;Übliche Nennspannung.;technik;leicht',
  'Welcher Buchstabe ist korrekt?;Alpha;Beta;Gamma;Delta;C;Gamma ist richtig.;allgemein;mittel',
].join('\n'), 'elektro.csv', 2_000);

assert.equal(csvImport.format, 'csv');
assert.equal(csvImport.deck.questions.length, 2);
assert.equal(csvImport.deck.questions[0]?.correctAnswer, 0, 'CSV-Zahlen müssen 1-basiert gelesen werden.');
assert.equal(csvImport.deck.questions[1]?.correctAnswer, 2, 'CSV-Buchstaben müssen unterstützt werden.');

const roundTrip = parseLearningSetImport(
  serializeLearningSet(jsonImport.deck),
  'roundtrip.json',
  3_000,
);
assert.equal(roundTrip.deck.questions.length, jsonImport.deck.questions.length);
assert.deepEqual(
  roundTrip.deck.questions.map((question) => question.correctAnswer),
  jsonImport.deck.questions.map((question) => question.correctAnswer),
);

assert.throws(
  () => parseLearningSetImport('{invalid json', 'broken.json'),
  (error: unknown) => error instanceof LearningSetImportError,
);
assert.throws(
  () => parseLearningSetImport(JSON.stringify({
    questions: [{
      question: 'Doppelte Antworten sind ungültig',
      options: ['gleich', 'gleich'],
      correctAnswer: 0,
    }],
  }), 'invalid.json'),
  (error: unknown) => error instanceof LearningSetImportError,
);

const tooManyRows = Array.from({ length: MAX_IMPORTED_QUESTIONS + 5 }, (_, index) => ({
  question: `Frage ${index}`,
  options: ['Richtig', 'Falsch'],
  correctAnswer: 0,
}));
const limited = parseLearningSetImport(JSON.stringify({ questions: tooManyRows }), 'limited.json');
assert.equal(limited.deck.questions.length, MAX_IMPORTED_QUESTIONS);
assert.ok(limited.warnings.some((warning) => warning.includes(String(MAX_IMPORTED_QUESTIONS))));

const cloneQuestion = (question: Question, id: string, text = question.question): Question => ({
  ...question,
  id,
  question: text,
});
const makeDeck = (id: string, title: string, questionId: string, text = title): CustomQuiz => ({
  id,
  title,
  createdAt: 10_000,
  questions: [cloneQuestion(jsonImport.deck.questions[0]!, questionId, text)],
});

const reviewNow = 100_000;
const newQuestion = cloneQuestion(jsonImport.deck.questions[0]!, 'review-new');
const dueQuestion: Question = {
  ...cloneQuestion(jsonImport.deck.questions[0]!, 'review-due'),
  srsData: { interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: reviewNow },
};
const futureQuestion: Question = {
  ...cloneQuestion(jsonImport.deck.questions[0]!, 'review-future'),
  srsData: { interval: 6, easeFactor: 2.5, repetitions: 2, nextReviewDate: reviewNow + 1 },
};
const invalidDateQuestion: Question = {
  ...cloneQuestion(jsonImport.deck.questions[0]!, 'review-invalid'),
  srsData: { interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: Number.NaN },
};
assert.equal(isQuestionDue(newQuestion, reviewNow), true, 'Neue Karten müssen sofort fällig sein.');
assert.equal(isQuestionDue(dueQuestion, reviewNow), true, 'Karten am exakten Termin müssen fällig sein.');
assert.equal(isQuestionDue(futureQuestion, reviewNow), false, 'Karten nach dem Termin dürfen nicht vorzeitig geöffnet werden.');
assert.equal(isQuestionDue(invalidDateQuestion, reviewNow), true, 'Ungültige SRS-Termine müssen sicher als fällig behandelt werden.');
assert.deepEqual(
  getDueQuestions([newQuestion, dueQuestion, futureQuestion, invalidDateQuestion], reviewNow).map((question) => question.id),
  ['review-new', 'review-due', 'review-invalid'],
);
const reviewDeck: CustomQuiz = {
  id: 'review-deck',
  title: 'Review Deck',
  createdAt: reviewNow,
  questions: [newQuestion, dueQuestion, futureQuestion, invalidDateQuestion],
};
assert.equal(getDueQuestionsFromDeck(reviewDeck, reviewNow).length, 3);
assert.equal(getDueQuestionsFromLibrary([reviewDeck], reviewNow).length, 3);

const cloudDeck = makeDeck('cloud-set', 'Cloud Set', 'cloud-question');
const localDeck = makeDeck('local-set', 'Gast Set', 'local-question');
assert.deepEqual(mergeLearningLibraries([], [cloudDeck]).decks, [cloudDeck]);
assert.deepEqual(mergeLearningLibraries([localDeck], []).decks, [localDeck]);

const guestAndCloud = mergeLearningLibraries([localDeck], [cloudDeck]);
assert.equal(guestAndCloud.decks.length, 2, 'Gast- und Cloud-Lernsets müssen beim Login vereinigt werden.');
assert.deepEqual(guestAndCloud.decks.map((deck) => deck.id), ['local-set', 'cloud-set']);

const sharedCloud = makeDeck('shared-set', 'Cloud-Fassung', 'shared-cloud-question', 'Cloud-Frage');
const sharedLocal = makeDeck('shared-set', 'Lokale Fassung', 'shared-local-question', 'Lokale Offline-Frage');
const sameIdMerge = mergeLearningLibraries([sharedLocal], [sharedCloud]);
assert.equal(sameIdMerge.decks.length, 1);
assert.equal(sameIdMerge.decks[0]?.title, 'Lokale Fassung', 'Bei gleicher Deck-ID muss die aktuelle lokale Fassung gewinnen.');
assert.equal(sameIdMerge.decks[0]?.questions[0]?.question, 'Lokale Offline-Frage');

const localQuestionOwner = makeDeck('local-owner', 'Lokal', 'cross-device-question', 'Lokale Frage');
const cloudDuplicateQuestion = makeDeck('cloud-duplicate', 'Cloud', 'cross-device-question', 'Cloud-Frage');
const questionConflict = mergeLearningLibraries([localQuestionOwner], [cloudDuplicateQuestion]);
assert.equal(questionConflict.decks[0]?.questions[0]?.id, 'cross-device-question');
assert.notEqual(questionConflict.decks[1]?.questions[0]?.id, 'cross-device-question', 'Cloud-only-ID-Konflikt muss umbenannt werden, lokale ID bleibt stabil.');

const manyLocalDecks = Array.from({ length: Math.ceil(MAX_LIBRARY_DECKS / 2) }, (_, index) =>
  makeDeck(`local-${index}`, `Lokal ${index}`, `local-question-${index}`),
);
const manyCloudDecks = Array.from({ length: MAX_LIBRARY_DECKS }, (_, index) =>
  makeDeck(`cloud-${index}`, `Cloud ${index}`, `cloud-question-${index}`),
);
const limitedMerge = mergeLearningLibraries(manyLocalDecks, manyCloudDecks);
assert.equal(limitedMerge.decks.length, MAX_LIBRARY_DECKS, 'Auch der Merge muss das globale Deck-Limit einhalten.');
assert.deepEqual(
  limitedMerge.decks.slice(0, manyLocalDecks.length).map((deck) => deck.id),
  manyLocalDecks.map((deck) => deck.id),
  'Lokale Decks dürfen durch das globale Limit nicht hinter Cloud-Decks verdrängt werden.',
);

const [main, releaseApp, manager, learningPlan, boundary, flashcards, importPanel, storage, firebaseService] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/ReleaseApp.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningLibraryManager.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningPlanPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountSessionBoundary.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/pages/Flashcards.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningSetImportPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/storage.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
]);

assert.match(main, /<LearningLibraryManager\s*\/>/);
assert.match(releaseApp, /getDueQuestionsFromLibrary/);
assert.match(releaseApp, /const dueReviewQuestions = useMemo/);
assert.match(releaseApp, /getDueQuestionsFromLibrary\(stats\.customQuizzes \|\| \[\], reviewNow\)/);
assert.match(releaseApp, /openFlashcards\(dueReviewQuestions, null, 'today'\)/);
assert.match(releaseApp, /setScreen\(flashcardReturnScreen\)/);
assert.match(releaseApp, /const closeFlashcards = \(\) => \{[\s\S]{0,220}setStats\(getStats\(\) as ReleaseStats\)/);
assert.match(releaseApp, /setInterval\(\(\) => setReviewNow\(Date\.now\(\)\), REVIEW_REFRESH_MS\)/);
assert.doesNotMatch(
  releaseApp,
  /openFlashcards\(stats\.customQuizzes\.flatMap\(\(deck\) => deck\.questions\)\)/,
  'Der Heute-CTA darf nicht wieder ungefiltert alle Bibliothekskarten öffnen.',
);
assert.match(manager, /LearningSetImportPanel/);
assert.match(manager, /serializeLearningSet/);
assert.match(manager, /getDueQuestionsFromDeck/);
assert.match(manager, /getDueQuestionsFromLibrary/);
assert.match(manager, /getDueQuestionsFromLibrary\(decks, reviewNow\)/);
assert.match(manager, /getDueQuestionsFromDeck\(deck, reviewNow\)/);
assert.match(manager, /setInterval\(\(\) => setReviewNow\(Date\.now\(\)\), REVIEW_REFRESH_MS\)/);
assert.doesNotMatch(manager, /const questionIsDue/);
assert.match(manager, /Probeprüfung/);
assert.match(manager, /keine Ranglistenpunkte/);
assert.match(manager, /validateLibraryLimits/);
assert.match(manager, /syncStatsBestEffort/);
assert.match(manager, /\.catch\(\(error: unknown\)/);
assert.match(manager, /wissenpur:library-updated/);
assert.match(learningPlan, /getDueQuestionsFromLibrary/);
assert.match(learningPlan, /getDueQuestionsFromLibrary\(getStats\(\)\.customQuizzes \|\| \[\], now\)/);
assert.match(learningPlan, /window\.setInterval\(refresh, REVIEW_REFRESH_MS\)/);
assert.doesNotMatch(learningPlan, /\.flatMap\(\(deck\) => deck\.questions\)[\s\S]{0,120}nextReviewDate/);
assert.match(importPanel, /MAX_LIBRARY_QUESTIONS/);
assert.match(importPanel, /MAX_LIBRARY_SERIALIZED_BYTES/);
assert.match(importPanel, /estimateLearningLibraryBytes/);
assert.match(flashcards, /persistSrsUpdates/);
assert.match(flashcards, /sameSrsData/);
assert.match(flashcards, /wissenpur:stats-updated/);
assert.match(storage, /applyLearningLibraryPolicy/);
assert.match(storage, /customQuizzes: library\.decks/);
assert.match(firebaseService, /mergeLearningLibraries/);
assert.match(firebaseService, /customQuizzes: mergedLibrary/);
assert.match(firebaseService, /saveStats\(persistedStats\)/);
assert.match(firebaseService, /wissenpur:library-updated/);
assert.match(boundary, /wissenpur:library-updated/);
assert.match(boundary, /contentRevision/);

console.log('Lernset-Import, gemeinsame Due-Queue in Heute/Bibliothek/Lernplan, lokale/Cloud-Merge-Policy, SRS-State-Refresh, Zeit-Refresh, Rücknavigation, Offline-Speicherung und Probeprüfung geprüft.');
