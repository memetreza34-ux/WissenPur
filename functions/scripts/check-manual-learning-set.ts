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
assert.match(editor, /MAX_MANUAL_QUESTIONS = 30/);
assert.match(editor, /assertLearningLibraryWithinPolicy\(nextDecks\)/);
assert.match(editor, /vier unterschiedliche Antworten/);
assert.match(editor, /new Set\(normalizedOptions/);
assert.match(editor, /keine Ranglistenpunkte/);
assert.match(editor, /syncUserStats\(stats\)\.catch/);
assert.match(editor, /wissenpur:library-updated/);
assert.match(editor, /wissenpur:stats-updated/);
assert.match(editor, /question\.question\.toLocaleLowerCase\('de-DE'\)/);
assert.match(editor, /options: options\.map/);
assert.match(editor, /correctAnswer,/);
assert.match(editor, /explanation: explanation\.trim\(\)\.slice\(0, 2_000\)/);
assert.match(policy, /MAX_LIBRARY_DECKS/);
assert.match(policy, /MAX_LIBRARY_QUESTIONS/);
assert.match(policy, /MAX_LIBRARY_SERIALIZED_BYTES/);

console.log('Manueller Lernset-Editor, Übungsgrenze und Bibliotheksrichtlinie geprüft.');
