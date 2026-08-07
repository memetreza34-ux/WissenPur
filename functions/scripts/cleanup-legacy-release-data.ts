import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldPath, getFirestore, type CollectionReference } from 'firebase-admin/firestore';

const LEGACY_COLLECTIONS = [
  'leaderboard',
  'lobbies',
  'duels',
  'roundReceipts',
] as const;

const APPLY_FLAG = '--apply';
const CONFIRM_PHRASE = 'DELETE-WISSENPUR-LEGACY-DATA';
const PAGE_SIZE = 200;

const args = new Set(process.argv.slice(2));
const apply = args.has(APPLY_FLAG);
const targetProjectId = process.env.WISSENPUR_TARGET_PROJECT_ID?.trim();
const confirmedProjectId = process.env.WISSENPUR_CONFIRM_PROJECT_ID?.trim();
const confirmPhrase = process.env.WISSENPUR_CONFIRM_LEGACY_CLEANUP?.trim();

if (!targetProjectId) {
  throw new Error(
    'WISSENPUR_TARGET_PROJECT_ID fehlt. Das Cleanup benötigt immer eine explizite Ziel-Projekt-ID.',
  );
}

if (apply) {
  if (confirmedProjectId !== targetProjectId) {
    throw new Error(
      'Abbruch: WISSENPUR_CONFIRM_PROJECT_ID muss exakt der Ziel-Projekt-ID entsprechen.',
    );
  }
  if (confirmPhrase !== CONFIRM_PHRASE) {
    throw new Error(
      `Abbruch: WISSENPUR_CONFIRM_LEGACY_CLEANUP muss exakt ${CONFIRM_PHRASE} sein.`,
    );
  }
}

const app = getApps()[0] || initializeApp({
  credential: applicationDefault(),
  projectId: targetProjectId,
});
const db = getFirestore(app, '(default)');

const countDocuments = async (collection: CollectionReference): Promise<number> => {
  const snapshot = await collection.count().get();
  return snapshot.data().count;
};

const deleteCollection = async (collection: CollectionReference): Promise<number> => {
  let deleted = 0;
  let lastDocumentId: string | null = null;

  while (true) {
    let query = collection.orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (lastDocumentId) query = query.startAfter(lastDocumentId);

    const snapshot = await query.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();

    deleted += snapshot.size;
    lastDocumentId = snapshot.docs.at(-1)?.id || null;
    if (snapshot.size < PAGE_SIZE || !lastDocumentId) break;
  }

  return deleted;
};

console.log(`WissenPur Legacy-Cleanup für Projekt: ${targetProjectId}`);
console.log(`Modus: ${apply ? 'APPLY – Dokumente werden gelöscht' : 'DRY RUN – keine Schreiboperationen'}`);
console.log(`Firestore-Datenbank: (default)`);
console.log('Aktuelle quizSessions, users, trustedLeaderboard und serverRateLimits werden nicht angefasst.');

let totalFound = 0;
let totalDeleted = 0;

for (const collectionName of LEGACY_COLLECTIONS) {
  const collection = db.collection(collectionName);
  const found = await countDocuments(collection);
  totalFound += found;

  if (!apply) {
    console.log(`- ${collectionName}: ${found} Dokument(e) gefunden, 0 gelöscht`);
    continue;
  }

  const deleted = await deleteCollection(collection);
  totalDeleted += deleted;
  console.log(`- ${collectionName}: ${found} Dokument(e) gefunden, ${deleted} gelöscht`);
}

console.log('');
console.log(`Gesamt gefunden: ${totalFound}`);
console.log(`Gesamt gelöscht: ${totalDeleted}`);

if (!apply) {
  console.log('Dry Run abgeschlossen. Für echtes Löschen sind --apply und beide Bestätigungsvariablen erforderlich.');
}
