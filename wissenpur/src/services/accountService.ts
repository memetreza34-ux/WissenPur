import { getIdToken, reauthenticateWithPopup } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, googleProvider } from '../firebase';
import { assertFunctionsClientReady, functions } from './functionsClient';

export interface AccountDataExport {
  schemaVersion: number;
  exportedAt: string;
  account: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    signInProvider: string | null;
  };
  firestore: Record<string, unknown>;
  redactions?: {
    quizSessionAnswerKeys?: string;
  };
  limits: {
    documentsPerExportedCollection: number;
    note: string;
  };
}

export interface AccountDeletionResult {
  deleted: true;
  deletedAt: string;
  deletedCounts: Record<string, number>;
}

const exportMyDataCallable = httpsCallable<Record<string, never>, AccountDataExport>(
  functions,
  'exportMyData',
);

const deleteMyAccountCallable = httpsCallable<Record<string, never>, AccountDeletionResult>(
  functions,
  'deleteMyAccount',
);

class AccountAuthSessionChangedError extends Error {
  constructor(message = 'Die Kontositzung hat sich während der Kontoaktion geändert. Bitte starte die Aktion erneut.') {
    super(message);
    this.name = 'AccountAuthSessionChangedError';
  }
}

const assertActiveAccountUid = (expectedUid: string): void => {
  if (auth.currentUser?.uid !== expectedUid) {
    throw new AccountAuthSessionChangedError();
  }
};

const assertNoDifferentAccountUid = (expectedUid: string): void => {
  const activeUid = auth.currentUser?.uid || null;
  if (activeUid && activeUid !== expectedUid) {
    throw new AccountAuthSessionChangedError(
      'Die ursprüngliche Kontoaktion wurde beendet, aber inzwischen ist ein anderes Konto aktiv. Das neue Konto wurde lokal nicht verändert.',
    );
  }
};

const clearDeletedAccountCache = () => {
  localStorage.removeItem('wissenpur_user_stats');
  localStorage.removeItem('wissenpur_user_stats_owner');
  localStorage.removeItem('wissenpur_learning_plan');
  localStorage.removeItem('wissenpur_learning_history_v1');
  localStorage.removeItem('wissenpur_learning_history_owner_v1');
  sessionStorage.clear();
  window.dispatchEvent(new CustomEvent('wissenpur:account-storage-reset'));
};

const finalizeDeletedAccount = (
  expectedUid: string,
  result: AccountDeletionResult,
): AccountDeletionResult => {
  assertNoDifferentAccountUid(expectedUid);

  // If Firebase still exposes the deleted account, these values belong to the
  // operation that just completed and can be removed safely. If the client is
  // already signed out, the central auth-transition cleanup owns local state;
  // do not wipe newly created guest data after a delayed server response.
  if (auth.currentUser?.uid === expectedUid) {
    clearDeletedAccountCache();
  }

  return result;
};

const isRecentAuthenticationRequired = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: unknown; message?: unknown };
  const code = typeof candidate.code === 'string' ? candidate.code : '';
  const message = typeof candidate.message === 'string'
    ? candidate.message.toLowerCase()
    : '';

  return code === 'functions/failed-precondition' &&
    (message.includes('erneut an') || message.includes('zehn minuten'));
};

export const exportCurrentAccountData = async (): Promise<AccountDataExport> => {
  assertFunctionsClientReady();
  const expectedUid = auth.currentUser?.uid;
  if (!expectedUid) throw new Error('Bitte melde dich zuerst an.');

  const response = await exportMyDataCallable({});
  assertActiveAccountUid(expectedUid);

  if (response.data.account.uid !== expectedUid) {
    throw new Error('Der Datenexport konnte dem aktuellen Konto nicht sicher zugeordnet werden.');
  }

  return response.data;
};

export const deleteCurrentAccount = async (): Promise<AccountDeletionResult> => {
  assertFunctionsClientReady();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Bitte melde dich zuerst an.');
  const expectedUid = currentUser.uid;

  try {
    assertActiveAccountUid(expectedUid);
    const response = await deleteMyAccountCallable({});
    return finalizeDeletedAccount(expectedUid, response.data);
  } catch (error) {
    if (error instanceof AccountAuthSessionChangedError) throw error;
    if (!isRecentAuthenticationRequired(error)) throw error;

    assertActiveAccountUid(expectedUid);
    await reauthenticateWithPopup(currentUser, googleProvider);
    assertActiveAccountUid(expectedUid);
    await getIdToken(currentUser, true);
    assertActiveAccountUid(expectedUid);
    assertFunctionsClientReady();

    const retry = await deleteMyAccountCallable({});
    return finalizeDeletedAccount(expectedUid, retry.data);
  }
};
