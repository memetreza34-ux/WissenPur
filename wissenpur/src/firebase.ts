import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  GoogleAuthProvider,
  initializeAuth,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Global error handler for IndexedDB to prevent crashes in restricted environments.
if (typeof window !== 'undefined') {
  const handleIndexedDBError = (error: unknown) => {
    const candidate = error as { message?: string; name?: string } | undefined;
    const message = candidate?.message || String(error);

    if (message.includes('Indexed Database') || message.includes('IndexedDB') || candidate?.name === 'IndexedDBError') {
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

export const app = initializeApp(firebaseConfig);

const appCheckSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();

if (appCheckSiteKey) {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_APPCHECK_DEBUG === 'true') {
    const debugGlobal = self as typeof self & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
    };
    debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
} else if (import.meta.env.PROD) {
  console.error(
    'Firebase App Check is not configured. Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY before releasing AI features.'
  );
}

// Use session persistence and an in-memory Firestore cache to avoid IndexedDB failures
// in restricted browsers and embedded preview environments.
export const auth = initializeAuth(app, {
  persistence: browserSessionPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

const firestoreSettings = {
  localCache: memoryLocalCache(),
};
const configuredDatabaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID?.trim();

// Production uses the stable default Firestore database. A named database can
// be selected explicitly for isolated development or a one-time migration.
export const db = configuredDatabaseId && configuredDatabaseId !== '(default)'
  ? initializeFirestore(app, firestoreSettings, configuredDatabaseId)
  : initializeFirestore(app, firestoreSettings);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const authError = error as { code?: string };

    if (authError.code === 'auth/popup-closed-by-user') {
      console.info('Sign-in popup closed by user.');
      return null;
    }

    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
