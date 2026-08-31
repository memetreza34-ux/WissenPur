import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [accountService, privacyPanel] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/services/accountService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountPrivacyPanel.tsx'), 'utf8'),
]);

assert.match(accountService, /class AccountAuthSessionChangedError extends Error/);
assert.match(accountService, /const assertActiveAccountUid = \(expectedUid: string\): void/);
assert.match(accountService, /const assertNoDifferentAccountUid = \(expectedUid: string\): void/);
assert.match(accountService, /const expectedUid = auth\.currentUser\?\.uid;/);
assert.match(accountService, /const response = await exportMyDataCallable\(\{\}\);\s*assertActiveAccountUid\(expectedUid\);/);
assert.match(accountService, /response\.data\.account\.uid !== expectedUid/);
assert.match(accountService, /return finalizeDeletedAccount\(expectedUid, response\.data\);/);
assert.match(accountService, /return finalizeDeletedAccount\(expectedUid, retry\.data\);/);
assert.match(accountService, /if \(auth\.currentUser\?\.uid === expectedUid\) \{\s*clearDeletedAccountCache\(\);/);
assert.doesNotMatch(
  accountService,
  /const response = await exportMyDataCallable\(\{\}\);\s*return response\.data;/,
  'Ein Export darf nicht ohne UID-Prüfung nach dem await zurückgegeben werden.',
);
assert.doesNotMatch(
  accountService,
  /await deleteMyAccountCallable\(\{\}\);\s*clearDeletedAccountCache\(\);/,
  'Eine Kontolöschung darf Browserdaten nicht ohne erneute Sitzungsprüfung löschen.',
);

assert.match(privacyPanel, /const expectedUid = user\.uid;/);
assert.match(privacyPanel, /auth\.currentUser\?\.uid !== expectedUid \|\| exported\.account\.uid !== expectedUid/);
assert.match(privacyPanel, /await deleteCurrentAccount\(\);\s*window\.location\.replace\('\/'\);/);
assert.doesNotMatch(
  privacyPanel,
  /localStorage\.removeItem|localStorage\.clear\(|sessionStorage\.clear\(/,
  'Das Datenschutz-Panel darf nach asynchronen Kontoaktionen keine globale Browserbereinigung selbst durchführen.',
);

console.log('UID-gebundener Datenexport, Kontolöschung und stale-session-sichere Browserbereinigung geprüft.');
