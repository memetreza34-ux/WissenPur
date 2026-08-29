import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeEconomy } from '../src/economyCore.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const legacy = normalizeEconomy({
  economyVersion: 0,
  totalPoints: 99_999,
  coins: 50_000,
  roundsPlayed: 900,
  correctAnswers: 8_000,
  totalQuestionsAnswered: 9_000,
}, '2026-08-07');
assert.equal(legacy.economyVersion, 1);
assert.equal(legacy.totalPoints, 0, 'Legacy-/Gastpunkte dürfen nicht in die authentifizierte Economy migrieren.');
assert.equal(legacy.coins, 0);
assert.equal(legacy.roundsPlayed, 0);
assert.equal(legacy.correctAnswers, 0);
assert.equal(legacy.totalQuestionsAnswered, 0);

const trusted = normalizeEconomy({
  economyVersion: 1,
  totalPoints: 420,
  coins: 33,
  roundsPlayed: 7,
}, '2026-08-07');
assert.equal(trusted.totalPoints, 420);
assert.equal(trusted.coins, 33);
assert.equal(trusted.roundsPlayed, 7);

const [callable, entry, economyService, firebaseService, storage, releaseApp, spinWheel] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/economyStateCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/entry.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/economyService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/storage.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/ReleaseApp.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/DailySpinWheel.tsx'), 'utf8'),
]);

assert.match(callable, /getMyEconomyState = onCall/);
assert.match(callable, /\{ enforceAppCheck \}/);
assert.match(callable, /normalizeEconomy\(userData, today\)/);
assert.match(callable, /transaction\.set\(userRef/);
assert.doesNotMatch(
  callable,
  /userData\.economyVersion !== state\.economyVersion/,
  'Auch vertrauenswürdige Economy-Dokumente müssen beim neuen Login durch Tages-/Wochen-Normalisierung laufen.',
);
assert.match(entry, /getMyEconomyState/);
assert.match(economyService, /functions,\s*'getMyEconomyState'/);
assert.match(economyService, /export const getServerEconomyState/);
assert.match(firebaseService, /const authoritativeEconomy = \(await getServerEconomyState\(\)\)\.stats;/);
assert.match(firebaseService, /mergeCloudStats\(profileMerged, authoritativeEconomy\)/);
assert.doesNotMatch(
  firebaseService,
  /existingData\.economyVersion === 1\s*\?/,
  'Rohe Firestore-Economy darf den Backend-Normalisierer beim Login nicht umgehen.',
);
assert.match(firebaseService, /let hydratedAuthUid: string \| null = null/);
assert.match(firebaseService, /onAuthStateChanged\(auth, \(user\) =>/);
assert.match(firebaseService, /if \(!nextUid \|\| nextUid !== hydratedAuthUid\)/);
assert.match(firebaseService, /hydratedAuthUid = null;/);
assert.match(firebaseService, /class AuthSessionChangedError extends Error/);
assert.match(firebaseService, /const assertActiveAuthUid = \(expectedUid: string\): void/);
assert.match(firebaseService, /assertActiveAuthUid\(expectedUid\);/);
assert.match(firebaseService, /if \(error instanceof AuthSessionChangedError\) return undefined;/);

const authoritativeIndex = firebaseService.indexOf('const authoritativeEconomy = (await getServerEconomyState()).stats;');
const persistIndex = firebaseService.indexOf('const persisted = await persistProfileOnly(hydratedStats, expectedUid);');
const markHydratedIndex = firebaseService.indexOf('hydratedAuthUid = expectedUid;');
const finalLocalSaveIndex = firebaseService.indexOf('saveStats(persisted);', markHydratedIndex);
assert.ok(authoritativeIndex >= 0 && persistIndex > authoritativeIndex, 'Server-Economy muss vor dem lokalen Persistieren vorliegen.');
assert.ok(markHydratedIndex > persistIndex, 'Hydrierung darf erst nach erfolgreichem Persistieren als abgeschlossen gelten.');
assert.ok(finalLocalSaveIndex > markHydratedIndex, 'Der finale lokale Economy-Stand darf erst nach erfolgreicher UID-Prüfung gespeichert werden.');

assert.match(storage, /if \(auth\.currentUser\) return stats;/);
assert.doesNotMatch(storage, /auth\.currentUser && stats\.economyVersion === 1/);

assert.match(releaseApp, /const maskEconomyUntilHydrated =/);
assert.match(releaseApp, /setStats\(maskEconomyUntilHydrated\(localBeforeHydration\)\)/);
assert.match(releaseApp, /const \[isAccountHydrating, setIsAccountHydrating\] = useState\(false\)/);
assert.match(releaseApp, /const authHydrationGenerationRef = useRef\(0\)/);
assert.match(releaseApp, /const hydrationGeneration = authHydrationGenerationRef\.current \+ 1;/);
assert.match(releaseApp, /authHydrationGenerationRef\.current = hydrationGeneration;/);
assert.match(releaseApp, /if \(authHydrationGenerationRef\.current !== hydrationGeneration\) return;/);
assert.match(
  releaseApp,
  /finally \{\s*if \(authHydrationGenerationRef\.current === hydrationGeneration\) \{\s*setIsAccountHydrating\(false\);/,
  'Eine alte Auth-Hydrierung darf den UI-Gate einer neueren Sitzung nicht freigeben.',
);
assert.match(releaseApp, /Kontofortschritt wird sicher geladen/);
assert.match(releaseApp, /Punkte und Münzen werden erst nach der serverseitigen Prüfung angezeigt/);
assert.match(releaseApp, /if \(isAccountHydrating\)/);
assert.match(releaseApp, /DailySpinWheel onClaimReward=\{\(\) => setStats\(getStats\(\) as ReleaseStats\)\}/);
assert.doesNotMatch(releaseApp, /DailySpinWheel[\s\S]{0,160}setTimeout/);

assert.match(spinWheel, /const berlinDateKey = \(\) =>/);
assert.match(spinWheel, /const expectedUid = auth\.currentUser\?\.uid;/);
assert.match(spinWheel, /if \(auth\.currentUser\?\.uid !== expectedUid\) \{\s*setIsSpinning\(false\);\s*return;/);
assert.match(spinWheel, /useEffect\(\(\) => \(\) => clearAnimationTimers\(\), \[\]\)/);
assert.match(
  spinWheel,
  /if \(getStats\(\)\.lastSpinDate !== berlinDateKey\(\)\) \{\s*setWonReward\(null\);\s*\}/,
  'Ein über Mitternacht geöffnetes Glücksrad muss den alten UI-Gewinn am neuen Berlin-Kalendertag freigeben.',
);
const spinSaveIndex = spinWheel.indexOf('saveStats(preserveLocalLearningData(result.stats));');
const spinCallbackIndex = spinWheel.indexOf('onClaimReward(result.reward);');
const spinFinishTimeoutIndex = spinWheel.indexOf('finishTimeoutRef.current = window.setTimeout');
assert.ok(spinSaveIndex >= 0 && spinCallbackIndex > spinSaveIndex, 'Das Glücksrad muss den autoritativen Serverstand vor dem Parent-Callback speichern.');
assert.ok(spinFinishTimeoutIndex > spinCallbackIndex, 'Die Animation darf erst nach dem accountgebundenen Datencommit geplant werden.');
const timeoutBody = spinWheel.slice(spinFinishTimeoutIndex);
assert.doesNotMatch(timeoutBody, /saveStats\(/, 'Ein Animationstimeout darf niemals verzögert Kontodaten schreiben.');
assert.match(timeoutBody, /auth\.currentUser\?\.uid !== expectedUid/);

console.log('Autoritative Economy-Hydrierung, UI-Generationssperre, Stale-Session-Sperre, accountgebundene Glücksrad-Persistenz, Tageswechsel-Freigabe, Legacy-Reset und signierte Local-Mutation-Sperre geprüft.');
