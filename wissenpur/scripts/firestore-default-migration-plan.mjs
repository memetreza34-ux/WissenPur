import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const clean = (value) => String(value || '').trim();
const fail = (message) => {
  console.error(`Firestore-Migrationsplan blockiert: ${message}`);
  process.exit(1);
};

const validate = ({ project, alias, source, sourceConfirm, target, bucket, targetEmpty, phrase, reviewed }) => {
  const errors = [];
  if (!/^[a-z0-9][a-z0-9-]{4,29}$/i.test(project)) errors.push('gültige Produktions-Projekt-ID fehlt');
  if (alias !== project) errors.push('.firebaserc projects.production stimmt nicht mit dem Zielprojekt überein');
  if (!source || source === '(default)' || !/^[a-z0-9][a-z0-9-]{2,62}$/i.test(source)) errors.push('benannte Quell-Datenbank fehlt oder ist ungültig');
  if (sourceConfirm !== source) errors.push('Quell-Datenbank wurde nicht identisch doppelt bestätigt');
  if (target !== '(default)') errors.push('Zieldatenbank muss exakt (default) sein');
  if (!/^gs:\/\/[a-z0-9][a-z0-9._-]+\/wissenpur-migration\/[a-zA-Z0-9._/-]+$/.test(bucket)) errors.push('GCS-Pfad muss unter gs://.../wissenpur-migration/... liegen');
  if (!targetEmpty) errors.push('kontrolliert leere (default)-Zieldatenbank wurde nicht bestätigt');
  if (!reviewed) errors.push('Deployment-/Migrationsreview ist nicht bestätigt');
  const expected = `MIGRATE:${project}:${source}:(default)`;
  if (phrase !== expected) errors.push(`Bestätigungsphrase muss exakt ${expected} lauten`);
  return errors;
};

if (process.argv.includes('--self-test')) {
  const valid = validate({
    project: 'wissenpur-prod-123', alias: 'wissenpur-prod-123', source: 'legacy-db', sourceConfirm: 'legacy-db',
    target: '(default)', bucket: 'gs://wissenpur-backups/wissenpur-migration/2026-08-26', targetEmpty: true,
    phrase: 'MIGRATE:wissenpur-prod-123:legacy-db:(default)', reviewed: true,
  });
  if (valid.length) fail(`Selbsttest hätte gültig sein müssen: ${valid.join(', ')}`);
  const unsafe = validate({
    project: 'wissenpur-prod-123', alias: 'other', source: '(default)', sourceConfirm: 'other', target: 'named',
    bucket: 'gs://wrong', targetEmpty: false, phrase: 'yes', reviewed: false,
  });
  if (unsafe.length < 6) fail('Selbsttest hat unsichere Migrationseingaben nicht blockiert.');
  console.log('Firestore-(default)-Migrationsplaner-Selbsttest erfolgreich.');
  process.exit(0);
}

let firebaserc;
try { firebaserc = JSON.parse(readFileSync(resolve(process.cwd(), '../.firebaserc'), 'utf8')); }
catch { fail('.firebaserc fehlt oder ist ungültig.'); }

const project = clean(process.env.RELEASE_PRODUCTION_FIREBASE_PROJECT_ID);
const source = clean(process.env.RELEASE_FIRESTORE_SOURCE_DATABASE_ID);
const sourceConfirm = clean(process.env.RELEASE_FIRESTORE_SOURCE_DATABASE_CONFIRMATION);
const target = clean(process.env.VITE_FIRESTORE_DATABASE_ID);
const bucket = clean(process.env.RELEASE_FIRESTORE_MIGRATION_GCS_PATH);
const targetEmpty = clean(process.env.RELEASE_FIRESTORE_DEFAULT_EMPTY_CONFIRMED).toLowerCase() === 'true';
const reviewed = clean(process.env.RELEASE_DEPLOYMENT_REVIEW_CONFIRMED).toLowerCase() === 'true';
const phrase = clean(process.env.RELEASE_FIRESTORE_MIGRATION_CONFIRMATION);
const alias = clean(firebaserc?.projects?.production);
const errors = validate({ project, alias, source, sourceConfirm, target, bucket, targetEmpty, phrase, reviewed });
if (errors.length) fail(errors.join('; '));

const q = (value) => `'${value.replaceAll("'", "'\\''")}'`;
console.log('\nWissenPur Firestore-Migrationsplan – es wird NICHTS ausgeführt.\n');
console.log('1. Benannte Quell-Datenbank per Managed Export sichern:');
console.log(`gcloud firestore export ${q(bucket)} --database=${q(source)} --project=${q(project)}`);
console.log('\n2. Export vollständig prüfen und erst danach in die bestätigte leere (default)-Datenbank importieren:');
console.log(`gcloud firestore import ${q(bucket)} --database=${q('(default)')} --project=${q(project)}`);
console.log('\n3. Danach Rules/Indexes deployen, Datenmengen vergleichen und Zwei-Konto-Smokes ausführen.');
console.log('\nDieser Planer hat weder Export noch Import noch sonstige Firebase-/GCloud-Kommandos ausgeführt.\n');
