import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fail = (message) => {
  console.error(`Hosting-Rollback-Plan blockiert: ${message}`);
  process.exit(1);
};

const clean = (value) => String(value || '').trim();
const project = clean(process.env.RELEASE_PRODUCTION_FIREBASE_PROJECT_ID);
const site = clean(process.env.RELEASE_HOSTING_SITE);
const siteConfirmation = clean(process.env.RELEASE_HOSTING_SITE_CONFIRMATION);
const channel = clean(process.env.RELEASE_HOSTING_ROLLBACK_CHANNEL);
const confirmation = clean(process.env.RELEASE_HOSTING_ROLLBACK_CONFIRMATION);
const reviewConfirmed = clean(process.env.RELEASE_DEPLOYMENT_REVIEW_CONFIRMED).toLowerCase() === 'true';

const validate = ({ projectId, siteId, siteConfirm, rollbackChannel, phrase, reviewed, productionAlias }) => {
  const errors = [];
  if (!/^[a-z0-9][a-z0-9-]{4,29}$/i.test(projectId)) errors.push('gültige Produktions-Projekt-ID fehlt');
  if (!/^[a-z0-9][a-z0-9-]{2,62}$/i.test(siteId)) errors.push('gültige Hosting-Site-ID fehlt');
  if (siteConfirm !== siteId) errors.push('Hosting-Site wurde nicht identisch doppelt bestätigt');
  if (!/^rollback-[a-z0-9][a-z0-9-]{2,40}$/i.test(rollbackChannel)) errors.push('Rollback-Channel muss mit rollback- beginnen');
  if (productionAlias !== projectId) errors.push('.firebaserc projects.production stimmt nicht mit dem Zielprojekt überein');
  if (!reviewed) errors.push('Deployment-Review ist nicht bestätigt');
  const expected = `ROLLBACK:${projectId}:${siteId}:${rollbackChannel}`;
  if (phrase !== expected) errors.push(`Bestätigungsphrase muss exakt ${expected} lauten`);
  return errors;
};

if (process.argv.includes('--self-test')) {
  const valid = validate({
    projectId: 'wissenpur-prod-123',
    siteId: 'wissenpur-app',
    siteConfirm: 'wissenpur-app',
    rollbackChannel: 'rollback-before-release',
    phrase: 'ROLLBACK:wissenpur-prod-123:wissenpur-app:rollback-before-release',
    reviewed: true,
    productionAlias: 'wissenpur-prod-123',
  });
  if (valid.length) fail(`Selbsttest hätte gültig sein müssen: ${valid.join(', ')}`);
  const invalid = validate({
    projectId: 'wissenpur-prod-123',
    siteId: 'wissenpur-app',
    siteConfirm: 'other-site',
    rollbackChannel: 'live',
    phrase: 'yes',
    reviewed: false,
    productionAlias: 'other-project',
  });
  if (invalid.length < 4) fail('Selbsttest hat unsichere Eingaben nicht ausreichend blockiert.');
  console.log('Hosting-Rollback-Planer-Selbsttest erfolgreich.');
  process.exit(0);
}

let firebaserc;
try {
  firebaserc = JSON.parse(readFileSync(resolve(process.cwd(), '../.firebaserc'), 'utf8'));
} catch {
  fail('.firebaserc fehlt oder ist ungültig.');
}

const productionAlias = clean(firebaserc?.projects?.production);
const errors = validate({
  projectId: project,
  siteId: site,
  siteConfirm: siteConfirmation,
  rollbackChannel: channel,
  phrase: confirmation,
  reviewed: reviewConfirmed,
  productionAlias,
});
if (errors.length) fail(errors.join('; '));

const q = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const sourceLive = `${site}:live`;
const rollbackTarget = `${site}:${channel}`;

console.log('\nWissenPur Hosting Rollback-Plan – es wird NICHTS ausgeführt.\n');
console.log('1. Aktuellen Live-Stand in einen Rollback-Channel klonen:');
console.log(`firebase hosting:clone ${q(sourceLive)} ${q(rollbackTarget)} --project ${q(project)}`);
console.log('\n2. Erst nach erfolgreichem Release-Build den neuen Hosting-Stand deployen:');
console.log(`firebase deploy --only hosting --project ${q(project)}`);
console.log('\n3. Falls ein Rollback nötig ist, den Snapshot zurück nach live klonen:');
console.log(`firebase hosting:clone ${q(rollbackTarget)} ${q(sourceLive)} --project ${q(project)}`);
console.log('\n4. Nach bestätigter Stabilität den temporären Channel kontrolliert entfernen:');
console.log(`firebase hosting:channel:delete ${q(channel)} --site ${q(site)} --project ${q(project)}`);
console.log('\nDieser Planer hat keine Firebase-Kommandos ausgeführt.\n');
