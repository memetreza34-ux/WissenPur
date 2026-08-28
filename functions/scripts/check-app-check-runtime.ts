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
assert.match(firebase, /const configuredDatabaseId = import\.meta\.env\.VITE_FIRESTORE_DATABASE_ID\?\.trim\(\)/);
assert.match(firebase, /const hasUnsafeProductionDatabase = Boolean\(/);
assert.match(firebase, /export const isAppCheckConfigured = Boolean\(appCheckSiteKey\)/);
assert.match(firebase, /export const assertProtectedOnlineRuntimeReady = \(\): void => \{/);
assert.match(firebase, /initializeAppCheck\(app, \{/);
assert.match(firebase, /provider: new ReCaptchaEnterpriseProvider\(appCheckSiteKey\)/);
assert.match(firebase, /isTokenAutoRefreshEnabled: true/);

const guardStart = firebase.indexOf('export const assertProtectedOnlineRuntimeReady');
const initializationStart = firebase.indexOf('if (appCheckSiteKey)', guardStart);
assert.ok(guardStart >= 0 && initializationStart > guardStart, 'Der lazy App-Check-Guard muss vor der Initialisierung definiert sein.');
const guardSection = firebase.slice(guardStart, initializationStart);
assert.match(guardSection, /if \(import\.meta\.env\.PROD && !isAppCheckConfigured\) \{/);
assert.match(guardSection, /if \(hasUnsafeProductionDatabase\) \{/);
assert.match(guardSection, /Firestore muss \(default\) verwenden/);
assert.match(guardSection, /throw new Error\(/, 'Der lazy Guard muss in fehlkonfigurierter Produktion fail-closed sein.');

const productionFallbackStart = firebase.indexOf('} else if (import.meta.env.PROD)', initializationStart);
const authInitializationStart = firebase.indexOf('export const auth = initializeAuth', productionFallbackStart);
assert.ok(productionFallbackStart >= 0 && authInitializationStart > productionFallbackStart);
const productionFallback = firebase.slice(productionFallbackStart, authInitializationStart);
assert.match(productionFallback, /console\.error\('Firebase App Check is not configured for this production build\.'\)/);
assert.doesNotMatch(
  productionFallback,
  /throw new Error/,
  'Fehlendes App Check darf den Modulimport nicht abbrechen; nur konkrete Online-Aktionen dürfen fail-closed blockieren.',
);

assert.match(firebase, /const developmentDatabaseId = !import\.meta\.env\.PROD/);
assert.match(firebase, /configuredDatabaseId !== '\(default\)'/);
assert.match(firebase, /export const db = developmentDatabaseId[\s\S]{0,180}initializeFirestore\(app, firestoreSettings\);/);
assert.doesNotMatch(
  firebase,
  /export const db = configuredDatabaseId && configuredDatabaseId !== '\(default\)'/,
  'Production darf eine benannte Firestore-Datenbank nicht direkt aus der Build-Umgebung übernehmen.',
);

assert.match(functionsClient, /import \{ app, assertProtectedOnlineRuntimeReady \} from ['"]\.\.\/firebase['"]/);
assert.match(functionsClient, /export const assertFunctionsClientReady = assertProtectedOnlineRuntimeReady/);

assert.match(
  economy,
  /const runForCurrentAuthenticatedSession = async[\s\S]{0,220}assertFunctionsClientReady\(\);/,
  'Jede Economy-/Ranked-Callable muss durch den zentralen Functions-Guard laufen.',
);

assert.match(account, /export const exportCurrentAccountData = async[\s\S]{0,160}assertFunctionsClientReady\(\);/);
assert.match(account, /export const deleteCurrentAccount = async[\s\S]{0,160}assertFunctionsClientReady\(\);/);
assert.ok(
  (account.match(/assertFunctionsClientReady\(\);/g) || []).length >= 3,
  'Auch der Lösch-Retry nach Reauth muss App Check erneut vor dem Callable prüfen.',
);

assert.match(firebaseService, /const persistProfileOnly = async[\s\S]{0,260}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const syncUserStats = async[\s\S]{0,650}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const fetchUserStats = async[\s\S]{0,180}assertProtectedOnlineRuntimeReady\(\);/);
assert.match(firebaseService, /export const getLeaderboard = async[\s\S]{0,200}assertFunctionsClientReady\(\);/);

assert.match(gemini, /export const generateQuestions = async[\s\S]{0,220}assertProtectedOnlineRuntimeReady\(\);/);
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

console.log('App Check, fail-closed Online-Grenzen und (default)-Firestore für Production geprüft.');
