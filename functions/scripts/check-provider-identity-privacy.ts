import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [
  firebaseService,
  economyStateCallable,
  firestoreRules,
  secureSubmit,
  economyCallables,
  avatarEquipCallable,
  legalPanel,
] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyStateCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/firestore.rules'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/secureSubmit.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCallables.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/avatarEquipCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LegalPanel.tsx'), 'utf8'),
]);

assert.doesNotMatch(
  firebaseService,
  /currentUser\.(?:displayName|photoURL)|cloudStats\.(?:displayName|photoURL)/,
  'Provider-Anzeigename/-Foto dürfen nicht aus Firebase Auth oder alten Cloudprofilen in den Lernprofil-Sync übernommen werden.',
);
assert.doesNotMatch(
  firebaseService,
  /displayName:\s*currentUser|photoURL:\s*currentUser/,
  'Provider-Identität darf nicht in users/{uid} gespiegelt werden.',
);

assert.match(economyStateCallable, /displayName: FieldValue\.delete\(\)/);
assert.match(economyStateCallable, /photoURL: FieldValue\.delete\(\)/);

const clientProfileRuleSection = firestoreRules.slice(
  firestoreRules.indexOf('function isValidClientProfile'),
  firestoreRules.indexOf('function isValidTrustedLeaderboard'),
);
assert.doesNotMatch(clientProfileRuleSection, /displayName|photoURL/,
  'Client-schreibbare Lernprofile dürfen keine Provider-Identitätsfelder erlauben.');

for (const [name, source] of [
  ['secureSubmit.ts', secureSubmit],
  ['economyCallables.ts', economyCallables],
  ['avatarEquipCallable.ts', avatarEquipCallable],
] as const) {
  assert.match(source, /userData\?\.customName/,
    `${name}: Öffentliche Identität darf einen bewusst gesetzten customName verwenden.`);
  assert.match(source, /'WissenPur-Nutzer'/,
    `${name}: Ohne customName muss ein neutraler öffentlicher Name verwendet werden.`);
  assert.doesNotMatch(source, /authToken|request\.auth\?\.token|userData\?\.displayName|tokenName|storedName/,
    `${name}: Provider-Anzeigenamen dürfen nicht automatisch öffentlich werden.`);
}

assert.match(
  legalPanel,
  /Provider-Anzeigename und Provider-Profilbild werden nicht als Lernprofilfelder in Firestore dupliziert/,
  'Die sichtbare Datenschutzerklärung muss die Provider-/Lernprofil-Trennung erklären.',
);

console.log('Provider-Identität bleibt in Firebase Auth; Lernprofil und Rangliste sind privacy-by-default getrennt.');
