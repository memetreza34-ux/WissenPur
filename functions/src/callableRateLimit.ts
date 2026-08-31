import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './database.js';
import { evaluateFixedWindowRate } from './rateLimitCore.js';

type RateBucket = 'global' | 'accountExport';

const rateLimitRetentionMs = 24 * 60 * 60 * 1000;

const RATE_BUCKETS: Record<RateBucket, {
  windowMs: number;
  maxActions: number;
  windowField: string;
  countField: string;
  updatedField: string;
  message: string;
}> = {
  global: {
    windowMs: 60 * 1000,
    maxActions: 120,
    windowField: 'globalCallWindowStartedAt',
    countField: 'globalCalls',
    updatedField: 'globalRateUpdatedAt',
    message: 'Zu viele geschützte Anfragen in kurzer Zeit.',
  },
  accountExport: {
    windowMs: 10 * 60 * 1000,
    maxActions: 5,
    windowField: 'accountExportWindowStartedAt',
    countField: 'accountExports',
    updatedField: 'accountExportRateUpdatedAt',
    message: 'Zu viele Datenexporte in kurzer Zeit.',
  },
};

const enforceBucket = async (
  uid: string,
  bucket: RateBucket,
  now = Date.now(),
): Promise<void> => {
  const config = RATE_BUCKETS[bucket];
  const rateLimitRef = db.collection('serverRateLimits').doc(uid);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimitRef);
    const data = snapshot.exists
      ? snapshot.data() as Record<string, unknown>
      : undefined;
    const previousWindow = data?.[config.windowField];
    const previousWindowMs = previousWindow instanceof Timestamp
      ? previousWindow.toMillis()
      : 0;
    const previousCountValue = data?.[config.countField];
    const previousCount = typeof previousCountValue === 'number'
      ? previousCountValue
      : 0;
    const decision = evaluateFixedWindowRate(
      previousWindowMs,
      previousCount,
      now,
      config.windowMs,
      config.maxActions,
    );

    if (!decision.allowed) {
      const retrySeconds = Math.max(1, Math.ceil(decision.retryAfterMs / 1000));
      throw new HttpsError(
        'resource-exhausted',
        `${config.message} Versuche es in ${retrySeconds} Sekunden erneut.`,
      );
    }

    transaction.set(rateLimitRef, {
      uid,
      [config.windowField]: Timestamp.fromMillis(decision.windowStartedAtMs),
      [config.countField]: decision.count,
      [config.updatedField]: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now + rateLimitRetentionMs),
    }, { merge: true });
  });
};

/**
 * Shared abuse/cost guard for normal authenticated callable endpoints.
 * The intentionally generous limit avoids affecting legitimate study flows.
 */
export const enforceGlobalCallableRateLimit = (
  uid: string,
  now = Date.now(),
): Promise<void> => enforceBucket(uid, 'global', now);

/**
 * Account exports can read several collections, so they have a much stricter
 * independent bucket. Account deletion intentionally does not use this bucket.
 */
export const enforceAccountExportRateLimit = (
  uid: string,
  now = Date.now(),
): Promise<void> => enforceBucket(uid, 'accountExport', now);
