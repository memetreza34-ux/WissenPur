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
 * Legacy/user-writable economy documents are never migrated by trusting their
 * values. If economyVersion is missing or outdated, normalizeEconomy() starts
 * from the server defaults and this callable persists that trusted baseline.
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

        if (!userData || userData.economyVersion !== state.economyVersion) {
          transaction.set(userRef, {
            uid,
            ...publicState,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        return publicState;
      });

      return { stats };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error('Failed to hydrate authoritative economy state', { uid, error });
      throw new HttpsError(
        'internal',
        'Der sichere Online-Fortschritt konnte nicht geladen werden.',
      );
    }
  },
);
