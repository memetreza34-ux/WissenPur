import { initializeApp } from 'firebase/app';
import { initializeAuth, GoogleAuthProvider, signInWithPopup, signOut, browserSessionPersistence, browserPopupRedirectResolver } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Global error handler for IndexedDB to prevent crashes in restricted environments
if (typeof window !== 'undefined') {
  const handleIndexedDBError = (error: any) => {
    const message = error?.message || String(error);
    if (message.includes('Indexed Database') || message.includes('IndexedDB') || (error?.name === 'IndexedDBError')) {
      console.warn('Caught IndexedDB error, preventing crash:', message);
      return true;
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (handleIndexedDBError(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (handleIndexedDBError(event.error || event.message)) {
      event.preventDefault();
    }
  });
}

const app = initializeApp(firebaseConfig);

// Use initializeAuth with browserSessionPersistence (sessionStorage) to strictly avoid IndexedDB
export const auth = initializeAuth(app, {
  persistence: browserSessionPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Sign-in popup closed by user.');
      return null;
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
