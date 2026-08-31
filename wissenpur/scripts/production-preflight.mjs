import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PLACEHOLDER_PATTERN = /(todo|replace|muster|beispiel|dein[_ -]|example\.|example@|xxx)/i;
const EXPECTED_FIRESTORE_TTL_CONFIRMATION = 'quizSessions.expiresAt,serverRateLimits.expiresAt';
const MIN_AI_RATE_LIMIT_RPM = 1;
const MAX_AI_RATE_LIMIT_RPM = 20;

const parseEnvText = (text) => {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
};

const loadReleaseEnvironment = (cwd, baseEnv = process.env) => {
  const env = { ...baseEnv };
  const protectedKeys = new Set(Object.keys(baseEnv));
  const envFiles = ['.env', '.env.production', '.env.local', '.env.production.local'];

  for (const filename of envFiles) {
    const filepath = resolve(cwd, filename);
    if (!existsSync(filepath)) continue;

    for (const [key, value] of Object.entries(parseEnvText(readFileSync(filepath, 'utf8')))) {
      if (!protectedKeys.has(key)) env[key] = value;
    }
  }

  return env;
};

const readJson = (filepath) => JSON.parse(readFileSync(filepath, 'utf8'));
const text = (value) => String(value || '').trim();
const isTrue = (value) => text(value).toLowerCase() === 'true';

export const validateProductionTarget = ({ env, firebaseConfig, firebaseRc }) => {
  const errors = [];
  const targetProjectId = text(env.RELEASE_PRODUCTION_FIREBASE_PROJECT_ID);
  const expectedProjectId = text(env.RELEASE_EXPECTED_FIREBASE_PROJECT_ID);
  const configuredProjectId = text(firebaseConfig?.projectId);
  const productionAlias = text(firebaseRc?.projects?.production);
  const confirmation = text(env.RELEASE_PRODUCTION_CONFIRMATION);
  const expectedConfirmation = targetProjectId
    ? `PRODUCTION:${targetProjectId}:RELEASE`
    : '';
  const aiRateLimitRpm = Number(text(env.RELEASE_AI_RATE_LIMIT_RPM));

  if (!targetProjectId || PLACEHOLDER_PATTERN.test(targetProjectId)) {
    errors.push('RELEASE_PRODUCTION_FIREBASE_PROJECT_ID muss die echte Produktions-Projekt-ID enthalten.');
  }
  if (!expectedProjectId || PLACEHOLDER_PATTERN.test(expectedProjectId)) {
    errors.push('RELEASE_EXPECTED_FIREBASE_PROJECT_ID muss die echte Produktions-Projekt-ID enthalten.');
  }
  if (!productionAlias) {
    errors.push('In .firebaserc fehlt der explizite Alias projects.production.');
  }
  if (targetProjectId && /^(demo|test|emulator|sandbox)[-_]/i.test(targetProjectId)) {
    errors.push('Demo-, Test-, Emulator- oder Sandbox-Projekte dürfen nicht als Produktionsziel verwendet werden.');
  }
  if (targetProjectId && configuredProjectId && targetProjectId !== configuredProjectId) {
    errors.push(`Produktionsziel ${targetProjectId} stimmt nicht mit firebase-applet-config.json (${configuredProjectId}) überein.`);
  }
  if (targetProjectId && expectedProjectId && targetProjectId !== expectedProjectId) {
    errors.push(`Produktionsziel ${targetProjectId} stimmt nicht mit RELEASE_EXPECTED_FIREBASE_PROJECT_ID (${expectedProjectId}) überein.`);
  }
  if (targetProjectId && productionAlias && targetProjectId !== productionAlias) {
    errors.push(`projects.production zeigt auf ${productionAlias}, erwartet wird ${targetProjectId}.`);
  }
  if (!isTrue(env.RELEASE_DEPLOYMENT_REVIEW_CONFIRMED)) {
    errors.push('RELEASE_DEPLOYMENT_REVIEW_CONFIRMED=true muss die konkrete Produktionsfreigabe bestätigen.');
  }
  if (!expectedConfirmation || confirmation !== expectedConfirmation) {
    errors.push(`RELEASE_PRODUCTION_CONFIRMATION muss exakt ${expectedConfirmation || 'PRODUCTION:<PROJECT_ID>:RELEASE'} lauten.`);
  }
  if (text(env.VITE_FIRESTORE_DATABASE_ID) !== '(default)') {
    errors.push('Produktion muss die Firestore-Datenbank (default) verwenden.');
  }
  if (text(env.RELEASE_FIRESTORE_TTL_CONFIRMATION) !== EXPECTED_FIRESTORE_TTL_CONFIRMATION) {
    errors.push(`RELEASE_FIRESTORE_TTL_CONFIRMATION muss nach aktivierter Firestore-TTL exakt ${EXPECTED_FIRESTORE_TTL_CONFIRMATION} lauten.`);
  }
  if (isTrue(env.VITE_ENABLE_APPCHECK_DEBUG)) {
    errors.push('App-Check-Debugmodus ist für Produktion verboten.');
  }
  if (isTrue(env.VITE_USE_FUNCTIONS_EMULATOR)) {
    errors.push('Functions-Emulator ist für Produktion verboten.');
  }

  if (!isTrue(env.RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED)) {
    errors.push('RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED=true muss bestätigen, dass Firebase AI Logic nur authentifizierte Nutzer akzeptiert.');
  }
  if (
    !Number.isInteger(aiRateLimitRpm) ||
    aiRateLimitRpm < MIN_AI_RATE_LIMIT_RPM ||
    aiRateLimitRpm > MAX_AI_RATE_LIMIT_RPM
  ) {
    errors.push(
      `RELEASE_AI_RATE_LIMIT_RPM muss das real konfigurierte Firebase-AI-Logic-Limit als ganze Zahl zwischen ${MIN_AI_RATE_LIMIT_RPM} und ${MAX_AI_RATE_LIMIT_RPM} enthalten.`,
    );
  }
  if (!isTrue(env.RELEASE_AI_MONITORING_CONFIRMED)) {
    errors.push('RELEASE_AI_MONITORING_CONFIRMED=true muss die aktivierte AI-Logic-Überwachung bestätigen.');
  }
  if (!isTrue(env.RELEASE_BUDGET_GUARDS_CONFIRMED)) {
    errors.push('RELEASE_BUDGET_GUARDS_CONFIRMED=true muss Budgetwarnungen und den vorgesehenen Kostenschutz bestätigen.');
  }

  const publicAppUrl = text(env.VITE_PUBLIC_APP_URL);
  if (publicAppUrl && /localhost|127\.0\.0\.1|\.local(?=[:/]|$)/i.test(publicAppUrl)) {
    errors.push('Die öffentliche Produktions-URL darf nicht auf localhost oder eine lokale Domain zeigen.');
  }

  return errors;
};

const runSelfTest = () => {
  const env = {
    RELEASE_PRODUCTION_FIREBASE_PROJECT_ID: 'wissenpur-prod',
    RELEASE_EXPECTED_FIREBASE_PROJECT_ID: 'wissenpur-prod',
    RELEASE_PRODUCTION_CONFIRMATION: 'PRODUCTION:wissenpur-prod:RELEASE',
    RELEASE_DEPLOYMENT_REVIEW_CONFIRMED: 'true',
    RELEASE_FIRESTORE_TTL_CONFIRMATION: EXPECTED_FIRESTORE_TTL_CONFIRMATION,
    RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED: 'true',
    RELEASE_AI_RATE_LIMIT_RPM: '10',
    RELEASE_AI_MONITORING_CONFIRMED: 'true',
    RELEASE_BUDGET_GUARDS_CONFIRMED: 'true',
    VITE_FIRESTORE_DATABASE_ID: '(default)',
    VITE_ENABLE_APPCHECK_DEBUG: 'false',
    VITE_USE_FUNCTIONS_EMULATOR: 'false',
    VITE_PUBLIC_APP_URL: 'https://wissenpur.example.org',
  };
  const firebaseConfig = { projectId: 'wissenpur-prod' };
  const firebaseRc = { projects: { production: 'wissenpur-prod', dev: 'wissenpur-dev' } };

  assert.deepEqual(validateProductionTarget({ env, firebaseConfig, firebaseRc }), []);
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_PRODUCTION_CONFIRMATION: 'yes' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_PRODUCTION_CONFIRMATION')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_FIRESTORE_TTL_CONFIRMATION: '' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_FIRESTORE_TTL_CONFIRMATION')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED: 'false' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_AI_RATE_LIMIT_RPM: '100' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_AI_RATE_LIMIT_RPM')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_AI_MONITORING_CONFIRMED: 'false' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_AI_MONITORING_CONFIRMED')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_BUDGET_GUARDS_CONFIRMED: 'false' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('RELEASE_BUDGET_GUARDS_CONFIRMED')),
  );
  assert.ok(
    validateProductionTarget({
      env,
      firebaseConfig,
      firebaseRc: { projects: { dev: 'wissenpur-dev' } },
    }).some((error) => error.includes('projects.production')),
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, RELEASE_PRODUCTION_FIREBASE_PROJECT_ID: 'other-project' },
      firebaseConfig,
      firebaseRc,
    }).length >= 2,
  );
  assert.ok(
    validateProductionTarget({
      env: { ...env, VITE_USE_FUNCTIONS_EMULATOR: 'true' },
      firebaseConfig,
      firebaseRc,
    }).some((error) => error.includes('Functions-Emulator')),
  );

  console.log('Produktions-Preflight-Selbsttest erfolgreich.');
};

if (process.argv.includes('--self-test')) {
  runSelfTest();
  process.exit(0);
}

const cwd = process.cwd();
const env = loadReleaseEnvironment(cwd);
let firebaseConfig;
let firebaseRc;
const errors = [];

try {
  firebaseConfig = readJson(resolve(cwd, 'firebase-applet-config.json'));
} catch {
  errors.push('firebase-applet-config.json fehlt oder ist ungültig.');
}

try {
  firebaseRc = readJson(resolve(cwd, '..', '.firebaserc'));
} catch {
  errors.push('../.firebaserc fehlt oder ist ungültig.');
}

if (firebaseConfig && firebaseRc) {
  errors.push(...validateProductionTarget({ env, firebaseConfig, firebaseRc }));
}

if (errors.length > 0) {
  console.error('\nWissenPur-Produktions-Preflight wurde blockiert:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nDer Preflight nimmt keine Deployments oder Löschungen vor. Korrigiere zuerst die Produktionsfreigaben.\n');
  process.exit(1);
}

const baseCheck = spawnSync(process.execPath, ['scripts/check-release-env.mjs'], {
  cwd,
  env,
  encoding: 'utf8',
  stdio: 'inherit',
});

if (baseCheck.status !== 0) {
  process.exit(baseCheck.status ?? 1);
}

console.log(`Produktionsziel ${env.RELEASE_PRODUCTION_FIREBASE_PROJECT_ID} ist für den Release-Build freigegeben.`);
console.log(`Firebase AI Logic: authenticated-users mode bestätigt, per-user Limit ${env.RELEASE_AI_RATE_LIMIT_RPM} RPM.`);
console.log('Es wurde nichts deployed, migriert oder gelöscht.');
