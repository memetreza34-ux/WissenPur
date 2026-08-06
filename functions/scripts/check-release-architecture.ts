import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const functionsSource = resolve(repoRoot, 'functions/src');
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

const mainPath = resolve(webSource, 'main.tsx');
const main = await readFile(mainPath, 'utf8');
if (!main.includes("from './ReleaseApp'")) {
  failures.push('wissenpur/src/main.tsx: Die Produktions-App muss ReleaseApp verwenden.');
}
if (/from ['"]\.\/App['"]/.test(main)) {
  failures.push('wissenpur/src/main.tsx: Der archivierte App-Monolith darf nicht gestartet werden.');
}

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
