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
 */
export const AccountSessionBoundary = ({ children }: AccountSessionBoundaryProps) => {
  const [sessionKey, setSessionKey] = useState('auth-loading');
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

  return <Fragment key={sessionKey}>{children}</Fragment>;
};
