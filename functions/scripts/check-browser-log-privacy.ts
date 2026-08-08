import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [firebase, main, gemini, firebaseService] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/firebase.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/geminiService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
]);

assert.match(firebase, /const browserErrorMetadata =/);
assert.match(firebase, /errorName:/);
assert.match(firebase, /errorCode:/);
assert.doesNotMatch(firebase, /console\.(?:error|warn)\([^\n]*,\s*error\s*\)/);
assert.doesNotMatch(firebase, /console\.(?:error|warn)\([^\n]*error\.message/);
assert.doesNotMatch(firebase, /console\.(?:error|warn)\([^\n]*message\s*\)/);

assert.match(main, /const errorName = error instanceof Error \? error\.name\.slice\(0, 80\)/);
assert.doesNotMatch(main, /error\.message/);
assert.doesNotMatch(main, /console\.warn\([^\n]*,\s*error\s*\)/);

assert.match(gemini, /console\.warn\('KI-Fragengenerierung fehlgeschlagen\.'\)/);
assert.doesNotMatch(gemini, /console\.error/);
assert.doesNotMatch(gemini, /console\.warn\([^\n]*,\s*error\s*\)/);

assert.match(firebaseService, /errorName: error instanceof Error \? error\.name : 'UnknownError'/);
assert.doesNotMatch(firebaseService, /console\.(?:error|warn)\([^\n]*,\s*error\s*\)/);
assert.doesNotMatch(firebaseService, /console\.(?:error|warn)\([^\n]*error\.message/);

console.log('Browserdiagnostik ist auf statische Ereignisse sowie begrenzte Fehlernamen/-codes beschränkt.');
