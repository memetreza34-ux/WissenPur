import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { db, enforceAppCheck } from './database.js';
import {
  berlinDateKey,
  normalizeEconomy,
  toPublicEconomy,
} from './economyCore.js';

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
    const userRef = db.collection('users').doc(uid);
    const today = berlinDateKey();

    try {
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
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return publicState;
      });

      return { stats };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to hydrate authoritative economy state', error);
      throw new HttpsError(
        'internal',
        'Der sichere Online-Fortschritt konnte nicht geladen werden.',
      );
    }
  },
);
