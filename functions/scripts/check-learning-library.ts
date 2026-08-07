import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  estimateLearningLibraryBytes,
  LearningSetImportError,
  MAX_IMPORTED_QUESTIONS,
  MAX_LIBRARY_QUESTIONS,
  MAX_LIBRARY_SERIALIZED_BYTES,
  parseLearningSetImport,
  serializeLearningSet,
} from '../../wissenpur/src/services/learningSetImport.ts';

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

const [main, manager, boundary, flashcards, importPanel] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningLibraryManager.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountSessionBoundary.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/pages/Flashcards.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningSetImportPanel.tsx'), 'utf8'),
]);

assert.match(main, /<LearningLibraryManager\s*\/>/);
assert.match(manager, /LearningSetImportPanel/);
assert.match(manager, /serializeLearningSet/);
assert.match(manager, /questionIsDue/);
assert.match(manager, /Probeprüfung/);
assert.match(manager, /keine Ranglistenpunkte/);
assert.match(manager, /validateLibraryLimits/);
assert.match(manager, /syncStatsBestEffort/);
assert.match(manager, /\.catch\(\(error: unknown\)/);
assert.match(manager, /wissenpur:library-updated/);
assert.match(importPanel, /MAX_LIBRARY_QUESTIONS/);
assert.match(importPanel, /MAX_LIBRARY_SERIALIZED_BYTES/);
assert.match(importPanel, /estimateLearningLibraryBytes/);
assert.match(flashcards, /persistSrsUpdates/);
assert.match(flashcards, /wissenpur:stats-updated/);
assert.match(boundary, /wissenpur:library-updated/);
assert.match(boundary, /contentRevision/);

console.log('Lernset-Import, Bibliothek, Fälligkeit, Offline-Speicherung und Probeprüfung geprüft.');
