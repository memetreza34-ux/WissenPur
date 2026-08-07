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
assert.match(accountService, /const assertActiveAuthUid = \(expectedUid: string\): void/);
assert.match(accountService, /const assertNoDifferentAuthUid = \(expectedUid: string\): void/);

const exportFunction = accountService.match(
  /export const exportCurrentAccountData =[\s\S]*?\n};/,
)?.[0] || '';
assert.match(exportFunction, /const expectedUid = currentUser\.uid;/);
assert.match(exportFunction, /await exportMyDataCallable\(\{\}\);/);
assert.match(exportFunction, /assertActiveAuthUid\(expectedUid\);/);
assert.match(exportFunction, /response\.data\.account\.uid !== expectedUid/);

const deleteFunction = accountService.match(
  /export const deleteCurrentAccount =[\s\S]*?\n};/,
)?.[0] || '';
assert.match(deleteFunction, /const expectedUid = currentUser\.uid;/);
assert.match(deleteFunction, /assertNoDifferentAuthUid\(expectedUid\);[\s\S]*?clearDeletedAccountCache\(\);/);
assert.match(deleteFunction, /assertActiveAuthUid\(expectedUid\);[\s\S]*?reauthenticateWithPopup/);
assert.match(deleteFunction, /getIdToken\(currentUser, true\);[\s\S]*?assertActiveAuthUid\(expectedUid\);/);
assert.match(deleteFunction, /const retry = await deleteMyAccountCallable\(\{\}\);[\s\S]*?assertNoDifferentAuthUid\(expectedUid\);/);

assert.match(privacyPanel, /const assertPrivacyActionSession =/);
assert.match(privacyPanel, /const expectedUid = user\.uid;[\s\S]*?exportCurrentAccountData\(\)/);
assert.match(privacyPanel, /exported\.account\.uid !== expectedUid/);
assert.match(privacyPanel, /readLocalAnalyticsForUser\(exported\.account\.uid\)/);
assert.match(privacyPanel, /await deleteCurrentAccount\(\);[\s\S]*?assertPrivacyActionSession\(expectedUid, true\);/);
assert.doesNotMatch(
  privacyPanel,
  /await deleteCurrentAccount\(\);[\s\S]{0,450}localStorage\.removeItem/,
  'Der UI-Pfad darf nach der serverseitigen Löschung nicht erneut lokalen Cache eines inzwischen anderen Kontos löschen.',
);

console.log('Kontoexport und Kontolöschung sind gegen verspätete Antworten fremder Auth-Sitzungen abgesichert.');
