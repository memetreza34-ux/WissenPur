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

assert.match(
  geminiService,
  /topic\.replace\(\/\[<>`\]\/g, ' '\)/,
  'Nutzerthemen müssen Prompt-Trennzeichen entfernen, bevor sie in THEMA-Tags eingesetzt werden.',
);
assert.match(geminiService, /const seenQuestions = new Set<string>\(\)/);
assert.match(geminiService, /if \(seenQuestions\.has\(key\)\) return false/);
assert.match(
  geminiService,
  /if \(validatedQuestions\.length !== safeCount\) \{/,
  'Teilweise oder durch Duplikate verkürzte KI-Sets dürfen nicht gespeichert werden.',
);
assert.match(geminiService, /responseMimeType: 'application\/json'/);
assert.match(geminiService, /responseSchema: createResponseSchema\(safeCount\)/);
assert.match(geminiService, /const MAX_TOPIC_LENGTH = 120/);
assert.match(geminiService, /const MAX_QUESTION_COUNT = 30/);
assert.doesNotMatch(
  geminiService,
  /console\.error\([^)]*error/s,
  'Rohe SDK-Fehler dürfen nicht in der Browserkonsole ausgegeben werden.',
);
assert.doesNotMatch(
  geminiService,
  /prompt[\s\S]{0,500}(?:uid|email|totalPoints|coins|learningAnalytics)/i,
  'Der KI-Prompt darf keine Konto-, Economy- oder Analysedaten einbetten.',
);

console.log('KI-Fragengenerierung ist gegen Sessionwechsel, Prompt-Trennzeichen, Duplikate, Teilantworten und rohe Fehlerlogs abgesichert.');
