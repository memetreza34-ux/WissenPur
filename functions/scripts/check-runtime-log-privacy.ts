import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const srcDir = resolve(currentDir, '../src');
const files = (await readdir(srcDir)).filter((name) => name.endsWith('.ts'));
const directLogPattern = /(?:logger|console)\.(?:log|info|warn|error|debug)\s*\(/;
const loggerImportPattern = /import\s+\{[^}]*\blogger\b[^}]*\}\s+from\s+['"]firebase-functions['"]/s;

for (const filename of files) {
  if (filename === 'privacyLogger.ts') continue;
  const source = await readFile(resolve(srcDir, filename), 'utf8');
  assert.doesNotMatch(
    source,
    directLogPattern,
    `${filename}: Runtime-Logs müssen über privacyLogger.ts laufen.`,
  );
  assert.doesNotMatch(
    source,
    loggerImportPattern,
    `${filename}: firebase-functions logger darf nur im zentralen Privacy-Logger importiert werden.`,
  );
}

const privacyLogger = await readFile(resolve(srcDir, 'privacyLogger.ts'), 'utf8');
assert.match(privacyLogger, /logger\.error\(event, \{/);
assert.match(privacyLogger, /errorName/);
assert.match(privacyLogger, /errorCode/);
assert.doesNotMatch(privacyLogger, /logger\.(?:info|warn|debug)\s*\(/);
assert.doesNotMatch(
  privacyLogger,
  /logger\.error\([^)]*\b(?:uid|sessionId|email|question|request|payload)\b/s,
  'Der zentrale Runtime-Logger darf keine nutzerbezogenen Metadaten loggen.',
);

console.log('Functions-Runtime-Logging ist auf technische, nicht personenbezogene Fehler-Metadaten begrenzt.');
