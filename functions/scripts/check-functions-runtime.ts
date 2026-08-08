import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const [packageText, tsconfigText, entry, database, account, leaderboardCallable] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/package.json'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/tsconfig.json'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/entry.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/database.ts'), 'utf8'),
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
if (compilerOptions.module !== 'NodeNext') failures.push('functions/tsconfig.json: module muss NodeNext sein.');
if (compilerOptions.moduleResolution !== 'NodeNext') failures.push('functions/tsconfig.json: moduleResolution muss NodeNext sein.');
if (compilerOptions.outDir !== 'lib') failures.push('functions/tsconfig.json: outDir muss lib sein.');
if (compilerOptions.rootDir !== 'src') failures.push('functions/tsconfig.json: rootDir muss src sein.');

for (const expected of [
  './economyCallables.js',
  './economyStateCallable.js',
  './leaderboardCallable.js',
  './secureSubmit.js',
  './secureStart.js',
  './secureReveal.js',
  './account.js',
]) {
  if (!entry.includes(expected)) failures.push(`functions/src/entry.ts: Export ${expected} fehlt.`);
}
if (!entry.includes('getTrustedLeaderboard')) {
  failures.push('functions/src/entry.ts: getTrustedLeaderboard muss öffentlich als Callable exportiert werden.');
}
if (/recordRoundResult|recordServerRoundResult/.test(entry)) {
  failures.push('functions/src/entry.ts: Der alte client-vertraute Rundenergebnis-Pfad darf nicht exportiert werden.');
}

if (!database.includes("initializeFirestore(app, {}, '(default)')")) {
  failures.push('functions/src/database.ts: Firestore muss explizit die (default)-Datenbank verwenden.');
}
if (!database.includes("process.env.FUNCTIONS_EMULATOR === 'true'")) {
  failures.push('functions/src/database.ts: Emulatorerkennung für App Check fehlt.');
}
if (!database.includes('export const enforceAppCheck = !runningInEmulator')) {
  failures.push('functions/src/database.ts: App-Check-Policy fehlt.');
}

if (!account.includes("from './database.js'")) {
  failures.push('functions/src/account.ts: Kontofunktionen müssen die gemeinsame (default)-Datenbank verwenden.');
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

console.log('Functions-Runtime, Leaderboard-Callable, Node/ESM/TypeScript und (default)-Firestore geprüft.');
