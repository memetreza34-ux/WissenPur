import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './database.js';
import { evaluateFixedWindowRate } from './rateLimitCore.js';

const globalWindowMs = 60 * 1000;
const maxGlobalCallsPerWindow = 120;

/**
 * Shared abuse/cost guard for authenticated callable endpoints.
 *
 * This intentionally lives in the existing top-level serverRateLimits/{uid}
 * document so account export/deletion can still discover and delete all
 * rate-limit metadata without orphaned subcollections.
 */
export const enforceGlobalCallableRateLimit = async (
  uid: string,
  now = Date.now(),
): Promise<void> => {
  const rateLimitRef = db.collection('serverRateLimits').doc(uid);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimitRef);
    const data = snapshot.exists
      ? snapshot.data() as Record<string, unknown>
      : undefined;
    const previousWindow = data?.globalCallWindowStartedAt;
    const previousWindowMs = previousWindow instanceof Timestamp
      ? previousWindow.toMillis()
      : 0;
    const previousCount = typeof data?.globalCalls === 'number'
      ? data.globalCalls
      : 0;
    const decision = evaluateFixedWindowRate(
      previousWindowMs,
      previousCount,
      now,
      globalWindowMs,
      maxGlobalCallsPerWindow,
    );

    if (!decision.allowed) {
      const retrySeconds = Math.max(1, Math.ceil(decision.retryAfterMs / 1000));
      throw new HttpsError(
        'resource-exhausted',
        `Zu viele geschützte Anfragen in kurzer Zeit. Versuche es in ${retrySeconds} Sekunden erneut.`,
      );
    }

    transaction.set(rateLimitRef, {
      uid,
      globalCallWindowStartedAt: Timestamp.fromMillis(decision.windowStartedAtMs),
      globalCalls: decision.count,
      globalRateUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
};
