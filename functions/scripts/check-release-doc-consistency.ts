import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const read = (path: string) => readFile(resolve(repoRoot, path), 'utf8');

const [
  rootReadme,
  appReadme,
  functionsReadme,
  firebaseChecklist,
  pwaChecklist,
  roadmap,
  releaseStatus,
  accountPrivacy,
  productionPreflightDoc,
  releaseApp,
  leaderboardCore,
  functionsDatabase,
] = await Promise.all([
  read('README.md'),
  read('wissenpur/README.md'),
  read('functions/README.md'),
  read('wissenpur/docs/FIREBASE_RELEASE_CHECKLIST.md'),
  read('wissenpur/docs/PWA_RELEASE_CHECKLIST.md'),
  read('wissenpur/docs/PRODUCT_RELEASE_ROADMAP.md'),
  read('wissenpur/docs/README_RELEASE_STATUS.md'),
  read('wissenpur/docs/ACCOUNT_PRIVACY.md'),
  read('wissenpur/docs/PRODUCTION_PREFLIGHT.md'),
  read('wissenpur/src/ReleaseApp.tsx'),
  read('functions/src/leaderboardPublicCore.ts'),
  read('functions/src/database.ts'),
]);

// The active product entry must remain the release application, not the archived
// demo monolith.
assert.match(releaseApp, /export default function ReleaseApp\(\)/);
assert.match(appReadme, /`src\/ReleaseApp\.tsx`/);
assert.doesNotMatch(
  appReadme,
  /App\.tsx\s+Aktuelle Hauptanwendung/,
  'Die App-README darf die alte Demo-App nicht wieder als aktiven Release-Einstieg dokumentieren.',
);

// Package reproducibility is repository-wide: one stale frontend lock and two
// currently missing lockfiles are all release blockers until regenerated.
for (const [name, doc] of [
  ['Root-README', rootReadme],
  ['Firebase-Checkliste', firebaseChecklist],
  ['Produkt-Roadmap', roadmap],
  ['Release-Status', releaseStatus],
] as const) {
  for (const lockPath of [
    'wissenpur/package-lock.json',
    'functions/package-lock.json',
    'rules-tests/package-lock.json',
  ]) {
    assert.ok(doc.includes(lockPath), `${name} muss den Lockfile-Blocker ${lockPath} nennen.`);
  }
}
assert.doesNotMatch(
  roadmap,
  /Frontend-Lockfile-Konsistenz/,
  'Die Roadmap darf den repositoryweiten Package-Lock-Gate nicht wieder als reinen Frontend-Gate beschreiben.',
);

// trustedLeaderboard is callable-only. Direct Firestore reads are intentionally
// denied, while the callable sanitizes public output.
assert.match(leaderboardCore, /sanitizePublicLeaderboardAvatar/);
assert.ok(
  leaderboardCore.includes('return /^\\/avatars\\/'),
  'Leaderboard-Sanitizer muss Avatare weiterhin auf lokale /avatars/-Assets begrenzen.',
);
assert.match(firebaseChecklist, /Browser \*\*weder lesbar noch beschreibbar\*\*/);
assert.match(functionsReadme, /Browser-Direktreads und -writes gesperrt/);
for (const [name, doc] of [
  ['Firebase-Checkliste', firebaseChecklist],
  ['Functions-README', functionsReadme],
] as const) {
  assert.doesNotMatch(
    doc,
    /trustedLeaderboard[^\n]{0,120}public-read/i,
    `${name} darf trustedLeaderboard nicht als public-read dokumentieren.`,
  );
  assert.doesNotMatch(
    doc,
    /Identity-Provider[^\n]{0,160}(?:Profilbild|HTTPS-Bild)/i,
    `${name} darf externe Providerbilder nicht als Ranglistenavatar freigeben.`,
  );
}

// Provider photo URLs may exist in Firebase Auth, but the hardened release CSP
// and CSS fallback must not be documented as an active external image path.
assert.match(accountPrivacy, /Produktions-CSP erlaubt Bilder nur von derselben Origin sowie `data:`\/`blob:`/);
assert.match(accountPrivacy, /neutralen lokalen Buchstaben-Fallback/);
assert.doesNotMatch(
  accountPrivacy,
  /Google-Profilbild[^\n]{0,180}weiterhin[^\n]{0,80}angezeigt/i,
  'Account-Privacy darf externe Google-Profilbilder nicht als sichtbaren Produktionspfad dokumentieren.',
);
assert.match(accountPrivacy, /Konto A → Konto B/);
assert.match(accountPrivacy, /Lernanalyse und deren Owner-Marker direkt entfernt/);

// Production Firestore is always (default); named DBs are emulator-only.
assert.match(functionsDatabase, /Production Functions must use Firestore \(default\)/);
assert.match(functionsDatabase, /Named databases are allowed only in the local emulator/);
assert.match(functionsReadme, /Produktion verwendet \*\*immer\*\* die Firestore-Standarddatenbank `\(default\)`/);

// PWA binary assets are committed and statically verified. Only real-device
// verification remains open.
for (const [name, doc] of [
  ['PWA-Checkliste', pwaChecklist],
  ['Firebase-Checkliste', firebaseChecklist],
  ['Produkt-Roadmap', roadmap],
] as const) {
  assert.doesNotMatch(
    doc,
    /PNG-(?:PWA-)?Icons?[^\n]{0,80}(?:fehlen|ergänzen)/i,
    `${name} darf committed PNG-App-Icons nicht wieder als fehlend markieren.`,
  );
  assert.doesNotMatch(
    doc,
    /Apple-Touch[^\n]{0,80}(?:fehlt|fehlen|ergänzen)/i,
    `${name} darf das committed Apple-Touch-PNG nicht wieder als fehlend markieren.`,
  );
}
assert.match(pwaChecklist, /verbleibende PWA-Blocker ist die reale Geräteverifikation/i);

// AI generation fails closed for invalid output and production additionally
// requires project-side authenticated-users mode, a reduced per-user quota,
// monitoring and budget guard confirmation.
assert.doesNotMatch(
  firebaseChecklist,
  /KI-Fallback bei blockierter|fällt[^\n]{0,100}auf die lokalen Fragen zurück/i,
  'Die Firebase-Checkliste darf keinen stillen lokalen KI-Ersatzpfad behaupten.',
);
assert.match(firebaseChecklist, /kein automatischer lokaler KI-Fallback/i);
assert.match(appReadme, /kein automatischer lokaler KI-Ersatz/i);
for (const [name, doc] of [
  ['Firebase-Checkliste', firebaseChecklist],
  ['Produktions-Preflight', productionPreflightDoc],
] as const) {
  assert.match(doc, /Authenticated-users mode/, `${name} muss den projektseitigen AI-Login-Schutz dokumentieren.`);
  assert.match(doc, /RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED/, `${name} muss die AI-Auth-Freigabe dokumentieren.`);
  assert.match(doc, /RELEASE_AI_RATE_LIMIT_RPM/, `${name} muss das per-user AI-Limit dokumentieren.`);
  assert.match(doc, /RELEASE_AI_MONITORING_CONFIRMED/, `${name} muss AI-Monitoring als Release-Grenze dokumentieren.`);
  assert.match(doc, /RELEASE_BUDGET_GUARDS_CONFIRMED/, `${name} muss Budgetschutz als Release-Grenze dokumentieren.`);
}

console.log('Release-Dokumentation stimmt mit ReleaseApp-, Account-, Leaderboard-, Firestore-, Lockfile-, PWA- und KI-Grenzen überein.');
