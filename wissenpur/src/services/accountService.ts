import { httpsCallable } from 'firebase/functions';
import { auth } from '../firebase';
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

export const exportCurrentAccountData = async (): Promise<AccountDataExport> => {
  if (!auth.currentUser) throw new Error('Bitte melde dich zuerst an.');
  const response = await exportMyDataCallable({});
  return response.data;
};

export const deleteCurrentAccount = async (): Promise<AccountDeletionResult> => {
  if (!auth.currentUser) throw new Error('Bitte melde dich zuerst an.');
  const response = await deleteMyAccountCallable({});
  return response.data;
};
