import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [firebase, functionsClient, economy, account, firebaseService, gemini] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/firebase.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/functionsClient.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/economyService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/accountService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/geminiService.ts'), 'utf8'),
]);

assert.match(firebase, /const appCheckSiteKey = import\.meta\.env\.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY\?\.trim\(\)/);
assert.match(firebase, /export const isAppCheckConfigured = Boolean\(appCheckSiteKey\)/);
assert.match(firebase, /export const assertProtectedOnlineRuntimeReady = \(\): void => \{/);
assert.match(firebase, /if \(import\.meta\.env\.PROD && !isAppCheckConfigured\) \{/);
assert.match(firebase, /initializeAppCheck\(app, \{/);
assert.match(firebase, /provider: new ReCaptchaEnterpriseProvider\(appCheckSiteKey\)/);
assert.match(firebase, /isTokenAutoRefreshEnabled: true/);
assert.doesNotMatch(
  firebase,
  /export const app = initializeApp\(firebaseConfig\);[\s\S]{0,500}throw new Error/,
  'Fehlendes App Check darf den Modulimport nicht abbrechen; der Fail-Closed-Guard muss lazy bleiben.',
);

assert.match(functionsClient, /import \{ app, assertProtectedOnlineRuntimeReady \} from ['"]\.\.\/firebase['"]/);
assert.match(functionsClient, /export const assertFunctionsClientReady = assertProtectedOnlineRuntimeReady/);

assert.match(
  economy,
  /const runForCurrentAuthenticatedSession = async[\s\S]{0,220}assertFunctionsClientReady\(\);/,
  'Jede Economy-/Ranked-Callable muss durch den zentralen Functions-Guard laufen.',
);

assert.match(account, /export const exportCurrentAccountData = async[\s\S]{0,140}assertFunctionsClientReady\(\);/);
assert.match(account, /export const deleteCurrentAccount = async[\s\S]{0,140}assertFunctionsClientReady\(\);/);
assert.ok(
  (account.match(/assertFunctionsClientReady\(\);/g) || []).length >= 3,
  'Auch der Lösch-Retry nach Reauth muss App Check erneut vor dem Callable prüfen.',
);

assert.match(firebaseService, /const persistProfileOnly = async[\s\S]{0,220}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const syncUserStats = async[\s\S]{0,500}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const fetchUserStats = async[\s\S]{0,160}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const getLeaderboard = async[\s\S]{0,180}assertFunctionsClientReady\(\);/);

assert.match(gemini, /export const generateQuestions = async[\s\S]{0,180}assertProtectedOnlineRuntimeReady\(\);/);
const aiGuard = gemini.indexOf('assertProtectedOnlineRuntimeReady();');
const aiRequest = gemini.indexOf('const result = await model.generateContent(prompt);');
assert.ok(aiGuard >= 0 && aiRequest > aiGuard, 'Firebase AI darf erst nach dem Runtime-App-Check-Guard senden.');

for (const file of [economy, account, firebaseService, gemini]) {
  assert.doesNotMatch(
    file,
    /VITE_RECAPTCHA_ENTERPRISE_SITE_KEY/,
    'Feature-Services dürfen den Site-Key nicht selbst auswerten; die Policy muss zentral in firebase.ts bleiben.',
  );
}

console.log('Lazy App-Check-Initialisierung und fail-closed Guards für Functions, Cloud-Profil, Rangliste und Firebase AI geprüft.');
