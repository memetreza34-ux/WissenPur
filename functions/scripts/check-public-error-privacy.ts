import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPublicErrorMessage } from '../../wissenpur/src/services/publicErrorMessage.ts';

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

const fallback = 'Sichere Standardmeldung.';
assert.equal(
  getPublicErrorMessage({
    code: 'functions/failed-precondition',
    message: 'Beantworte zuerst zehn Fragen.',
  }, fallback),
  'Beantworte zuerst zehn Fragen.',
  'Kontrollierte Business-Fehler sollen für Nutzer verständlich bleiben.',
);
assert.equal(
  getPublicErrorMessage({
    code: 'functions/internal',
    message: 'Request failed at https://europe-west1-example.cloudfunctions.net/internal?apiKey=secret',
  }, fallback),
  'Der Server konnte die Aktion nicht sicher abschließen.',
  'Interne Fehler müssen unabhängig von ihrer Rohmessage einen festen Text verwenden.',
);
assert.equal(
  getPublicErrorMessage({
    code: 'vendor/private-sdk-error',
    message: 'projects/private-project/locations/eu crashed',
  }, fallback),
  fallback,
);
assert.equal(
  getPublicErrorMessage({
    message: 'See https://firebaseapp.com/debug for details',
  }, fallback),
  fallback,
);
assert.equal(
  getPublicErrorMessage({
    code: 'auth/network-request-failed',
    message: 'raw sdk networking detail',
  }, fallback),
  'Die Anmeldung benötigt eine funktionierende Internetverbindung.',
);
assert.equal(
  getPublicErrorMessage({
    code: 'functions/invalid-argument',
    message: 'FirebaseError: Der Wert ist ungültig.',
  }, fallback),
  'Der Wert ist ungültig.',
);

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

console.log('Öffentliche Fehlermeldungen filtern technische Details funktional und bleiben bei kontrollierten Business-Fehlern verständlich.');
