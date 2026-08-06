import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { LeaderboardEntry, UserStats } from '../types';

enum OperationType {
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  errorName: string;
  operationType: OperationType;
  resourceType: string;
}

let hydratedAuthUser: User | null = null;

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  resourceType: string,
): never {
  const errorInfo: FirestoreErrorInfo = {
    errorName: error instanceof Error ? error.name : 'UnknownError',
    operationType,
    resourceType,
  };

  // Do not log UID, e-mail, profile values, question content or document data.
  console.error('Firestore operation failed', errorInfo);
  throw new Error('Die Cloud-Synchronisierung ist momentan nicht verfügbar.');
}

const sanitizeForFirestore = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mergeProfileContent = (
  localStats: UserStats,
  cloudStats: Partial<UserStats>,
): UserStats => ({
  ...localStats,
  uid: cloudStats.uid ?? localStats.uid,
  displayName: cloudStats.displayName ?? localStats.displayName,
  photoURL: cloudStats.photoURL ?? localStats.photoURL,
  customName: cloudStats.customName ?? localStats.customName,
  age: cloudStats.age ?? localStats.age,
  wrongQuestions: cloudStats.wrongQuestions ?? localStats.wrongQuestions ?? [],
  customDifficultyTimes:
    cloudStats.customDifficultyTimes ?? localStats.customDifficultyTimes,
  darkMode: cloudStats.darkMode ?? localStats.darkMode,
  customQuizzes: cloudStats.customQuizzes ?? localStats.customQuizzes ?? [],
});

const mergeCloudStats = (
  localStats: UserStats,
  cloudStats: Partial<UserStats>,
): UserStats => {
  const profileMerged = mergeProfileContent(localStats, cloudStats);

  // Legacy documents were writable by the browser and therefore cannot be
  // trusted for points, coins, streaks, achievements, inventory or avatars.
  if (cloudStats.economyVersion !== 1) return profileMerged;

  return {
    ...profileMerged,
    ...cloudStats,
    wrongQuestions: profileMerged.wrongQuestions,
    customQuizzes: profileMerged.customQuizzes,
    customDifficultyTimes: profileMerged.customDifficultyTimes,
    darkMode: profileMerged.darkMode,
    customName: profileMerged.customName,
    age: profileMerged.age,
  } as UserStats;
};

const getProfileUpdate = (stats: UserStats): Partial<UserStats> & { uid: string } => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Profil-Synchronisierung erfordert eine Anmeldung.');

  return sanitizeForFirestore({
    uid: currentUser.uid,
    displayName: currentUser.displayName || 'Anonym',
    photoURL: currentUser.photoURL || '',
    customName: stats.customName,
    age: stats.age,
    wrongQuestions: stats.wrongQuestions || [],
    customDifficultyTimes: stats.customDifficultyTimes,
    darkMode: stats.darkMode,
    customQuizzes: stats.customQuizzes || [],
  });
};

const persistProfileOnly = async (stats: UserStats): Promise<UserStats> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return stats;

  const profileUpdate = getProfileUpdate(stats);
  await setDoc(doc(db, 'users', currentUser.uid), profileUpdate, { merge: true });
  return { ...stats, ...profileUpdate } as UserStats;
};

/**
 * The browser only synchronizes profile settings and user-created learning
 * content. Points, coins, streaks, achievements, server inventory, shop
 * avatars and all leaderboard values are exclusively owned by Cloud Functions.
 */
export const syncUserStats = async (stats: UserStats): Promise<UserStats | undefined> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    hydratedAuthUser = null;
    return undefined;
  }

  const userRef = doc(db, 'users', currentUser.uid);

  try {
    if (hydratedAuthUser !== currentUser) {
      const existingSnapshot = await getDoc(userRef);
      hydratedAuthUser = currentUser;

      if (existingSnapshot.exists()) {
        const mergedStats = mergeCloudStats(
          stats,
          existingSnapshot.data() as Partial<UserStats>,
        );
        return persistProfileOnly(mergedStats);
      }
    }

    return persistProfileOnly(stats);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'current-user-profile');
  }
};

export const fetchUserStats = async (uid: string): Promise<UserStats | null> => {
  try {
    const documentSnapshot = await getDoc(doc(db, 'users', uid));
    return documentSnapshot.exists() ? (documentSnapshot.data() as UserStats) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'user-profile');
  }
};

export const getLeaderboard = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const safeLimit = Math.min(100, Math.max(1, Math.trunc(limitCount) || 10));
    const leaderboardQuery = query(
      collection(db, 'trustedLeaderboard'),
      orderBy('totalPoints', 'desc'),
      limit(safeLimit),
    );
    const querySnapshot = await getDocs(leaderboardQuery);

    return querySnapshot.docs.map((documentSnapshot) =>
      documentSnapshot.data() as LeaderboardEntry,
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'trusted-leaderboard');
  }
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase connection unavailable', {
        errorName: error.name,
        resourceType: 'connection-check',
      });
    }
  }
};
