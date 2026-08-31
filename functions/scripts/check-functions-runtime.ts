import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const [
  packageText,
  tsconfigText,
  entry,
  database,
  envExample,
  account,
  leaderboardCallable,
] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/package.json'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/tsconfig.json'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/entry.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/database.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/.env.example'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/account.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/leaderboardCallable.ts'), 'utf8'),
]);

const packageJson = JSON.parse(packageText) as Record<string, unknown>;
const tsconfig = JSON.parse(tsconfigText) as {
  compilerOptions?: Record<string, unknown>;
};

const scripts = packageJson.scripts as Record<string, string> | undefined;
const engines = packageJson.engines as Record<string, string> | undefined;
const devDependencies = packageJson.devDependencies as Record<string, string> | undefined;
const dependencies = packageJson.dependencies as Record<string, string> | undefined;

if (packageJson.type !== 'module') failures.push('functions/package.json: type muss module sein.');
if (packageJson.main !== 'lib/entry.js') failures.push('functions/package.json: main muss lib/entry.js sein.');
if (engines?.node !== '22') failures.push('functions/package.json: Node-Runtime muss 22 sein.');
if (packageJson.packageManager !== 'npm@10.9.2') {
  failures.push('functions/package.json: packageManager muss npm@10.9.2 festlegen.');
}
if (scripts?.build !== 'npm run verify && npm run compile') {
  failures.push('functions/package.json: build muss Verifikation und Compile ausführen.');
}
if (scripts?.compile !== 'tsc') failures.push('functions/package.json: compile-Skript fehlt.');
if (scripts?.typecheck !== 'tsc --noEmit') failures.push('functions/package.json: typecheck-Skript fehlt.');
if (!scripts?.test?.includes('tsx --test tests/*.test.ts')) failures.push('functions/package.json: Unit-Test-Skript fehlt.');
if (scripts?.['test:typecheck'] !== 'tsc -p tsconfig.tests.json --noEmit') {
  failures.push('functions/package.json: Test-Typecheck-Skript fehlt.');
}
if (!devDependencies?.typescript) failures.push('functions/package.json: TypeScript fehlt als devDependency.');
if (!devDependencies?.tsx) failures.push('functions/package.json: tsx fehlt als devDependency.');
if (!dependencies?.['firebase-admin'] || !dependencies?.['firebase-functions']) {
  failures.push('functions/package.json: Firebase-Produktionsabhängigkeiten fehlen.');
}

const compilerOptions = tsconfig.compilerOptions || {};
if (compilerOptions.target !== 'ES2022') failures.push('functions/tsconfig.json: target muss ES2022 sein.');
if (compilerOptions.module !== 'NodeNext') failures.push('functions/tsconfig.json: module muss NodeNext sein.');
if (compilerOptions.moduleResolution !== 'NodeNext') failures.push('functions/tsconfig.json: moduleResolution muss NodeNext sein.');
if (compilerOptions.outDir !== 'lib') failures.push('functions/tsconfig.json: outDir muss lib sein.');
if (compilerOptions.rootDir !== 'src') failures.push('functions/tsconfig.json: rootDir muss src sein.');
if (compilerOptions.strict !== true) failures.push('functions/tsconfig.json: strict muss aktiviert sein.');

for (const expected of [
  './economyCallables.js',
  './avatarEquipCallable.js',
  './economyStateCallable.js',
  './leaderboardCallable.js',
  './secureSubmit.js',
  './secureStart.js',
  './secureReveal.js',
  './account.js',
]) {
  if (!entry.includes(expected)) failures.push(`functions/src/entry.ts: Export ${expected} fehlt.`);
}
for (const forbidden of ['recordRoundResult', 'recordServerRoundResult']) {
  if (entry.includes(forbidden)) {
    failures.push(`functions/src/entry.ts: Verbotener Legacy-Export ${forbidden} ist aktiv.`);
  }
}

// Production Functions must always resolve the Admin SDK against Firestore
// `(default)`. A named database is allowed only in the local Functions emulator.
for (const expected of [
  "const isFunctionsEmulator = process.env.FUNCTIONS_EMULATOR === 'true';",
  'const configuredDatabaseId = process.env.FIRESTORE_DATABASE_ID?.trim();',
  "configuredDatabaseId !== '(default)'",
  'if (!isFunctionsEmulator && namedDatabaseId)',
  'Production Functions must use Firestore (default). Named databases are allowed only in the local emulator.',
  'getFirestore(firebaseApp, namedDatabaseId)',
  'getFirestore(firebaseApp);',
  'export const enforceAppCheck = !isFunctionsEmulator ||',
  "process.env.ENFORCE_APP_CHECK !== 'false';",
]) {
  if (!database.includes(expected)) {
    failures.push(`functions/src/database.ts: Produktionsgrenze fehlt: ${expected}`);
  }
}
if (/initializeFirestore\(/.test(database)) {
  failures.push('functions/src/database.ts: Admin Functions dürfen nicht den Web-SDK-initializeFirestore-Pfad verwenden.');
}

for (const expected of [
  'FIRESTORE_DATABASE_ID=(default)',
  'ENFORCE_APP_CHECK=true',
  'FUNCTIONS_EMULATOR=true',
]) {
  if (!envExample.includes(expected) && expected !== 'FUNCTIONS_EMULATOR=true') {
    failures.push(`functions/.env.example: ${expected} muss dokumentiert sein.`);
  }
}
if (!envExample.includes('named ID is accepted only while FUNCTIONS_EMULATOR=true')) {
  failures.push('functions/.env.example: Named-Database-Ausnahme muss explizit auf den Emulator begrenzt sein.');
}
if (!envExample.includes('disable it only') || !envExample.includes('local Functions emulator')) {
  failures.push('functions/.env.example: App-Check-Deaktivierung muss explizit emulator-only dokumentiert sein.');
}

if (!account.includes("from './database.js'")) {
  failures.push('functions/src/account.ts: Kontofunktionen müssen die gemeinsame Datenbank-Runtime verwenden.');
}
if (/firebase-admin\/firestore/.test(account)) {
  failures.push('functions/src/account.ts: Eigene Firestore-Initialisierung ist verboten.');
}

for (const expected of [
  "from 'firebase-functions/v2/https'",
  "from './database.js'",
  '{ enforceAppCheck }',
  "collection('trustedLeaderboard')",
  "orderBy('totalPoints', 'desc')",
  'normalizePublicLeaderboardLimit',
  'sanitizeEntry',
]) {
  if (!leaderboardCallable.includes(expected)) {
    failures.push(`functions/src/leaderboardCallable.ts: Sicherer Runtime-Baustein fehlt: ${expected}.`);
  }
}
if (/firebase-admin\/firestore|initializeFirestore|getFirestore\(/.test(leaderboardCallable)) {
  failures.push('functions/src/leaderboardCallable.ts: Eigene Firestore-Initialisierung ist verboten.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-Functions-Runtimeprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('Functions-Runtime, Emulatorgrenzen, App Check, Leaderboard-Callable, Node/ESM/TypeScript und Firestore-(default)-Policy geprüft.');
