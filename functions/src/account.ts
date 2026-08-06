import { getAuth } from 'firebase-admin/auth';
import {
  FieldPath,
  Timestamp,
  type DocumentData,
  type Query,
} from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { sanitizeQuizSessionForExport } from './accountExportCore.js';
import { db, enforceAppCheck, firebaseApp } from './database.js';

const adminAuth = getAuth(firebaseApp);
const pageSize = 200;
const recentAuthenticationSeconds = 10 * 60;

interface AuthenticatedRequest {
  auth?: {
    uid?: string;
    token?: Record<string, unknown>;
  };
}

type ExportTransform = (
  data: Record<string, unknown>,
) => Record<string, unknown>;

function requireUid(request: AuthenticatedRequest): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Bitte melde dich an, um Kontodaten zu verwalten.');
  }
  return uid;
}

function requireRecentAuthentication(request: AuthenticatedRequest): void {
  const authTime = request.auth?.token?.auth_time;
  const ageSeconds = typeof authTime === 'number'
    ? Math.floor(Date.now() / 1000) - authTime
    : Number.POSITIVE_INFINITY;

  if (ageSeconds < 0 || ageSeconds > recentAuthenticationSeconds) {
    throw new HttpsError(
      'failed-precondition',
      'Melde dich aus Sicherheitsgründen erneut an und starte die Kontolöschung innerhalb von zehn Minuten.',
    );
  }
}

function serializeFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeFirestoreValue);
  if (value && typeof value === 'object') {
    const serialized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      serialized[key] = serializeFirestoreValue(nestedValue);
    }
    return serialized;
  }
  return value;
}

async function readOwnedDocuments(
  collectionName: string,
  field: string,
  uid: string,
  maxDocuments = 500,
  transform?: ExportTransform,
): Promise<Array<{ id: string; data: unknown }>> {
  const snapshot = await db
    .collection(collectionName)
    .where(field, '==', uid)
    .orderBy(FieldPath.documentId())
    .limit(maxDocuments)
    .get();

  return snapshot.docs.map((document) => {
    const source = document.data() as Record<string, unknown>;
    const exportData = transform ? transform(source) : source;
    return {
      id: document.id,
      data: serializeFirestoreValue(exportData),
    };
  });
}

async function deleteQueryDocuments(initialQuery: Query<DocumentData>): Promise<number> {
  let deleted = 0;
  let lastDocumentId: string | null = null;

  while (true) {
    let query = initialQuery.orderBy(FieldPath.documentId()).limit(pageSize);
    if (lastDocumentId) query = query.startAfter(lastDocumentId);

    const snapshot = await query.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();

    deleted += snapshot.size;
    lastDocumentId = snapshot.docs.at(-1)?.id || null;
    if (snapshot.size < pageSize || !lastDocumentId) break;
  }

  return deleted;
}

async function deleteOwnedByField(collectionName: string, field: string, uid: string): Promise<number> {
  return deleteQueryDocuments(db.collection(collectionName).where(field, '==', uid));
}

export const exportMyData = onCall(
  { enforceAppCheck, timeoutSeconds: 60, memory: '256MiB' },
  async (request) => {
    const uid = requireUid(request);
    const userRef = db.collection('users').doc(uid);
    const trustedLeaderboardRef = db.collection('trustedLeaderboard').doc(uid);
    const legacyLeaderboardRef = db.collection('leaderboard').doc(uid);
    const rateLimitRef = db.collection('serverRateLimits').doc(uid);

    const [
      userSnapshot,
      trustedLeaderboardSnapshot,
      legacyLeaderboardSnapshot,
      rateLimitSnapshot,
      quizSessions,
      roundReceipts,
      hostedLobbies,
      hostedLegacyLobbies,
      playerOneDuels,
      playerTwoDuels,
    ] = await Promise.all([
      userRef.get(),
      trustedLeaderboardRef.get(),
      legacyLeaderboardRef.get(),
      rateLimitRef.get(),
      readOwnedDocuments(
        'quizSessions',
        'uid',
        uid,
        500,
        sanitizeQuizSessionForExport,
      ),
      readOwnedDocuments('roundReceipts', 'uid', uid),
      readOwnedDocuments('lobbies', 'hostId', uid),
      readOwnedDocuments('lobbies', 'hostUid', uid),
      readOwnedDocuments('duels', 'player1Uid', uid),
      readOwnedDocuments('duels', 'player2Uid', uid),
    ]);

    const token = request.auth?.token || {};
    const provider = typeof token.firebase === 'object' && token.firebase !== null
      ? (token.firebase as Record<string, unknown>).sign_in_provider
      : undefined;

    return {
      schemaVersion: 3,
      exportedAt: new Date().toISOString(),
      account: {
        uid,
        email: typeof token.email === 'string' ? token.email : null,
        emailVerified: token.email_verified === true,
        displayName: typeof token.name === 'string' ? token.name : null,
        signInProvider: typeof provider === 'string' ? provider : null,
      },
      firestore: {
        user: userSnapshot.exists ? serializeFirestoreValue(userSnapshot.data()) : null,
        trustedLeaderboard: trustedLeaderboardSnapshot.exists
          ? serializeFirestoreValue(trustedLeaderboardSnapshot.data())
          : null,
        legacyLeaderboard: legacyLeaderboardSnapshot.exists
          ? serializeFirestoreValue(legacyLeaderboardSnapshot.data())
          : null,
        serverRateLimit: rateLimitSnapshot.exists
          ? serializeFirestoreValue(rateLimitSnapshot.data())
          : null,
        quizSessions,
        roundReceipts,
        hostedLobbies,
        hostedLegacyLobbies,
        playerOneDuels,
        playerTwoDuels,
      },
      redactions: {
        quizSessionAnswerKeys: 'excluded-security-secret',
      },
      limits: {
        documentsPerExportedCollection: 500,
        note: 'Bei ungewöhnlich großen Konten kann für einen vollständigen Export eine Support-Anfrage erforderlich sein.',
      },
    };
  },
);

export const deleteMyAccount = onCall(
  { enforceAppCheck, timeoutSeconds: 120, memory: '256MiB' },
  async (request) => {
    const uid = requireUid(request);
    requireRecentAuthentication(request);

    // Delete queryable user-owned documents first. This is intentionally
    // privacy-first: a retry remains safe if a previous attempt stopped after
    // Firestore deletion but before the Authentication record was removed.
    const deletedCounts = {
      quizSessions: await deleteOwnedByField('quizSessions', 'uid', uid),
      roundReceipts: await deleteOwnedByField('roundReceipts', 'uid', uid),
      hostedLobbies: await deleteOwnedByField('lobbies', 'hostId', uid),
      hostedLegacyLobbies: await deleteOwnedByField('lobbies', 'hostUid', uid),
      playerOneDuels: await deleteOwnedByField('duels', 'player1Uid', uid),
      playerTwoDuels: await deleteOwnedByField('duels', 'player2Uid', uid),
    };

    const batch = db.batch();
    batch.delete(db.collection('users').doc(uid));
    batch.delete(db.collection('trustedLeaderboard').doc(uid));
    batch.delete(db.collection('leaderboard').doc(uid));
    batch.delete(db.collection('serverRateLimits').doc(uid));
    await batch.commit();

    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';
      if (code !== 'auth/user-not-found') {
        throw new HttpsError(
          'internal',
          'Die gespeicherten App-Daten wurden gelöscht, aber das Login-Konto konnte nicht vollständig entfernt werden. Bitte kontaktiere den Support.',
        );
      }
    }

    return {
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedCounts,
    };
  },
);
