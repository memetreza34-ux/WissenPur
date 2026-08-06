import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const functionsRoot = resolve(repoRoot, 'functions');
const functionsSource = resolve(functionsRoot, 'src');
const webSource = resolve(repoRoot, 'wissenpur/src');

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

const assertMissing = (
  file: string,
  content: string,
  pattern: RegExp,
  explanation: string,
) => {
  if (pattern.test(content)) failures.push(`${relative(file)}: ${explanation}`);
};

const assertIncludes = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${relative(file)}: ${explanation}`);
};

for (const forbiddenEnvironmentFile of [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
]) {
  const path = resolve(functionsRoot, forbiddenEnvironmentFile);
  if (existsSync(path)) {
    failures.push(
      `${relative(path)}: Functions-Umgebungsdateien dürfen nicht versioniert sein; verwende Secret Manager oder lokale, ignorierte Dateien.`,
    );
  }
}

const functionsGitignorePath = resolve(functionsRoot, '.gitignore');
const functionsGitignore = await readFile(functionsGitignorePath, 'utf8');
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

const webFiles = await walk(webSource);
for (const file of webFiles) {
  const content = await readFile(file, 'utf8');
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
  const content = await readFile(file, 'utf8');
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

const entryPath = resolve(functionsSource, 'entry.ts');
const entry = await readFile(entryPath, 'utf8');
for (const requiredExport of [
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
const economyCallables = await readFile(economyCallablesPath, 'utf8');
assertIncludes(
  economyCallablesPath,
  economyCallables,
  "db.collection('trustedLeaderboard')",
  'Serverwertungen müssen in trustedLeaderboard geschrieben werden.',
);
assertMissing(
  economyCallablesPath,
  economyCallables,
  /db\.collection\(['"]leaderboard['"]\)/,
  'Aktives Scoring darf die historische Client-Rangliste nicht schreiben.',
);
assertIncludes(
  economyCallablesPath,
  economyCallables,
  'readSessionAnswerKey',
  'Gewertete Abgaben müssen den unveränderlichen Sitzungs-Snapshot verwenden.',
);
assertIncludes(
  economyCallablesPath,
  economyCallables,
  'authToken?.picture',
  'Identity-Provider-Bilder müssen aus dem verifizierten Auth-Token stammen.',
);
assertMissing(
  economyCallablesPath,
  economyCallables,
  /userData\?\.photoURL/,
  'Öffentliche Ranglistenbilder dürfen nicht aus clientbeschreibbaren Profildaten stammen.',
);

const accountPath = resolve(functionsSource, 'account.ts');
const account = await readFile(accountPath, 'utf8');
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

const syncQuestionBankPath = resolve(repoRoot, 'functions/scripts/sync-question-bank.ts');
const syncQuestionBank = await readFile(syncQuestionBankPath, 'utf8');
assertIncludes(
  syncQuestionBankPath,
  syncQuestionBank,
  'selectReleaseQuestions',
  'Der Ranglistenkatalog muss Zeitabhängigkeit und Textduplikate filtern.',
);
assertIncludes(
  syncQuestionBankPath,
  syncQuestionBank,
  'minimumQuestionsPerCategory',
  'Jede sichtbare Kategorie benötigt eine geprüfte Mindestabdeckung.',
);
assertIncludes(
  syncQuestionBankPath,
  syncQuestionBank,
  'imageUrl: null',
  'Gewertete Fragen müssen aktuell ohne externe Bild-URLs erzeugt werden.',
);
assertIncludes(
  syncQuestionBankPath,
  syncQuestionBank,
  'four distinct options',
  'Der Build muss vier unterschiedliche Antwortoptionen erzwingen.',
);

const mainPath = resolve(webSource, 'main.tsx');
const main = await readFile(mainPath, 'utf8');
if (!main.includes("from './ReleaseApp'")) {
  failures.push('wissenpur/src/main.tsx: Die Produktions-App muss ReleaseApp verwenden.');
}
if (/from ['"]\.\/App['"]/.test(main)) {
  failures.push('wissenpur/src/main.tsx: Der archivierte App-Monolith darf nicht gestartet werden.');
}

const releaseAppPath = resolve(webSource, 'ReleaseApp.tsx');
const releaseApp = await readFile(releaseAppPath, 'utf8');
assertIncludes(
  releaseAppPath,
  releaseApp,
  'const quizGenerationRef = useRef(0);',
  'Quizstarts und Abbrüche benötigen eine Generations-ID gegen verspätete Timer.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'quizGenerationRef.current += 1;',
  'Quizabbrüche müssen alle verzögerten Aktionen invalidieren.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'ranked: activeQuiz.ranked,',
  'Eine fehlgeschlagene Ranglistenabgabe darf nicht als Übung markiert werden.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'Gewertete Prüfung fehlgeschlagen',
  'Fehlgeschlagene Ranglistenabgaben benötigen eine eindeutige Ergebniskennzeichnung.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'Nicht gewertet',
  'Serverfehler dürfen keine erfundene Null-Punkt-Auswertung anzeigen.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'disabled={isBusy}',
  'Der Prüfungsabbruch muss während einer laufenden Serverabgabe gesperrt sein.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  "const autoAdvance = activeQuiz.mode === 'blitz' || Boolean(activeQuiz.globalSeconds);",
  'Zeitbasierte Modi müssen als automatische Weiterleitung gekennzeichnet sein.',
);
assertIncludes(
  releaseAppPath,
  releaseApp,
  'selectedAnswer !== null && !autoAdvance',
  'Automatische Modi dürfen keinen konkurrierenden manuellen Weiter-Button anzeigen.',
);
assertMissing(
  releaseAppPath,
  releaseApp,
  /catch \(error\) \{[\s\S]{0,500}ranked:\s*false,[\s\S]{0,250}error:\s*message/,
  'Der Fehlerpfad darf eine gewertete Runde nicht zu einem Übungsergebnis umdeklarieren.',
);

const firebaseServicePath = resolve(webSource, 'services/firebaseService.ts');
const firebaseService = await readFile(firebaseServicePath, 'utf8');
assertIncludes(
  firebaseServicePath,
  firebaseService,
  "collection(db, 'trustedLeaderboard')",
  'Der Client darf nur die serververifizierte Rangliste lesen.',
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
const geminiService = await readFile(geminiServicePath, 'utf8');
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

const firebaseConfigPath = resolve(repoRoot, 'wissenpur/firebase-applet-config.json');
const firebaseConfig = JSON.parse(await readFile(firebaseConfigPath, 'utf8')) as Record<string, unknown>;
if ('firestoreDatabaseId' in firebaseConfig) {
  failures.push('wissenpur/firebase-applet-config.json: Eine benannte Firestore-Datenbank darf nicht fest eingebaut sein.');
}

const rulesPath = resolve(repoRoot, 'wissenpur/firestore.rules');
const rules = await readFile(rulesPath, 'utf8');
assertIncludes(
  rulesPath,
  rules,
  'match /trustedLeaderboard/{userId}',
  'Regeln für die serververifizierte Rangliste fehlen.',
);
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
assertIncludes(
  rulesPath,
  rules,
  'allow write: if false;',
  'Die serververifizierte Rangliste muss sämtliche Browserwrites verweigern.',
);
assertMissing(
  rulesPath,
  rules,
  /customPhotoURL['"]?\s*,/,
  'Clientregeln dürfen keine öffentlich nutzbaren Shop-Avatar-URLs freigeben.',
);

const webQuestionPath = resolve(webSource, 'data.ts');
const webQuestions = await readFile(webQuestionPath, 'utf8');
if (!webQuestions.includes("id: 'offline-")) {
  failures.push('wissenpur/src/data.ts: Der öffentliche Übungskatalog muss offline-* IDs verwenden.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-Architekturprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Release-Grenzen geprüft: ${webFiles.length} Webdateien und ${functionFiles.length} Functions-Dateien.`,
);
