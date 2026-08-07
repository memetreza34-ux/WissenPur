import { randomInt } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from 'firebase-functions/v2/https';
import { enforceGlobalCallableRateLimit } from './callableRateLimit.js';
import { db, enforceAppCheck } from './database.js';
import {
  applySpinReward,
  berlinDateKey,
  claimDailyQuest,
  consumePowerUpItem,
  EconomyDomainError,
  normalizeEconomy,
  purchaseShopItem as applyShopPurchase,
  rewardFromRoll,
  stringOrNull,
  toPublicEconomy,
  type EconomyState,
} from './economyCore.js';

interface PurchaseRequest {
  itemId?: unknown;
}

interface ConsumePowerUpRequest {
  powerUp?: unknown;
}

function requireUser(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError(
      'unauthenticated',
      'Bitte melde dich an, um Online-Fortschritt zu speichern.',
    );
  }
  return uid;
}

function requireString(value: unknown, field: string, maxLength = 100): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${field} muss ein Text sein.`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    throw new HttpsError('invalid-argument', `${field} ist ungültig.`);
  }
  return trimmed;
}

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) return error;
  if (error instanceof EconomyDomainError) {
    return new HttpsError(error.code, error.message);
  }
  logger.error('Unexpected economy action error', error);
  return new HttpsError('internal', 'Die Aktion konnte nicht sicher verarbeitet werden.');
}

function safeHttpsImage(value: unknown): string {
  const candidate = stringOrNull(value, 1_000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function leaderboardProfile(
  uid: string,
  userData: Record<string, unknown> | undefined,
  state: EconomyState,
  authToken: Record<string, unknown> | undefined,
) {
  const customName = stringOrNull(userData?.customName, 100);
  const storedName = stringOrNull(userData?.displayName, 100);
  const tokenName = stringOrNull(authToken?.name, 100);
  const displayName = customName || storedName || tokenName || 'WissenPur-Nutzer';

  // Shop avatars are server-owned economy state. Identity-provider images are
  // read only from the verified token via authToken?.picture.
  const providerPhoto = safeHttpsImage(authToken?.picture);
  const photoURL = safeHttpsImage(state.customPhotoURL) || providerPhoto;

  return {
    uid,
    displayName,
    photoURL,
    totalPoints: state.totalPoints,
    economyVersion: state.economyVersion,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

// Ranked submission is intentionally isolated in secureSubmit.ts, where
// readSessionAnswerKey validates the immutable per-session answer snapshot.

export const claimDailyQuestReward = onCall(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      await enforceGlobalCallableRateLimit(uid);
      const userRef = db.collection('users').doc(uid);
      const leaderboardRef = db.collection('trustedLeaderboard').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const previousAchievements = currentState.achievements.length;
        const nextState = claimDailyQuest(currentState, today);
        const achievementsUnlocked = nextState.achievements.length - previousAchievements;
        const publicState = toPublicEconomy(nextState);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(
          leaderboardRef,
          leaderboardProfile(uid, userData, nextState, request.auth?.token),
          { merge: true },
        );

        return {
          pointsEarned: 100,
          coinsEarned: 50 + achievementsUnlocked * 50,
          achievementsUnlocked,
          stats: publicState,
        };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const spinDailyWheel = onCall(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      await enforceGlobalCallableRateLimit(uid);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const reward = rewardFromRoll(randomInt(100));
        const nextState = applySpinReward(currentState, today, reward);
        const publicState = toPublicEconomy(nextState);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { reward, stats: publicState };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const purchaseShopItem = onCall<PurchaseRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      await enforceGlobalCallableRateLimit(uid);
      const itemId = requireString(request.data.itemId, 'itemId', 100);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const purchase = applyShopPurchase(currentState, itemId);
        const publicState = toPublicEconomy(purchase.state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return {
          itemId: purchase.itemId,
          cost: purchase.cost,
          stats: publicState,
        };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const consumePowerUp = onCall<ConsumePowerUpRequest>(
  { enforceAppCheck },
  async (request) => {
    try {
      const uid = requireUser(request);
      await enforceGlobalCallableRateLimit(uid);
      const powerUp = requireString(request.data.powerUp, 'powerUp', 50);
      const userRef = db.collection('users').doc(uid);
      const today = berlinDateKey();

      return await db.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userRef);
        const userData = userSnapshot.exists
          ? userSnapshot.data() as Record<string, unknown>
          : undefined;
        const currentState = normalizeEconomy(userData, today);
        const consumed = consumePowerUpItem(currentState, powerUp);
        const publicState = toPublicEconomy(consumed.state);

        transaction.set(userRef, {
          uid,
          ...publicState,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { powerUp: consumed.powerUp, stats: publicState };
      });
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);
