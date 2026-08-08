import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [sanitizer, economyService, privacyPanel] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/services/publicErrorMessage.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/economyService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountPrivacyPanel.tsx'), 'utf8'),
]);

assert.match(sanitizer, /FORBIDDEN_TECHNICAL_DETAILS/);
for (const marker of [
  'https?:\\/\\/',
  'cloudfunctions\\.net',
  'firebaseapp\\.com',
  'googleapis\\.com',
  'projects\\/',
  'api[-_ ]?key',
]) {
  assert.ok(sanitizer.includes(marker), `Technischer Fehlerfilter fehlt: ${marker}`);
}
assert.match(sanitizer, /SAFE_MESSAGE_CODES/);
assert.match(sanitizer, /FIXED_CODE_MESSAGES/);
assert.match(sanitizer, /\.slice\(0, 300\)/);
assert.match(sanitizer, /if \(!message \|\| FORBIDDEN_TECHNICAL_DETAILS\.test\(message\)\) return fallback/);
assert.match(sanitizer, /if \(code && !SAFE_MESSAGE_CODES\.has\(code\)\) return fallback/);

assert.match(economyService, /import \{ getPublicErrorMessage \} from '\.\/publicErrorMessage'/);
assert.match(economyService, /getPublicErrorMessage\(error, 'Die Online-Funktion ist momentan nicht verfügbar\.'\)/);
assert.doesNotMatch(
  economyService,
  /if \(error && typeof error === 'object' && 'message' in error\)[\s\S]*?return message/,
  'Callable-Fehler dürfen nicht mehr ungefiltert error.message zurückgeben.',
);

assert.match(privacyPanel, /import \{ getPublicErrorMessage \} from '\.\.\/services\/publicErrorMessage'/);
assert.match(privacyPanel, /getPublicErrorMessage\(error, 'Der Datenexport konnte nicht abgeschlossen werden\.'\)/);
assert.match(privacyPanel, /getPublicErrorMessage\(error, 'Das Konto konnte nicht sicher gelöscht werden\.'\)/);
assert.doesNotMatch(privacyPanel, /const getErrorMessage =/);

console.log('Öffentliche Fehlermeldungen sind gegen technische URLs, Projektpfade und rohe SDK-Nachrichten abgesichert.');
