import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const functionsRoot = resolve(repoRoot, 'functions');
const functionsSource = resolve(functionsRoot, 'src');
const webRoot = resolve(repoRoot, 'wissenpur');
const webSource = resolve(webRoot, 'src');

const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json']);
const failures: string[] = [];

const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
};

const relative = (path: string) => path.slice(repoRoot.length + 1).replaceAll('\\', '/');

const assertIncludes = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${relative(file)}: ${explanation}`);
};

const assertMissing = (
  file: string,
  content: string,
  pattern: RegExp,
  explanation: string,
) => {
  if (pattern.test(content)) failures.push(`${relative(file)}: ${explanation}`);
};

const read = async (path: string) => readFile(path, 'utf8');

// Environment files must stay out of Functions source control apart from the
// intentionally documented example.
const functionsGitignorePath = resolve(functionsRoot, '.gitignore');
const functionsGitignore = await read(functionsGitignorePath);
assertIncludes(
  functionsGitignorePath,
  functionsGitignore,
  '.env.*',
  'Functions-Umgebungsvarianten müssen vollständig ignoriert werden.',
);
assertIncludes(
  functionsGitignorePath,
  functionsGitignore,
  '!.env.example',
  'Die dokumentierte Functions-Beispieldatei muss trotz Env-Sperre versionierbar bleiben.',
);

// Active browser source must never regain the former client-authoritative or
// browser-secret architecture.
const webFiles = await walk(webSource);
for (const file of webFiles) {
  const content = await read(file);
  assertMissing(
    file,
    content,
    /\brecordRoundResult\b|\brecordServerRoundResult\b/,
    'Der alte client-vertraute Rundenergebnis-Pfad darf nicht in der Web-App vorkommen.',
  );
  assertMissing(
    file,
    content,
    /\bstartRankedQuiz(?:Callable|Session)?\b/,
    'Der Client darf keine selbst ausgewählten Ranglistenfragen an den Server senden.',
  );
  assertMissing(
    file,
    content,
    /@google\/genai|GEMINI_API_KEY|process\.env\.(?:API_KEY|GEMINI)/,
    'Direkter Gemini-SDK- oder Geheimniszugriff ist im Browser verboten.',
  );
  assertMissing(
    file,
    content,
    /ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b/,
    'Die alte benannte AI-Studio-Datenbank darf nicht im aktiven Webquellbaum stehen.',
  );
}

const functionFiles = await walk(functionsSource);
for (const file of functionFiles) {
  const content = await read(file);
  assertMissing(
    file,
    content,
    /ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b/,
    'Die alte benannte AI-Studio-Datenbank darf nicht als Functions-Fallback vorkommen.',
  );
  assertMissing(
    file,
    content,
    /\brecordRoundResult\b/,
    'Der client-vertraute Übergangs-Endpunkt darf nicht mehr kompiliert werden.',
  );
}

// Vite may read a local development-only process.env value inside the Node
// config itself, but it must not define process.env values into browser code.
const viteConfigPath = resolve(webRoot, 'vite.config.ts');
const viteConfig = await read(viteConfigPath);
assertMissing(
  viteConfigPath,
  viteConfig,
  /['"]process\.env\.[A-Z0-9_]+['"]\s*:/i,
  'Vite darf keine process.env-Werte als Browser-Konstanten definieren.',
);
assertMissing(
  viteConfigPath,
  viteConfig,
  /\bloadEnv\s*\(/,
  'Vite darf keine komplette Env-Datei in die Build-Konfiguration laden.',
);
assertIncludes(
  viteConfigPath,
  viteConfig,
  'sourcemap: false',
  'Produktionsbundles müssen Source Maps explizit deaktiviert lassen.',
);

const entryPath = resolve(functionsSource, 'entry.ts');
const entry = await read(entryPath);
for (const requiredExport of [
  'getMyEconomyState',
  'getTrustedLeaderboard',
  'startSecureRankedQuiz',
  'submitRankedQuiz',
  'revealSecureRankedQuiz',
  'exportMyData',
  'deleteMyAccount',
]) {
  if (!entry.includes(requiredExport)) {
    failures.push(`functions/src/entry.ts: Sicherer Export ${requiredExport} fehlt.`);
  }
}

const economyCallablesPath = resolve(functionsSource, 'economyCallables.ts');
const economyCallables = await read(economyCallablesPath);
assertIncludes(
  economyCallablesPath,
  economyCallables,
  "db.collection('trustedLeaderboard')",
  'Serverbelohnungen mit Punktwirkung müssen trustedLeaderboard aktualisieren.',
);
assertIncludes(
  economyCallablesPath,
  economyCallables,
  'safeLeaderboardAvatar',
  'Öffentliche Ranglistenbilder müssen auf lokale Avatarassets begrenzt sein.',
);
assertMissing(
  economyCallablesPath,
  economyCallables,
  /db\.collection\(['"]leaderboard['"]\)/,
  'Aktive Economy darf die historische Client-Rangliste nicht schreiben.',
);
assertMissing(
  economyCallablesPath,
  economyCallables,
  /export const submitRankedQuiz|QUESTION_BANK|fallbackAnswerKey/,
  'Gewertete Abgaben und Fragenkatalog-Fallbacks dürfen nicht in economyCallables zurückkehren.',
);
assertMissing(
  economyCallablesPath,
  economyCallables,
  /authToken\?\.picture|providerPhoto|userData\?\.photoURL/,
  'Öffentliche Ranglistenbilder dürfen weder Provider- noch clientbeschreibbare Profilbilder verwenden.',
);

const secureSubmitPath = resolve(functionsSource, 'secureSubmit.ts');
const secureSubmit = await read(secureSubmitPath);
assertIncludes(
  secureSubmitPath,
  secureSubmit,
  'readSessionAnswerKey',
  'Gewertete Abgaben müssen den unveränderlichen Sitzungs-Snapshot verwenden.',
);
assertIncludes(
  secureSubmitPath,
  secureSubmit,
  "db.collection('trustedLeaderboard')",
  'Gewertete Abgaben müssen die serververifizierte Rangliste aktualisieren.',
);
assertIncludes(
  secureSubmitPath,
  secureSubmit,
  'safeLeaderboardAvatar',
  'Gewertete Abgaben dürfen nur lokale Avatarpfade in die Rangliste schreiben.',
);
assertMissing(
  secureSubmitPath,
  secureSubmit,
  /QUESTION_BANK|fallbackAnswerKey|authToken\?\.picture|providerPhoto/,
  'Gewertete Abgaben dürfen weder Katalog-Fallbacks noch externe Providerbilder verwenden.',
);

const leaderboardCallablePath = resolve(functionsSource, 'leaderboardCallable.ts');
const leaderboardCallable = await read(leaderboardCallablePath);
for (const expected of [
  '{ enforceAppCheck }',
  "collection('trustedLeaderboard')",
  "orderBy('totalPoints', 'desc')",
  'sanitizeEntry',
  'safeAvatar',
  'requestedLimit',
]) {
  assertIncludes(
    leaderboardCallablePath,
    leaderboardCallable,
    expected,
    `Sanitierende Leaderboard-Callable benötigt ${expected}.`,
  );
}
assertMissing(
  leaderboardCallablePath,
  leaderboardCallable,
  /email|question|learningAnalytics|customQuizzes/,
  'Die öffentliche Leaderboard-Callable darf keine Konto- oder Lerninhalte ausgeben.',
);

const economyStatePath = resolve(functionsSource, 'economyStateCallable.ts');
const economyState = await read(economyStatePath);
assertIncludes(
  economyStatePath,
  economyState,
  'normalizeEconomy(userData, today)',
  'Die Login-Hydrierung muss ausschließlich die serverseitige Economy-Normalisierung verwenden.',
);
assertIncludes(
  economyStatePath,
  economyState,
  '{ enforceAppCheck }',
  'Die Economy-Hydrierung muss App Check erzwingen.',
);

const accountPath = resolve(functionsSource, 'account.ts');
const account = await read(accountPath);
assertIncludes(
  accountPath,
  account,
  'sanitizeQuizSessionForExport',
  'Kontodatenexporte müssen den vertraulichen Lösungsschlüssel redigieren.',
);
assertIncludes(
  accountPath,
  account,
  'quizSessionAnswerKeys',
  'Der Export muss die Sicherheitsredaktion maschinenlesbar ausweisen.',
);

const syncQuestionBankPath = resolve(functionsRoot, 'scripts/sync-question-bank.ts');
const syncQuestionBank = await read(syncQuestionBankPath);
for (const expected of [
  'selectReleaseQuestions',
  'minimumQuestionsPerCategory',
  'imageUrl: null',
  'four distinct options',
]) {
  assertIncludes(
    syncQuestionBankPath,
    syncQuestionBank,
    expected,
    `Ranglistenkatalog-Gate benötigt ${expected}.`,
  );
}

const mainPath = resolve(webSource, 'main.tsx');
const main = await read(mainPath);
assertIncludes(
  mainPath,
  main,
  "from './ReleaseApp'",
  'Die Produktions-App muss ReleaseApp verwenden.',
);
assertMissing(
  mainPath,
  main,
  /from ['"]\.\/App['"]/,
  'Der archivierte App-Monolith darf nicht gestartet werden.',
);

const releaseAppPath = resolve(webSource, 'ReleaseApp.tsx');
const releaseApp = await read(releaseAppPath);
for (const [expected, explanation] of [
  ['const quizGenerationRef = useRef(0);', 'Quizstarts und Abbrüche benötigen eine Generations-ID gegen verspätete Timer.'],
  ['quizGenerationRef.current += 1;', 'Quizabbrüche müssen alle verzögerten Aktionen invalidieren.'],
  ['ranked: activeQuiz.ranked,', 'Eine fehlgeschlagene Ranglistenabgabe darf nicht als Übung markiert werden.'],
  ['Gewertete Prüfung fehlgeschlagen', 'Fehlgeschlagene Ranglistenabgaben benötigen eine eindeutige Ergebniskennzeichnung.'],
  ['Nicht gewertet', 'Serverfehler dürfen keine erfundene Null-Punkt-Auswertung anzeigen.'],
  ['disabled={isBusy}', 'Der Prüfungsabbruch muss während einer laufenden Serverabgabe gesperrt sein.'],
  ["const autoAdvance = activeQuiz.mode === 'blitz' || Boolean(activeQuiz.globalSeconds);", 'Zeitbasierte Modi müssen als automatische Weiterleitung gekennzeichnet sein.'],
  ['selectedAnswer !== null && !autoAdvance', 'Automatische Modi dürfen keinen konkurrierenden manuellen Weiter-Button anzeigen.'],
] as const) {
  assertIncludes(releaseAppPath, releaseApp, expected, explanation);
}
assertMissing(
  releaseAppPath,
  releaseApp,
  /catch \(error\) \{[\s\S]{0,500}ranked:\s*false,[\s\S]{0,250}error:\s*message/,
  'Der Fehlerpfad darf eine gewertete Runde nicht zu einem Übungsergebnis umdeklarieren.',
);

const firebaseServicePath = resolve(webSource, 'services/firebaseService.ts');
const firebaseService = await read(firebaseServicePath);
assertIncludes(
  firebaseServicePath,
  firebaseService,
  "functions, 'getTrustedLeaderboard'",
  'Die Web-App muss die sanitierende Leaderboard-Callable verwenden.',
);
assertIncludes(
  firebaseServicePath,
  firebaseService,
  'getTrustedLeaderboardCallable({ limit: safeLimit })',
  'Leaderboard-Listen müssen über die Callable geladen werden.',
);
assertIncludes(
  firebaseServicePath,
  firebaseService,
  'getServerEconomyState',
  'Der erste Login muss eine autoritative Economy-Hydrierung durchführen können.',
);
assertMissing(
  firebaseServicePath,
  firebaseService,
  /collection\(db, ['"]trustedLeaderboard['"]\)|getDocs\(leaderboardQuery\)/,
  'Browser-Direktzugriffe auf trustedLeaderboard sind verboten.',
);
assertMissing(
  firebaseServicePath,
  firebaseService,
  /setDoc\(doc\(db, ['"]leaderboard['"]|collection\(db, ['"]leaderboard['"]\)/,
  'Der Browser darf die historische Rangliste weder schreiben noch lesen.',
);
assertMissing(
  firebaseServicePath,
  firebaseService,
  /customPhotoURL:\s*stats\.customPhotoURL/,
  'Shop-Avatare dürfen nicht über den Browser-Profil-Sync geschrieben werden.',
);

const geminiServicePath = resolve(webSource, 'services/geminiService.ts');
const geminiService = await read(geminiServicePath);
assertMissing(
  geminiServicePath,
  geminiService,
  /pollinations|flagcdn|imagePrompt/i,
  'KI-Lernsets dürfen keine Lernthemen oder Bildprompts an externe Bildanbieter weitergeben.',
);
assertIncludes(
  geminiServicePath,
  geminiService,
  'countryCodeToFlag',
  'Flaggenübungen müssen ohne externen Bildabruf auskommen.',
);
assertIncludes(
  geminiServicePath,
  geminiService,
  'resolveQuestionCategory',
  'Freie KI-Themen müssen auf gültige interne Kategorien abgebildet werden.',
);

const firebaseConfigPath = resolve(webRoot, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(await read(firebaseConfigPath)) as Record<string, unknown>;
if ('firestoreDatabaseId' in firebaseConfig) {
  failures.push('wissenpur/firebase-applet-config.json: Eine benannte Firestore-Datenbank darf nicht fest eingebaut sein.');
}

const rulesPath = resolve(webRoot, 'firestore.rules');
const rules = await read(rulesPath);
assertIncludes(
  rulesPath,
  rules,
  'match /trustedLeaderboard/{userId}',
  'Regeln für die serververifizierte Rangliste fehlen.',
);
for (const deniedOperation of ['allow get: if false;', 'allow list: if false;', 'allow write: if false;']) {
  assertIncludes(
    rulesPath,
    rules,
    deniedOperation,
    `trustedLeaderboard muss Browserzugriff callable-only halten (${deniedOperation}).`,
  );
}
assertIncludes(
  rulesPath,
  rules,
  'changesOnlyProfileFields()',
  'Clientupdates müssen auf Profilfelder begrenzt sein.',
);
assertIncludes(
  rulesPath,
  rules,
  'match /serverRateLimits/{userId}',
  'Serverseitige Rate-Limits müssen vollständig vor Clients verborgen sein.',
);
assertMissing(
  rulesPath,
  rules,
  /customPhotoURL['"]?\s*,/,
  'Clientregeln dürfen keine öffentlich nutzbaren Shop-Avatar-URLs freigeben.',
);

const webQuestionPath = resolve(webSource, 'data.ts');
const webQuestions = await read(webQuestionPath);
assertIncludes(
  webQuestionPath,
  webQuestions,
  "id: 'offline-",
  'Der öffentliche Übungskatalog muss offline-* IDs verwenden.',
);

if (failures.length > 0) {
  console.error('\nWissenPur-Architekturprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Release-Grenzen geprüft: ${webFiles.length} Webdateien, ${functionFiles.length} Functions-Dateien, callable-only Rangliste und gehärteter Vite-Build.`,
);
