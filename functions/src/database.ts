import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({
  region: 'europe-west1',
  memory: '256MiB',
  timeoutSeconds: 30,
  maxInstances: 10,
});

export const firebaseApp = getApps()[0] ?? initializeApp();

const isFunctionsEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
const configuredDatabaseId = process.env.FIRESTORE_DATABASE_ID?.trim();
const namedDatabaseId = configuredDatabaseId && configuredDatabaseId !== '(default)'
  ? configuredDatabaseId
  : null;

if (!isFunctionsEmulator && namedDatabaseId) {
  throw new Error(
    'Production Functions must use Firestore (default). Named databases are allowed only in the local emulator.',
  );
}

/**
 * Production always uses Firestore `(default)`. A named database can be
 * selected only while the Functions emulator is running for isolated tests.
 */
export const db = isFunctionsEmulator && namedDatabaseId
  ? getFirestore(firebaseApp, namedDatabaseId)
  : getFirestore(firebaseApp);

/**
 * App Check cannot be disabled in a deployed Cloud Functions runtime. Local
 * emulator sessions may opt out explicitly when no debug token is available.
 */
export const enforceAppCheck = !isFunctionsEmulator ||
  process.env.ENFORCE_APP_CHECK !== 'false';
