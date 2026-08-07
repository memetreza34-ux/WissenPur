import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const geminiService = await readFile(
  resolve(repoRoot, 'wissenpur/src/services/geminiService.ts'),
  'utf8',
);

assert.match(geminiService, /import \{ app, auth \} from ['"]\.\.\/firebase['"]/);
assert.match(geminiService, /const expectedUser = auth\.currentUser;/);
assert.match(geminiService, /const result = await model\.generateContent\(prompt\);/);
assert.match(
  geminiService,
  /const result = await model\.generateContent\(prompt\);\s*if \(auth\.currentUser !== expectedUser\) \{/,
  'KI-Ergebnisse müssen unmittelbar nach dem await gegen die gestartete Auth-Sitzung geprüft werden.',
);
assert.match(geminiService, /KI-Ergebnis wurde verworfen, weil sich die Kontositzung geändert hat/);

const generationIndex = geminiService.indexOf('const result = await model.generateContent(prompt);');
const sessionGuardIndex = geminiService.indexOf('if (auth.currentUser !== expectedUser)', generationIndex);
const parseIndex = geminiService.indexOf('const jsonText = result.response.text().trim();', generationIndex);
const returnQuestionsIndex = geminiService.indexOf('return validatedQuestions.map', generationIndex);
assert.ok(generationIndex >= 0 && sessionGuardIndex > generationIndex);
assert.ok(parseIndex > sessionGuardIndex, 'Das KI-Ergebnis darf erst nach Sessionprüfung geparst werden.');
assert.ok(returnQuestionsIndex > sessionGuardIndex, 'Fragen dürfen erst nach Sessionprüfung an den Aufrufer zurückgegeben werden.');

console.log('KI-Fragengenerierung gegen Gast→Login, Logout und Kontowechsel während laufender Requests geprüft.');
