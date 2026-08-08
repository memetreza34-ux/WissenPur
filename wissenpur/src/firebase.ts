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

const LOCAL_ACCOUNT_KEYS = [
  'wissenpur_user_stats',
  'wissenpur_user_stats_owner',
  'wissenpur_learning_plan',
  'wissenpur_learning_history_v1',
  'wissenpur_learning_history_owner_v1',
] as const;

const clearLocalAccountCache = () => {
  for (const key of LOCAL_ACCOUNT_KEYS) localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent('wissenpur:account-storage-reset'));
};

const browserErrorMetadata = (error: unknown) => {
  const candidate = error && typeof error === 'object'
    ? error as { name?: unknown; code?: unknown }
    : {};
  return {
    errorName: typeof candidate.name === 'string' ? candidate.name.slice(0, 80) : 'UnknownError',
    ...(typeof candidate.code === 'string' ? { errorCode: candidate.code.slice(0, 100) } : {}),
  };
};

// Global error handler for IndexedDB to prevent crashes in restricted environments.
if (typeof window !== 'undefined') {
  const isIndexedDBError = (error: unknown) => {
    const candidate = error as { message?: string; name?: string } | undefined;
    const message = candidate?.message || String(error);
    return (
      message.includes('Indexed Database') ||
      message.includes('IndexedDB') ||
      candidate?.name === 'IndexedDBError'
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isIndexedDBError(event.reason)) {
      console.warn('IndexedDB operation was blocked by the browser', browserErrorMetadata(event.reason));
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const error = event.error || event.message;
    if (isIndexedDBError(error)) {
      console.warn('IndexedDB operation was blocked by the browser', browserErrorMetadata(event.error));
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
  console.error('Firebase App Check is not configured for this production build.');
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

    console.error('Google sign-in failed', browserErrorMetadata(error));
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
  clearLocalAccountCache();
  window.location.replace('/');
};
