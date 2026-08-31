import { FieldValue } from 'firebase-admin/firestore';
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { equipAvatarItem } from './avatarEquipCore.js';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  berlinDateKey,
  EconomyDomainError,
  normalizeEconomy,
  stringOrNull,
  toPublicEconomy,
} from './economyCore.js';
import { logUnexpectedServerError } from './privacyLogger.js';

interface EquipAvatarRequest {
  avatarId?: unknown;
}

const requireUser = (request: CallableRequest<unknown>): string => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Bitte melde dich an, um deinen Avatar zu ändern.');
  }
  return uid;
};

const requireAvatarId = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', 'Die Avatar-ID ist ungültig.');
  }
  const avatarId = value.trim();
  if (!avatarId || avatarId.length > 50) {
    throw new HttpsError('invalid-argument', 'Die Avatar-ID ist ungültig.');
  }
  return avatarId;
};

const safeLocalAvatar = (value: unknown): string => {
  const candidate = stringOrNull(value, 1_000);
  if (!candidate) return '';
  return /^\/avatars\/[a-z0-9-]+\.svg$/i.test(candidate) ? candidate : '';
};

const publicLeaderboardProfile = (
  uid: string,
  userData: Record<string, unknown> | undefined,
  customPhotoURL: unknown,
  totalPoints: number,
  economyVersion: number,
) => ({
  uid,
  // Public identity is opt-in through the app-specific customName only.
  displayName: stringOrNull(userData?.customName, 100) || 'WissenPur-Nutzer',
  photoURL: safeLocalAvatar(customPhotoURL),
  totalPoints,
  economyVersion,
  updatedAt: FieldValue.serverTimestamp(),
});

const toHttpsError = (error: unknown): HttpsError => {
  if (error instanceof HttpsError) return error;
  if (error instanceof EconomyDomainError) return new HttpsError(error.code, error.message);
  logUnexpectedServerError('Unexpected avatar equip error', error);
  return new HttpsError('internal', 'Der Avatar konnte nicht sicher geändert werden.');
};

export const equipShopAvatar = onCall<EquipAvatarRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      await enforceGlobalCallableRateLimit(uid);
      const avatarId = requireAvatarId(request.data.avatarId);
      const userRef = db.collection('users').doc(uid);
      const leaderboardRef = db.collection('trustedLeaderboard').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const equipped = equipAvatarItem(currentState, avatarId);
        const publicState = toPublicEconomy(equipped.state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(
          leaderboardRef,
          publicLeaderboardProfile(
            uid,
            userData,
            equipped.state.customPhotoURL,
            equipped.state.totalPoints,
            equipped.state.economyVersion,
          ),
          { merge: true },
        );

        return {
          avatarId: equipped.avatarId,
          stats: publicState,
        };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);
