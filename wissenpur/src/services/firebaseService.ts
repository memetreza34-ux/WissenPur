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
import { auth, db } from '../firebase';
import { ACHIEVEMENTS, LeaderboardEntry, UserStats } from '../types';

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

let hydratedUserId: string | null = null;

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

const mergeCloudStats = (localStats: UserStats, cloudStats: UserStats): UserStats => ({
  ...localStats,
  ...cloudStats,
  // Preserve local-only collections when an older cloud document does not contain them.
  wrongQuestions: cloudStats.wrongQuestions ?? localStats.wrongQuestions ?? [],
  customQuizzes: cloudStats.customQuizzes ?? localStats.customQuizzes ?? [],
  powerUps: cloudStats.powerUps ?? localStats.powerUps,
  unlockedAvatars: cloudStats.unlockedAvatars ?? localStats.unlockedAvatars,
  unlockedTitles: cloudStats.unlockedTitles ?? localStats.unlockedTitles,
  achievements: cloudStats.achievements ?? localStats.achievements ?? [],
});

/**
 * Synchronizes a user's progress after the initial cloud hydration.
 *
 * On the first call for a signed-in user, an existing cloud document wins over
 * the local browser copy. This prevents a fresh or cleared browser from
 * overwriting established cloud progress with zeros. Later calls in the same
 * authenticated session persist the updated local state.
 *
 * Points and rewards still need a server-authoritative write path before the
 * public leaderboard can be considered cheat-resistant.
 */
export const syncUserStats = async (stats: UserStats): Promise<UserStats | undefined> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return undefined;

  const userPath = `users/${currentUser.uid}`;

  try {
    if (hydratedUserId !== currentUser.uid) {
      const existingSnapshot = await getDoc(doc(db, 'users', currentUser.uid));
      hydratedUserId = currentUser.uid;

      if (existingSnapshot.exists()) {
        return mergeCloudStats(stats, existingSnapshot.data() as UserStats);
      }
    }

    const unlockedAchievements = stats.achievements || [];
    const newAchievements = ACHIEVEMENTS.filter((achievement) => {
      if (unlockedAchievements.includes(achievement.id)) return false;
      if (achievement.type === 'points' && stats.totalPoints >= achievement.threshold) return true;
      if (achievement.type === 'streak' && stats.currentStreak >= achievement.threshold) return true;
      if (achievement.type === 'rounds' && stats.roundsPlayed >= achievement.threshold) return true;
      return false;
    }).map((achievement) => achievement.id);

    const updatedStats: UserStats = {
      ...stats,
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonym',
      photoURL: stats.customPhotoURL || currentUser.photoURL || '',
      achievements: Array.from(new Set([...unlockedAchievements, ...newAchievements])),
    };

    await setDoc(doc(db, 'users', currentUser.uid), sanitizeForFirestore(updatedStats));

    await setDoc(doc(db, 'leaderboard', currentUser.uid), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonym',
      photoURL: stats.customPhotoURL || currentUser.photoURL || '',
      totalPoints: stats.totalPoints,
    });

    return updatedStats;
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
  const path = 'leaderboard';

  try {
    const safeLimit = Math.min(100, Math.max(1, Math.trunc(limitCount) || 10));
    const leaderboardQuery = query(
      collection(db, 'leaderboard'),
      orderBy('totalPoints', 'desc'),
      limit(safeLimit)
    );
    const querySnapshot = await getDocs(leaderboardQuery);

    return querySnapshot.docs.map((documentSnapshot) => documentSnapshot.data() as LeaderboardEntry);
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
