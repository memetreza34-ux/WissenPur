import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const [database, envExample, firebaseText] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/database.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/.env.example'), 'utf8'),
  readFile(resolve(repoRoot, 'firebase.json'), 'utf8'),
]);
const firebase = JSON.parse(firebaseText) as {
  functions?: Array<{
    runtime?: string;
    predeploy?: string[];
  }>;
};

const requireText = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${file}: ${explanation}`);
};

requireText(
  'functions/src/database.ts',
  database,
  "const isFunctionsEmulator = process.env.FUNCTIONS_EMULATOR === 'true';",
  'Emulator-Ausnahmen müssen an das offizielle Functions-Emulatorflag gebunden sein.',
);
requireText(
  'functions/src/database.ts',
  database,
  'if (!isFunctionsEmulator && namedDatabaseId)',
  'Eine benannte Produktionsdatenbank muss den Functions-Start hart blockieren.',
);
requireText(
  'functions/src/database.ts',
  database,
  'export const enforceAppCheck = !isFunctionsEmulator ||',
  'App Check muss außerhalb des Emulators unabhängig von Env-Werten aktiv sein.',
);
requireText(
  'functions/src/database.ts',
  database,
  "process.env.ENFORCE_APP_CHECK !== 'false';",
  'Nur der Emulator darf App Check explizit abschalten.',
);
requireText(
  'functions/.env.example',
  envExample,
  'FIRESTORE_DATABASE_ID=(default)',
  'Die dokumentierte Functions-Datenbank muss (default) sein.',
);
requireText(
  'functions/.env.example',
  envExample,
  'ENFORCE_APP_CHECK=true',
  'Die dokumentierte App-Check-Einstellung muss sicher aktiviert sein.',
);

const functionsConfig = firebase.functions?.[0];
if (functionsConfig?.runtime !== 'nodejs22') {
  failures.push('firebase.json: Cloud Functions müssen mit Node.js 22 deployt werden.');
}
if (!functionsConfig?.predeploy?.some((command) => command.includes('run build'))) {
  failures.push('firebase.json: Ein Functions-Deploy muss den vollständigen Build erzwingen.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-Functions-Laufzeitprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('Functions-Runtime, App Check, Datenbankziel und Predeploy-Gate geprüft.');
