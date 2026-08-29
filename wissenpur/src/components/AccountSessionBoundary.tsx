import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { shouldClearLocalAccountDataForTransition } from '../services/accountSessionPolicy';
import {
  ANALYTICS_OWNER_KEY,
  ANALYTICS_STORAGE_KEY,
} from '../services/learningAnalytics';
import { clearLocalAccountData } from '../storage';

interface AccountSessionBoundaryProps {
  children: ReactNode;
}

/**
 * Remounts the complete product surface whenever the authenticated Firebase
 * account changes. This prevents React state from one account surviving a
 * logout, token loss or switch to another Google account.
 *
 * Account-bound surfaces are rendered only after Firebase resolves the first
 * auth state. This prevents a signed-in browser from briefly reading account
 * data as anonymous during startup hydration.
 *
 * Anonymous -> authenticated is the one intentional migration path: learning
 * data created before the first login is preserved so it can be claimed by the
 * account the user explicitly signs into. Authenticated -> anonymous and
 * authenticated -> another account always clear the previous account context.
 *
 * Library and shared stats mutations can also request a controlled remount so
 * the main product immediately reloads imported decks, due-card counts,
 * economy-owned profile state and wrong-question data.
 */
export const AccountSessionBoundary = ({ children }: AccountSessionBoundaryProps) => {
  const [sessionKey, setSessionKey] = useState('auth-loading');
  const [contentRevision, setContentRevision] = useState(0);
  const [authResolved, setAuthResolved] = useState(false);
  const previousUid = useRef<string | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    const nextUid = user?.uid || null;
    const previous = previousUid.current;

    if (shouldClearLocalAccountDataForTransition(previous, nextUid)) {
      clearLocalAccountData();
      // Learning analytics are intentionally device-local and have their own
      // owner marker. Remove both values directly so privacy cleanup does not
      // depend on a mounted panel receiving the reset event.
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      localStorage.removeItem(ANALYTICS_OWNER_KEY);
    }

    previousUid.current = nextUid;
    setSessionKey(nextUid ? `account:${nextUid}` : 'anonymous');
    setAuthResolved(true);
  }), []);

  useEffect(() => {
    const refreshProductContent = () => setContentRevision((value) => value + 1);
    window.addEventListener('wissenpur:library-updated', refreshProductContent);
    window.addEventListener('wissenpur:stats-updated', refreshProductContent);
    window.addEventListener('wissenpur:account-storage-reset', refreshProductContent);
    return () => {
      window.removeEventListener('wissenpur:library-updated', refreshProductContent);
      window.removeEventListener('wissenpur:stats-updated', refreshProductContent);
      window.removeEventListener('wissenpur:account-storage-reset', refreshProductContent);
    };
  }, []);

  if (!authResolved) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 text-sm font-bold text-slate-500 dark:bg-slate-950 dark:text-slate-400" role="status" aria-live="polite">
        Konto wird geladen …
      </div>
    );
  }

  return <Fragment key={`${sessionKey}:${contentRevision}`}>{children}</Fragment>;
};
