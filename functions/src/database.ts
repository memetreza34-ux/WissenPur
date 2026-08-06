import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const firebaseApp = getApps()[0] ?? initializeApp();

const configuredDatabaseId = process.env.FIRESTORE_DATABASE_ID?.trim();

/**
 * Production uses Firestore `(default)`. Named databases are only selected
 * when an explicit non-default ID is provided for isolated development or a
 * controlled migration.
 */
export const db = configuredDatabaseId && configuredDatabaseId !== '(default)'
  ? getFirestore(firebaseApp, configuredDatabaseId)
  : getFirestore(firebaseApp);

export const enforceAppCheck = process.env.ENFORCE_APP_CHECK !== 'false';
