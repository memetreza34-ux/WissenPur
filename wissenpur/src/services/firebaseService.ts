import { onAuthStateChanged } from 'firebase/auth';
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
import { saveStats } from '../storage';
import { LeaderboardEntry, UserStats } from '../types';
import { getServerEconomyState } from './economyService';
import { mergeLearningLibraries } from './learningLibraryMerge';
import { applyLearningLibraryPolicy } from './learningLibraryPolicy';
import { mergeWrongQuestions } from './wrongQuestionMerge';

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

class AuthSessionChangedError extends Error {
  constructor() {
    super('Authentication session changed during synchronization.');
    this.name = 'AuthSessionChangedError';
  }
}

let hydratedAuthUid: string | null = null;

onAuthStateChanged(auth, (user) => {
  const nextUid = user?.uid || null;
  if (!nextUid || nextUid !== hydratedAuthUid) {
    hydratedAuthUid = null;
  }
});

const assertActiveAuthUid = (expectedUid: string): void => {
  if (auth.currentUser?.uid !== expectedUid) {
    throw new AuthSessionChangedError();
  }
};

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

const logBestEffortSyncFailure = (error: unknown): void => {
  console.warn('Best-effort profile sync deferred', {
    errorName: error instanceof Error ? error.name : 'UnknownError',
    resourceType: 'current-user-profile',
  });
};

const sanitizeForFirestore = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mergeProfileContent = (
  localStats: UserStats,
  cloudStats: Partial<UserStats>,
): UserStats => {
  const mergedLibrary = mergeLearningLibraries(
    localStats.customQuizzes,
    cloudStats.customQuizzes,
  ).decks;
  const mergedWrongQuestions = mergeWrongQuestions(
    localStats.wrongQuestions,
    cloudStats.wrongQuestions,
  );

  return {
    ...localStats,
    uid: cloudStats.uid ?? localStats.uid,
    displayName: cloudStats.displayName ?? localStats.displayName,
    photoURL: cloudStats.photoURL ?? localStats.photoURL,
    customName: cloudStats.customName ?? localStats.customName,
    age: cloudStats.age ?? localStats.age,
    wrongQuestions: mergedWrongQuestions,
    customDifficultyTimes:
      cloudStats.customDifficultyTimes ?? localStats.customDifficultyTimes,
    darkMode: cloudStats.darkMode ?? localStats.darkMode,
    customQuizzes: mergedLibrary,
  };
};

const mergeCloudStats = (
  localStats: UserStats,
  cloudStats: Partial<UserStats>,
): UserStats => {
  const profileMerged = mergeProfileContent(localStats, cloudStats);

  // Authenticated economy values are accepted only from the server callable.
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

const getProfileUpdate = (
  stats: UserStats,
  expectedUid: string,
): Partial<UserStats> & { uid: string } => {
  assertActiveAuthUid(expectedUid);
  const currentUser = auth.currentUser!;
  const library = applyLearningLibraryPolicy(stats.customQuizzes);
  const wrongQuestions = mergeWrongQuestions(stats.wrongQuestions, []);
  return sanitizeForFirestore({
    uid: expectedUid,
    displayName: currentUser.displayName || 'Anonym',
    photoURL: currentUser.photoURL || '',
    customName: stats.customName,
    age: stats.age,
    wrongQuestions,
    customDifficultyTimes: stats.customDifficultyTimes,
    darkMode: stats.darkMode,
    customQuizzes: library.decks,
  });
};

const persistProfileOnly = async (
  stats: UserStats,
  expectedUid: string,
): Promise<UserStats> => {
  assertActiveAuthUid(expectedUid);
  const library = applyLearningLibraryPolicy(stats.customQuizzes);
  const wrongQuestions = mergeWrongQuestions(stats.wrongQuestions, []);
  const profileNormalized = library.changed || wrongQuestions.length !== (stats.wrongQuestions || []).length;
  const normalizedStats: UserStats = profileNormalized
    ? { ...stats, customQuizzes: library.decks, wrongQuestions }
    : stats;
  const profileUpdate = getProfileUpdate(normalizedStats, expectedUid);
  const persistedStats = { ...normalizedStats, ...profileUpdate } as UserStats;

  await setDoc(doc(db, 'users', expectedUid), profileUpdate, { merge: true });
  assertActiveAuthUid(expectedUid);

  if (profileNormalized) {
    console.warn('Lokale Lerninhalte wurden vor der Cloud-Synchronisierung normalisiert.', {
      libraryReason: library.reason,
    });
    saveStats(persistedStats);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: persistedStats }),
      );
      if (library.changed) window.dispatchEvent(new Event('wissenpur:library-updated'));
    }
  }

  return persistedStats;
};

/**
 * The first sync of each authenticated browser session is strict because it
 * hydrates the server-authoritative economy. Once that boundary succeeded,
 * later profile/learning-content writes are best effort: local changes remain
 * valid offline and a failed background write must not become an unhandled
 * promise rejection. Late responses from a previous auth session are always
 * discarded.
 */
export const syncUserStats = async (stats: UserStats): Promise<UserStats | undefined> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    hydratedAuthUid = null;
    return undefined;
  }
  const expectedUid = currentUser.uid;
  const userRef = doc(db, 'users', expectedUid);
  const requiresHydration = hydratedAuthUid !== expectedUid;

  try {
    if (requiresHydration) {
      const existingSnapshot = await getDoc(userRef);
      assertActiveAuthUid(expectedUid);
      const existingData = existingSnapshot.exists()
        ? existingSnapshot.data() as Partial<UserStats>
        : {};
      const profileMerged = mergeProfileContent(stats, existingData);
      const authoritativeEconomy = (await getServerEconomyState()).stats;
      assertActiveAuthUid(expectedUid);
      const hydratedStats = mergeCloudStats(profileMerged, authoritativeEconomy);

      const persisted = await persistProfileOnly(hydratedStats, expectedUid);
      assertActiveAuthUid(expectedUid);
      hydratedAuthUid = expectedUid;
      saveStats(persisted);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<UserStats>('wissenpur:stats-updated', { detail: persisted }),
        );
      }
      return persisted;
    }

    return await persistProfileOnly(stats, expectedUid);
  } catch (error) {
    if (error instanceof AuthSessionChangedError) return undefined;
    if (!requiresHydration) {
      logBestEffortSyncFailure(error);
      return stats;
    }
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
