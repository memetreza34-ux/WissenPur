import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const legalPanel = await readFile(
  resolve(repoRoot, 'wissenpur/src/components/LegalPanel.tsx'),
  'utf8',
);

assert.doesNotMatch(
  legalPanel,
  /Externe Bildquellen können beim Anzeigen einzelner Lerninhalte/i,
  'Die sichtbare Datenschutzerklärung darf den entfernten Remote-Bildpfad nicht wieder behaupten.',
);
assert.match(
  legalPanel,
  /Lern-, Shop- und Ranglistenbilder werden im Releasepfad ausschließlich aus derselben App-Origin ausgeliefert/,
  'Die sichtbare Datenschutzerklärung muss same-origin Lern-/Avatarassets dokumentieren.',
);
assert.match(
  legalPanel,
  /Aktive Ranked-Quiz-Sitzungen laufen technisch nach ungefähr 30 Minuten ab/,
  'Der sichtbare Retention-Hinweis muss den tatsächlichen Ranked-Session-Ablauf nennen.',
);
assert.match(
  legalPanel,
  /physische Löschung erfolgt anschließend über die konfigurierte Firestore-TTL/,
  'Der sichtbare Retention-Hinweis muss Ablauf und asynchrone TTL-Löschung unterscheiden.',
);
assert.match(
  legalPanel,
  /enthalten keine UID, E-Mail, Session-ID, Fragentexte oder Request-Payloads/,
  'Die sichtbare Datenschutzerklärung muss das datensparsame Functions-Logging korrekt beschreiben.',
);
assert.match(
  legalPanel,
  /Provider-Anzeigename und Provider-Profilbild werden nicht als Lernprofilfelder in Firestore dupliziert/,
  'Die sichtbare Datenschutzerklärung muss die Trennung zwischen Firebase Auth und Lernprofil erklären.',
);

console.log('Sichtbare Datenschutz-/Retention-Kopie stimmt mit der Release-Architektur überein.');
