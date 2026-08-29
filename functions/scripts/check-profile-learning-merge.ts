import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLearningLibraries } from '../../wissenpur/src/services/learningLibraryMerge.ts';
import { mergeWrongQuestions } from '../../wissenpur/src/services/wrongQuestionMerge.ts';
import type { CustomQuiz, Question } from '../../wissenpur/src/types.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const question = (id: string, text: string): Question => ({
  id,
  category: 'technik',
  question: text,
  options: ['Richtig', 'Falsch'],
  correctAnswer: 0,
  explanation: 'Test-Erklärung',
  difficulty: 'mittel',
});

const localWrong = question('shared-wrong', 'Lokale Fehlerfrage');
const cloudWrong = question('shared-wrong', 'Cloud-Fehlerfrage');
const cloudOnlyWrong = question('cloud-only-wrong', 'Nur Cloud');
const mergedWrong = mergeWrongQuestions([localWrong], [cloudWrong, cloudOnlyWrong]);
assert.equal(mergedWrong.length, 2);
assert.equal(mergedWrong[0]?.question, 'Lokale Fehlerfrage');
assert.equal(mergedWrong[1]?.question, 'Nur Cloud');

const legacyRemoteImage = {
  ...question('legacy-remote-image', 'Altfrage mit externem Bild'),
  imageUrl: 'https://tracker.example/question.png',
};
const sanitizedLegacyWrong = mergeWrongQuestions([legacyRemoteImage], []);
assert.equal(sanitizedLegacyWrong.length, 1);
assert.equal(
  sanitizedLegacyWrong[0]?.imageUrl,
  undefined,
  'Fehlerfragen dürfen keine externen Bild-URLs aus Alt-/Cloud-Daten übernehmen.',
);

const invalidWrong = mergeWrongQuestions([
  { id: 'bad', question: 'Ungültig', options: ['gleich', 'gleich'], correctAnswer: 0, explanation: 'x' },
], []);
assert.deepEqual(invalidWrong, []);

const tooManyWrong = Array.from({ length: 350 }, (_, index) => question(`wrong-${index}`, `Frage ${index}`));
assert.equal(mergeWrongQuestions(tooManyWrong, []).length, 300);

const deck = (id: string, title: string, questionId: string): CustomQuiz => ({
  id,
  title,
  createdAt: 1_000,
  questions: [question(questionId, `${title} Frage`)],
});
const localDeck = deck('local-deck', 'Gast', 'local-deck-question');
const cloudDeck = deck('cloud-deck', 'Cloud', 'cloud-deck-question');
const mergedLibrary = mergeLearningLibraries([localDeck], [cloudDeck]);
assert.deepEqual(mergedLibrary.decks.map((entry) => entry.id), ['local-deck', 'cloud-deck']);

const [firebaseService, sessionBoundary, analyticsPanel, wrongQuestionMerge] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountSessionBoundary.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningAnalyticsPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/wrongQuestionMerge.ts'), 'utf8'),
]);

assert.match(firebaseService, /mergeLearningLibraries/);
assert.match(firebaseService, /mergeWrongQuestions/);
assert.match(firebaseService, /wrongQuestions: mergedWrongQuestions/);
assert.match(firebaseService, /customQuizzes: mergedLibrary/);
assert.match(firebaseService, /const requiresHydration = hydratedAuthUid !== expectedUid;/);
assert.match(firebaseService, /if \(requiresHydration\) \{/);
assert.match(firebaseService, /const authoritativeEconomy = \(await getServerEconomyState\(\)\)\.stats;/);
assert.match(firebaseService, /if \(!requiresHydration\) \{\s*logBestEffortSyncFailure\(error\);\s*return stats;/);
assert.match(firebaseService, /handleFirestoreError\(error, OperationType\.WRITE, 'current-user-profile'\);/);
assert.match(firebaseService, /Best-effort profile sync deferred/);
assert.doesNotMatch(
  firebaseService,
  /console\.(?:warn|error)\([^\n]*stats|console\.(?:warn|error)\([^\n]*uid/i,
  'Best-Effort-Logging darf keine Profilinhalte oder UID ausgeben.',
);
assert.doesNotMatch(
  wrongQuestionMerge,
  /imageUrl\.startsWith|https:\/\//,
  'Die Fehlerfragen-Normalisierung darf externe Bild-URLs nicht wieder freigeben.',
);
assert.match(sessionBoundary, /shouldClearLocalAccountDataForTransition/);
assert.match(analyticsPanel, /shouldClearLocalAccountDataForTransition/);

console.log('Gast-/Cloud-Merge, text-only Fehlerfragen, strikte Erst-Hydrierung, Best-Effort-Folge-Sync und gemeinsame Konto-Transition geprüft.');
