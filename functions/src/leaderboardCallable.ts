import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  getEffectivePublicLeaderboardLimit,
  normalizePublicLeaderboardLimit,
  sanitizePublicLeaderboardAvatar as safeAvatar,
  sanitizePublicLeaderboardEntry as sanitizeEntry,
  type PublicLeaderboardEntry,
} from './leaderboardPublicCore.js';
import { logUnexpectedServerError } from './privacyLogger.js';

interface LeaderboardRequest {
  limit?: unknown;
}

interface LeaderboardCache {
  expiresAt: number;
  sourceLimit: number;
  entries: PublicLeaderboardEntry[];
}

const PUBLIC_CACHE_TTL_MS = 15_000;
let publicLeaderboardCache: LeaderboardCache | null = null;

const readSanitizedLeaderboard = async (
  fetchLimit: number,
): Promise<PublicLeaderboardEntry[]> => {
  const now = Date.now();
  if (
    publicLeaderboardCache &&
    publicLeaderboardCache.expiresAt > now &&
    publicLeaderboardCache.sourceLimit >= fetchLimit
  ) {
    return publicLeaderboardCache.entries;
  }

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

    // Defense in depth: the pure entry sanitizer already performs this
    // normalization; keep the transport boundary explicitly same-origin.
    entry.photoURL = safeAvatar(entry.photoURL);
    entries.push(entry);
  }

  publicLeaderboardCache = {
    expiresAt: now + PUBLIC_CACHE_TTL_MS,
    sourceLimit: fetchLimit,
    entries,
  };
  return entries;
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

      const normalizedLimit = normalizePublicLeaderboardLimit(request.data?.limit);
      if (normalizedLimit === null) {
        throw new HttpsError('invalid-argument', 'Das Ranglistenlimit ist ungültig.');
      }
      const requestedLimit = getEffectivePublicLeaderboardLimit(normalizedLimit, Boolean(uid));

      // Fetch a little extra so malformed historical rows can be skipped.
      // Guests are capped more tightly and all callers benefit from a short
      // per-instance public cache without storing IP addresses or account IDs.
      const fetchLimit = Math.min(200, requestedLimit * 2);
      const entries = (await readSanitizedLeaderboard(fetchLimit)).slice(0, requestedLimit);

      return { entries };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logUnexpectedServerError('Failed to read trusted leaderboard', error);
      throw new HttpsError('internal', 'Die Rangliste konnte nicht sicher geladen werden.');
    }
  },
);
