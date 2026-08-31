import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const functionsRoot = resolve(currentDir, '..');
const failures: string[] = [];

const read = (path: string) => readFile(resolve(functionsRoot, path), 'utf8');

const [entry, start, submit, reveal] = await Promise.all([
  read('src/entry.ts'),
  read('src/secureStart.ts'),
  read('src/secureSubmit.ts'),
  read('src/secureReveal.ts'),
]);

const requireText = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${file}: ${explanation}`);
};

const forbid = (
  file: string,
  content: string,
  pattern: RegExp,
  explanation: string,
) => {
  if (pattern.test(content)) failures.push(`${file}: ${explanation}`);
};

requireText(
  'functions/src/entry.ts',
  entry,
  "export { submitRankedQuiz } from './secureSubmit.js';",
  'Die deployte Ranglistenabgabe muss aus secureSubmit exportiert werden.',
);
forbid(
  'functions/src/entry.ts',
  entry,
  /submitRankedQuiz,[\s\S]{0,200}from ['"]\.\/economyCallables\.js['"]/,
  'Der alte Economy-Sammelpfad darf die deployte Ranglistenabgabe nicht exportieren.',
);

requireText(
  'functions/src/secureStart.ts',
  start,
  'answerKey: selected.map',
  'Jede neue Ranglistensitzung benötigt einen unveränderlichen Antwort-Snapshot.',
);
requireText(
  'functions/src/secureStart.ts',
  start,
  'optionCount: question.optionCount',
  'Der Snapshot muss die gültige Optionsanzahl speichern.',
);
requireText(
  'functions/src/secureStart.ts',
  start,
  'expiresAt: Timestamp.fromMillis',
  'Jede Sitzung benötigt ein serverseitig gesetztes Ablaufdatum.',
);

for (const [file, content] of [
  ['functions/src/secureSubmit.ts', submit],
  ['functions/src/secureReveal.ts', reveal],
] as const) {
  requireText(
    file,
    content,
    'readSessionAnswerKey',
    'Abgabe und Auswertung müssen ausschließlich den Sitzungs-Snapshot lesen.',
  );
  requireText(
    file,
    content,
    'Sicherheitssnapshot',
    'Ein fehlender oder beschädigter Snapshot muss explizit fehlschlagen.',
  );
  forbid(
    file,
    content,
    /QUESTION_BANK|questionById|fallbackAnswerKey|\|\|\s*fallback/,
    'Ein Fallback auf den aktuellen Fragenkatalog ist in gewerteten Sitzungen verboten.',
  );
}

requireText(
  'functions/src/secureSubmit.ts',
  submit,
  "if (session.status !== 'active')",
  'Nur aktive Sitzungen dürfen erstmals abgegeben werden.',
);
requireText(
  'functions/src/secureSubmit.ts',
  submit,
  "if (session.status === 'submitted')",
  'Wiederholte Netzwerkabgaben müssen idempotent das gespeicherte Ergebnis liefern.',
);
requireText(
  'functions/src/secureSubmit.ts',
  submit,
  "status: 'submitted'",
  'Die Transaktion muss die Sitzung nach erfolgreicher Wertung abschließen.',
);
requireText(
  'functions/src/secureReveal.ts',
  reveal,
  "if (session.status !== 'submitted')",
  'Lösungen dürfen erst nach einer abgeschlossenen Abgabe freigegeben werden.',
);

if (failures.length > 0) {
  console.error('\nWissenPur-Snapshotprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('Gewertete Quizstarts, Abgaben und Reveals sind snapshotgebunden.');
