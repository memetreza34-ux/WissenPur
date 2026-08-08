import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  normalizePublicLeaderboardLimit,
  selectPublicLeaderboardEntries,
} from './leaderboardPublicCore.js';
import { logUnexpectedServerError } from './privacyLogger.js';

interface LeaderboardRequest {
  limit?: unknown;
}

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

      const requestedLimit = normalizePublicLeaderboardLimit(request.data?.limit);
      if (requestedLimit === null) {
        throw new HttpsError('invalid-argument', 'Das Ranglistenlimit ist ungültig.');
      }

      // Fetch a little extra so malformed historical rows can be skipped
      // without exposing them or unexpectedly returning an empty list.
      const fetchLimit = Math.min(200, requestedLimit * 2);
      const snapshot = await db
        .collection('trustedLeaderboard')
        .orderBy('totalPoints', 'desc')
        .limit(fetchLimit)
        .get();

      const entries = selectPublicLeaderboardEntries(
        snapshot.docs.map((document) => ({
          id: document.id,
          data: document.data() as Record<string, unknown>,
        })),
        requestedLimit,
      );

      return { entries };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logUnexpectedServerError('Failed to read trusted leaderboard', error);
      throw new HttpsError('internal', 'Die Rangliste konnte nicht sicher geladen werden.');
    }
  },
);
