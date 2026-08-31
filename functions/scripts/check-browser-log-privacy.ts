import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const webSource = resolve(repoRoot, 'wissenpur/src');

const walkBrowserSource = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkBrowserSource(path));
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(path);
  }
  return files;
};

const browserFiles = await walkBrowserSource(webSource);
for (const file of browserFiles) {
  const source = await readFile(file, 'utf8');
  const relative = file.slice(repoRoot.length + 1).replaceAll('\\', '/');
  assert.doesNotMatch(
    source,
    /console\.(?:error|warn|info|log)\([\s\S]{0,240},\s*(?:error|err)\s*[,)]/,
    `${relative}: Rohe Error-Objekte dürfen nicht direkt in Browserlogs geschrieben werden.`,
  );
  assert.doesNotMatch(
    source,
    /console\.(?:error|warn|info|log)\([\s\S]{0,240}(?:error|err)\.message/,
    `${relative}: Rohe Fehlermeldungen dürfen nicht direkt in Browserlogs geschrieben werden.`,
  );
}

const [firebase, main, gemini, firebaseService, flashcards, storage] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/firebase.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/geminiService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/pages/Flashcards.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/storage.ts'), 'utf8'),
]);

assert.match(firebase, /const browserErrorMetadata =/);
assert.match(firebase, /errorName:/);
assert.match(firebase, /errorCode:/);

assert.match(main, /const errorName = error instanceof Error \? error\.name\.slice\(0, 80\)/);
assert.doesNotMatch(main, /error\.message/);

assert.match(gemini, /console\.warn\('KI-Fragengenerierung fehlgeschlagen\.'\)/);
assert.doesNotMatch(gemini, /console\.error/);

assert.match(firebaseService, /errorName: error instanceof Error \? error\.name : 'UnknownError'/);

assert.match(flashcards, /const errorName = error instanceof Error \? error\.name\.slice\(0, 80\)/);

assert.match(storage, /const browserSyncErrorMetadata =/);
assert.match(storage, /errorName:/);
assert.match(storage, /errorCode:/);
assert.match(storage, /browserSyncErrorMetadata\(error\)/);
assert.doesNotMatch(
  storage,
  /console\.warn\([\s\S]{0,180},\s*error\s*[,)]/,
  'Lokale Economy-Reconciliation darf kein rohes SDK-Error-Objekt loggen.',
);

console.log(`Browserdiagnostik in ${browserFiles.length} aktiven TS/TSX-Dateien ist auf statische Ereignisse sowie begrenzte Fehlernamen/-codes beschränkt.`);
