import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserStats, LeaderboardEntry, ACHIEVEMENTS } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncUserStats = async (stats: UserStats) => {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}`;
  const leaderboardPath = `leaderboard/${auth.currentUser.uid}`;

  try {
    // Check for new achievements
    const unlockedAchievements = stats.achievements || [];
    const newAchievements = ACHIEVEMENTS.filter(a => {
      if (unlockedAchievements.includes(a.id)) return false;
      if (a.type === 'points' && stats.totalPoints >= a.threshold) return true;
      if (a.type === 'streak' && stats.currentStreak >= a.threshold) return true;
      if (a.type === 'rounds' && stats.roundsPlayed >= a.threshold) return true;
      return false;
    }).map(a => a.id);

    const updatedStats = {
      ...stats,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Anonymous',
      photoURL: stats.customPhotoURL || auth.currentUser.photoURL || '',
      achievements: [...unlockedAchievements, ...newAchievements]
    };

    // Remove undefined values which are not supported by Firestore
    const sanitizedStats = JSON.parse(JSON.stringify(updatedStats));

    await setDoc(doc(db, 'users', auth.currentUser.uid), sanitizedStats);
    
    // Update leaderboard entry
    await setDoc(doc(db, 'leaderboard', auth.currentUser.uid), {
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Anonymous',
      photoURL: stats.customPhotoURL || auth.currentUser.photoURL || '',
      totalPoints: stats.totalPoints
    });

    return updatedStats;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchUserStats = async (uid: string): Promise<UserStats | null> => {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserStats;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const getLeaderboard = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  const path = 'leaderboard';
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('totalPoints', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
};
