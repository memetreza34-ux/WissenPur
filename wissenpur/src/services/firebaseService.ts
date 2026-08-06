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
  error: string;
  operationType: OperationType;
  path: string | null;
  userId?: string;
}

let hydratedAuthUser: User | null = null;

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    userId: auth.currentUser?.uid,
  };

  console.error('Firestore operation failed:', errorInfo);
  throw new Error(`${operationType} failed for ${path || 'unknown path'}`);
}

const sanitizeForFirestore = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mergeCloudStats = (localStats: UserStats, cloudStats: Partial<UserStats>): UserStats => ({
  ...localStats,
  ...cloudStats,
  wrongQuestions: cloudStats.wrongQuestions ?? localStats.wrongQuestions ?? [],
  customQuizzes: cloudStats.customQuizzes ?? localStats.customQuizzes ?? [],
  powerUps: cloudStats.powerUps ?? localStats.powerUps,
  unlockedAvatars: cloudStats.unlockedAvatars ?? localStats.unlockedAvatars,
  unlockedTitles: cloudStats.unlockedTitles ?? localStats.unlockedTitles,
  achievements: cloudStats.achievements ?? localStats.achievements ?? [],
});

const getProfileUpdate = (stats: UserStats): Partial<UserStats> & { uid: string } => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Profil-Synchronisierung erfordert eine Anmeldung.');

  return sanitizeForFirestore({
    uid: currentUser.uid,
    displayName: currentUser.displayName || 'Anonym',
    photoURL: currentUser.photoURL || '',
    customName: stats.customName,
    age: stats.age,
    customPhotoURL: stats.customPhotoURL,
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
 * content. Points, coins, streaks, achievements, server inventory and all
 * leaderboard values are exclusively owned by callable Cloud Functions.
 */
export const syncUserStats = async (stats: UserStats): Promise<UserStats | undefined> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    hydratedAuthUser = null;
    return undefined;
  }

  const userRef = doc(db, 'users', currentUser.uid);
  const userPath = `users/${currentUser.uid}`;

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
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
};

export const fetchUserStats = async (uid: string): Promise<UserStats | null> => {
  const path = `users/${uid}`;

  try {
    const documentSnapshot = await getDoc(doc(db, 'users', uid));
    return documentSnapshot.exists() ? (documentSnapshot.data() as UserStats) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getLeaderboard = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  const path = 'trustedLeaderboard';

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
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase ist offline. Prüfe die Projektkonfiguration und Netzwerkverbindung.');
    }
  }
};
