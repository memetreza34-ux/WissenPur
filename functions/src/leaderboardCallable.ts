import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  EconomyDomainError,
  stringOrNull,
} from './economyCore.js';
import { logUnexpectedServerError } from './privacyLogger.js';

interface LeaderboardRequest {
  limit?: unknown;
}

interface PublicLeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
}

const parseLimit = (value: unknown): number => {
  if (value === undefined) return 10;
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new HttpsError('invalid-argument', 'Das Ranglistenlimit ist ungültig.');
  }
  return Math.min(100, Math.max(1, value));
};

const safeAvatar = (value: unknown): string => {
  const candidate = stringOrNull(value, 1_000);
  if (!candidate) return '';
  return /^\/avatars\/[a-z0-9-]+\.svg$/i.test(candidate) ? candidate : '';
};

const sanitizeEntry = (
  documentId: string,
  value: Record<string, unknown>,
): PublicLeaderboardEntry | null => {
  const uid = stringOrNull(value.uid, 128);
  const displayName = stringOrNull(value.displayName, 100);
  const totalPoints = value.totalPoints;

  if (
    !uid ||
    uid !== documentId ||
    !displayName ||
    value.economyVersion !== 1 ||
    typeof totalPoints !== 'number' ||
    !Number.isInteger(totalPoints) ||
    totalPoints < 0 ||
    totalPoints > 100_000_000
  ) {
    return null;
  }

  return {
    uid,
    displayName,
    photoURL: safeAvatar(value.photoURL),
    totalPoints,
  };
};

/**
 * Public leaderboard reads flow through a callable instead of a browser
 * Firestore collection query. This keeps the response schema minimal and lets
 * Firestore rules deny list/enumeration access to trustedLeaderboard.
 */
export const getTrustedLeaderboard = onCall<LeaderboardRequest>(
  { enforceAppCheck },
  async (request: CallableRequest<LeaderboardRequest>) => {
    try {
      const uid = request.auth?.uid;
      if (uid) await enforceGlobalCallableRateLimit(uid);

      const requestedLimit = parseLimit(request.data?.limit);
      // Fetch a little extra so malformed historical rows can be skipped
      // without exposing them or unexpectedly returning an empty list.
      const fetchLimit = Math.min(200, requestedLimit * 2);
      const snapshot = await db
        .collection('trustedLeaderboard')
        .orderBy('totalPoints', 'desc')
        .limit(fetchLimit)
        .get();

      const entries: PublicLeaderboardEntry[] = [];
      for (const document of snapshot.docs) {
        const entry = sanitizeEntry(
          document.id,
          document.data() as Record<string, unknown>,
        );
        if (!entry) continue;
        entries.push(entry);
        if (entries.length >= requestedLimit) break;
      }

      return { entries };
    } catch (error) {
      if (error instanceof HttpsError || error instanceof EconomyDomainError) throw error;
      logUnexpectedServerError('Failed to read trusted leaderboard', error);
      throw new HttpsError('internal', 'Die Rangliste konnte nicht sicher geladen werden.');
    }
  },
);
