import { FieldValue } from 'firebase-admin/firestore';
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  berlinDateKey,
  normalizeEconomy,
  toPublicEconomy,
} from './economyCore.js';
import { logUnexpectedServerError } from './privacyLogger.js';

function requireUser(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      'unauthenticated',
      'Bitte melde dich an, um deinen Online-Fortschritt zu laden.',
    );
  }
  return uid;
}

/**
 * Returns the server-authoritative economy state for the signed-in account.
 *
 * Every new authenticated browser session passes through normalizeEconomy().
 * This applies daily/weekly resets consistently and discards legacy/client-
 * writable economy values instead of trusting them in the browser.
 */
export const getMyEconomyState = onCall(
  { enforceAppCheck },
  async (request) => {
    const uid = requireUser(request);

    try {
      await enforceGlobalCallableRateLimit(uid);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();
      const stats = await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(userRef);
        const userData = snapshot.exists
          ? snapshot.data() as Record<string, unknown>
          : undefined;
        const state = normalizeEconomy(userData, today);
        const publicState = toPublicEconomy(state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          // Provider identity remains in Firebase Authentication. Do not
          // duplicate it into the learning-profile document; remove historical
          // copies lazily whenever an authenticated session hydrates.
          displayName: FieldValue.delete(),
          photoURL: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return publicState;
      });

      return { stats };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logUnexpectedServerError('Failed to hydrate authoritative economy state', error);
      throw new HttpsError(
        'internal',
        'Der sichere Online-Fortschritt konnte nicht geladen werden.',
      );
    }
  },
);
