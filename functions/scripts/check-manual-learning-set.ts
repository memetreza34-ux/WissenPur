import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [main, editor, policy] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/ManualLearningSetPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/learningLibraryPolicy.ts'), 'utf8'),
]);

assert.match(main, /<ManualLearningSetPanel\s*\/>/);
assert.match(editor, /MAX_NEW_MANUAL_QUESTIONS = 30/);
assert.match(editor, /MIN_OPTIONS = 2/);
assert.match(editor, /MAX_OPTIONS = 6/);
assert.match(editor, /MAX_IMPORTED_QUESTIONS/);
assert.match(editor, /applyLearningLibraryPolicy\(candidateDecks\)/);
assert.match(editor, /policy\.decks\.find\(\(entry\) => entry\.id === deck\.id\)/);
assert.match(editor, /savedDeck\.questions\.length !== questions\.length/);
assert.match(editor, /Bibliothek hat ihr Größenlimit erreicht/);
assert.match(editor, /2–6 unterschiedliche Antworten/);
assert.match(editor, /new Set\(normalizedOptions/);
assert.match(editor, /keine Ranglistenpunkte/);
assert.match(editor, /syncUserStats\(stats\)\.catch/);
assert.match(editor, /wissenpur:library-updated/);
assert.match(editor, /wissenpur:stats-updated/);
assert.match(editor, /question\.id !== editingQuestionId/);
assert.match(editor, /loadDeck/);
assert.match(editor, /beginEditQuestion/);
assert.match(editor, /editingDeckCreatedAt/);
assert.match(editor, /library\.map\(\(entry\) => entry\.id === editingDeckId \? deck : entry\)/);
assert.match(editor, /const \[availableDecks, setAvailableDecks\] = useState/);
assert.match(editor, /window\.addEventListener\('wissenpur:library-updated', refresh\)/);
assert.doesNotMatch(
  editor,
  /const existingDecks\s*=\s*getStats\(\)/,
  'Der Editor darf getStats() nicht als potenziell schreibenden Render-Nebeneffekt verwenden.',
);
assert.match(editor, /previous\?\.imageUrl/);
assert.doesNotMatch(
  editor,
  /srsData:\s*previous/,
  'Geänderte Fragen dürfen ihren alten SRS-Status nicht übernehmen.',
);
assert.match(editor, /SRS-Status dieser Frage wurde zurückgesetzt/);
assert.match(editor, /options: options\.map/);
assert.match(editor, /correctAnswer,/);
assert.match(editor, /explanation: explanation\.trim\(\)\.slice\(0, 2_000\)/);
assert.match(policy, /MAX_LIBRARY_DECKS/);
assert.match(policy, /MAX_LIBRARY_QUESTIONS/);
assert.match(policy, /MAX_LIBRARY_SERIALIZED_BYTES/);

console.log('Manueller Lernset-Editor, Set-/Fragebearbeitung, State-Refresh, SRS-Reset, Alt-Daten-Normalisierung und Bibliotheksrichtlinie geprüft.');
