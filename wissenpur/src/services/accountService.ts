import { getIdToken, reauthenticateWithPopup } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, googleProvider } from '../firebase';
import { functions } from './functionsClient';

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

const clearDeletedAccountCache = () => {
  localStorage.removeItem('wissenpur_user_stats');
  localStorage.removeItem('wissenpur_user_stats_owner');
  localStorage.removeItem('wissenpur_learning_plan');
  localStorage.removeItem('wissenpur_learning_history_v1');
  localStorage.removeItem('wissenpur_learning_history_owner_v1');
  sessionStorage.clear();
  window.dispatchEvent(new CustomEvent('wissenpur:account-storage-reset'));
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
  if (!auth.currentUser) throw new Error('Bitte melde dich zuerst an.');
  const response = await exportMyDataCallable({});
  return response.data;
};

export const deleteCurrentAccount = async (): Promise<AccountDeletionResult> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Bitte melde dich zuerst an.');

  try {
    const response = await deleteMyAccountCallable({});
    clearDeletedAccountCache();
    return response.data;
  } catch (error) {
    if (!isRecentAuthenticationRequired(error)) throw error;

    await reauthenticateWithPopup(currentUser, googleProvider);
    await getIdToken(currentUser, true);

    const retry = await deleteMyAccountCallable({});
    clearDeletedAccountCache();
    return retry.data;
  }
};
