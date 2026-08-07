import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldClearLocalAccountDataForTransition } from '../../wissenpur/src/services/accountSessionPolicy.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const readWebFile = (path: string) =>
  readFile(resolve(repoRoot, 'wissenpur/src', path), 'utf8');

const assertIncludes = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${file}: ${explanation}`);
};

const assertMissing = (
  file: string,
  content: string,
  pattern: RegExp,
  explanation: string,
) => {
  if (pattern.test(content)) failures.push(`${file}: ${explanation}`);
};

assert.equal(shouldClearLocalAccountDataForTransition(undefined, null), false);
assert.equal(shouldClearLocalAccountDataForTransition(undefined, 'account-a'), false);
assert.equal(shouldClearLocalAccountDataForTransition(null, 'account-a'), false, 'Gastdaten sollen beim ersten Login übernommen werden.');
assert.equal(shouldClearLocalAccountDataForTransition('account-a', 'account-a'), false);
assert.equal(shouldClearLocalAccountDataForTransition('account-a', null), true, 'Logout/Auth-Verlust muss Kontodaten löschen.');
assert.equal(shouldClearLocalAccountDataForTransition('account-a', 'account-b'), true, 'Kontowechsel muss vorherige Kontodaten löschen.');

const [storage, learningPlan, firebase, accountService, sessionBoundary, analyticsPanel, main] = await Promise.all([
  readWebFile('storage.ts'),
  readWebFile('services/learningPlanService.ts'),
  readWebFile('firebase.ts'),
  readWebFile('services/accountService.ts'),
  readWebFile('components/AccountSessionBoundary.tsx'),
  readWebFile('components/LearningAnalyticsPanel.tsx'),
  readWebFile('main.tsx'),
]);

assertMissing(
  'wissenpur/src/storage.ts',
  storage,
  /recordServerRoundResult|recordRoundResult|createRoundId/,
  'Der client-vertraute Übergangspfad für Rundenergebnisse muss entfernt bleiben.',
);
assertIncludes(
  'wissenpur/src/storage.ts',
  storage,
  "const STORAGE_OWNER_KEY = 'wissenpur_user_stats_owner';",
  'Lokale Stats benötigen einen expliziten Kontobesitzer.',
);
assertIncludes(
  'wissenpur/src/storage.ts',
  storage,
  'export const isLocalAccountDataReadable',
  'Lokale Kontodaten müssen vor jedem Lesen auf den aktiven Benutzer geprüft werden.',
);
assertIncludes(
  'wissenpur/src/storage.ts',
  storage,
  'export const prepareLocalAccountDataForWrite',
  'Lokale Kontodaten müssen vor jedem Schreiben auf den aktiven Benutzer begrenzt werden.',
);
assertIncludes(
  'wissenpur/src/storage.ts',
  storage,
  'if (auth.currentUser && stats.economyVersion === 1) return stats;',
  'Angemeldete Übungsrunden dürfen serververwaltete Economy-Werte nicht lokal erhöhen.',
);
assertIncludes(
  'wissenpur/src/storage.ts',
  storage,
  "localStorage.removeItem(LEARNING_PLAN_STORAGE_KEY);",
  'Ein Kontowechsel muss auch den lokal gespeicherten Lernplan entfernen.',
);

assertIncludes(
  'wissenpur/src/services/learningPlanService.ts',
  learningPlan,
  'isLocalAccountDataReadable()',
  'Lernpläne dürfen nur im passenden Kontokontext gelesen werden.',
);
assertIncludes(
  'wissenpur/src/services/learningPlanService.ts',
  learningPlan,
  'prepareLocalAccountDataForWrite();',
  'Lernpläne müssen vor lokalen Schreibvorgängen den Kontokontext vorbereiten.',
);

for (const [file, content] of [
  ['wissenpur/src/firebase.ts', firebase],
  ['wissenpur/src/services/accountService.ts', accountService],
] as const) {
  assertIncludes(file, content, 'wissenpur_user_stats_owner', 'Logout und Kontolöschung müssen den lokalen Besitzer-Marker entfernen.');
  assertIncludes(file, content, 'wissenpur_learning_plan', 'Logout und Kontolöschung müssen den lokalen Lernplan entfernen.');
  assertIncludes(file, content, 'wissenpur_learning_history_v1', 'Logout und Kontolöschung müssen die lokale Lernanalyse entfernen.');
  assertIncludes(file, content, 'wissenpur_learning_history_owner_v1', 'Logout und Kontolöschung müssen auch den Besitzer der lokalen Lernanalyse entfernen.');
}

assertIncludes(
  'wissenpur/src/firebase.ts',
  firebase,
  "window.location.replace('/');",
  'Nach dem Logout muss der laufende React-Zustand durch eine saubere Navigation verworfen werden.',
);
assertIncludes(
  'wissenpur/src/components/AccountSessionBoundary.tsx',
  sessionBoundary,
  'shouldClearLocalAccountDataForTransition(previous, nextUid)',
  'Authwechsel müssen über die zentrale Session-Policy entschieden werden.',
);
assertIncludes(
  'wissenpur/src/components/AccountSessionBoundary.tsx',
  sessionBoundary,
  'const [authResolved, setAuthResolved] = useState(false);',
  'Kontoabhängige Oberflächen dürfen erst nach der ersten Firebase-Auth-Auflösung gerendert werden.',
);
assertIncludes(
  'wissenpur/src/components/AccountSessionBoundary.tsx',
  sessionBoundary,
  'if (!authResolved)',
  'Die Auth-Hydrierung muss die Produktoberfläche bis zur Auflösung sperren.',
);
assertIncludes(
  'wissenpur/src/components/AccountSessionBoundary.tsx',
  sessionBoundary,
  '<Fragment key={`${sessionKey}:${contentRevision}`}>',
  'Die vollständige Produktoberfläche muss bei Auth- und Bibliothekswechseln neu gemountet werden.',
);
assertIncludes(
  'wissenpur/src/components/LearningAnalyticsPanel.tsx',
  analyticsPanel,
  'shouldClearLocalAccountDataForTransition(previousIdentity, nextIdentity)',
  'Auch die lokale Lernanalyse muss dieselbe Gast-/Kontowechsel-Policy verwenden.',
);
assertIncludes(
  'wissenpur/src/main.tsx',
  main,
  '<AccountSessionBoundary>',
  'Die Produktionsoberfläche muss innerhalb der zentralen Kontositzungsgrenze laufen.',
);

if (failures.length > 0) {
  console.error('\nWissenPur-Kontoisolationsprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('Gastdaten-Übernahme, Konto-Isolation, Analyse-Löschung, Auth-Hydrierung, Authwechsel, Logout und Löschung geprüft.');
