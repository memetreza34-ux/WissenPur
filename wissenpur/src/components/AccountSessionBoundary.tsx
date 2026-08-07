import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { clearLocalAccountData } from '../storage';

interface AccountSessionBoundaryProps {
  children: ReactNode;
}

/**
 * Remounts the complete product surface whenever the authenticated Firebase
 * account changes. This prevents React state from one account surviving a
 * logout, token loss or switch to another Google account.
 *
 * Library mutations can also request a controlled remount so the main product
 * immediately reloads imported decks, due-card counts and wrong-question data.
 */
export const AccountSessionBoundary = ({ children }: AccountSessionBoundaryProps) => {
  const [sessionKey, setSessionKey] = useState('auth-loading');
  const [contentRevision, setContentRevision] = useState(0);
  const previousUid = useRef<string | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    const nextUid = user?.uid || null;
    const previous = previousUid.current;

    if (previous !== undefined && previous !== nextUid) {
      clearLocalAccountData();
    }

    previousUid.current = nextUid;
    setSessionKey(nextUid ? `account:${nextUid}` : 'anonymous');
  }), []);

  useEffect(() => {
    const refreshProductContent = () => setContentRevision((value) => value + 1);
    window.addEventListener('wissenpur:library-updated', refreshProductContent);
    return () => window.removeEventListener('wissenpur:library-updated', refreshProductContent);
  }, []);

  return <Fragment key={`${sessionKey}:${contentRevision}`}>{children}</Fragment>;
};
