import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOP_CATALOG } from '../src/economyCore.js';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const publicRoot = resolve(repoRoot, 'wissenpur/public');

const avatarItems = Object.entries(SHOP_CATALOG).filter(([, item]) => item.kind === 'avatar');
assert.equal(avatarItems.length, 5, 'Der veröffentlichte Shop muss fünf kontrollierte Avatar-Assets besitzen.');

for (const [itemId, item] of avatarItems) {
  assert.ok('url' in item && typeof item.url === 'string', `${itemId} benötigt einen lokalen Avatarpfad.`);
  const url = 'url' in item ? item.url : '';
  assert.match(url, /^\/avatars\/[a-z0-9-]+\.svg$/i, `${itemId} darf keinen externen Avatarhost verwenden.`);
  await access(resolve(publicRoot, url.slice(1)));
}

const [
  secureSubmit,
  economyCallables,
  economyCore,
  economyStateCallable,
  avatarEquipCore,
  avatarEquipCallable,
  entry,
  economyService,
  firebaseService,
  avatarManager,
  main,
  accountBoundary,
  firestoreRules,
] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/secureSubmit.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCallables.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCore.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyStateCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/avatarEquipCore.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/avatarEquipCallable.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/entry.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/economyService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/services/firebaseService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AvatarManagerPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountSessionBoundary.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/firestore.rules'), 'utf8'),
]);

for (const [name, source] of [
  ['secureSubmit.ts', secureSubmit],
  ['economyCallables.ts', economyCallables],
] as const) {
  assert.match(source, /safeLeaderboardAvatar/);
  assert.doesNotMatch(source, /authToken\?\.picture|providerPhoto/,
    `${name}: Trusted leaderboard darf keine Identity-Provider-Fotos speichern.`);
}

assert.doesNotMatch(economyCore, /dicebear|api\.dicebear\.com/i);
assert.match(economyCore, /LOCAL_AVATAR_URLS\.has\(customPhotoURL\)/);

assert.match(economyStateCallable, /photoURL: FieldValue\.delete\(\)/,
  'Autoritative Konto-Hydrierung muss historische Provider-photoURL-Felder aus users/{uid} entfernen.');
assert.doesNotMatch(firebaseService, /currentUser\.photoURL/,
  'Der Browser darf die Firebase-Auth-photoURL nicht zusätzlich in das Firestore-Profil spiegeln.');
assert.doesNotMatch(firebaseService, /cloudStats\.photoURL/,
  'Historische Provider-photoURL-Werte dürfen nicht zurück in den lokalen Lernzustand gemergt werden.');
const clientProfileRuleSection = firestoreRules.slice(
  firestoreRules.indexOf('function isValidClientProfile'),
  firestoreRules.indexOf('function isValidTrustedLeaderboard'),
);
assert.doesNotMatch(clientProfileRuleSection, /photoURL/,
  'Client-writable Nutzerprofile dürfen kein Provider-photoURL-Feld mehr akzeptieren.');

assert.match(avatarEquipCore, /avatarId === 'default'/);
assert.match(avatarEquipCore, /state\.unlockedAvatars\.includes\(avatarId\)/);
assert.match(avatarEquipCore, /item\.kind !== 'avatar'/);
assert.match(avatarEquipCore, /state\.customPhotoURL = item\.url/);
assert.doesNotMatch(avatarEquipCore, /state\.coins\s*[-+]=/,
  'Das Wechseln eines bereits gekauften Avatars darf keine Münzen verändern.');

assert.match(avatarEquipCallable, /enforceGlobalCallableRateLimit\(uid\)/);
assert.match(avatarEquipCallable, /equipAvatarItem\(currentState, avatarId\)/);
assert.match(avatarEquipCallable, /trustedLeaderboard/);
assert.match(avatarEquipCallable, /safeLocalAvatar/);
assert.match(entry, /export \{ equipShopAvatar \} from '\.\/avatarEquipCallable\.js';/);
assert.match(economyService, /equipShopAvatarCallable/);
assert.match(economyService, /export const equipServerShopAvatar/);

const purchaseBlock = economyCallables.match(
  /export const purchaseShopItem[\s\S]*?export const consumePowerUp/,
)?.[0] || '';
assert.match(purchaseBlock, /const leaderboardRef = db\.collection\('trustedLeaderboard'\)\.doc\(uid\)/);
assert.match(purchaseBlock, /transaction\.set\(\s*leaderboardRef,\s*leaderboardProfile\(uid, userData, purchase\.state, request\.auth\?\.token\)/);

for (const [itemId, item] of avatarItems) {
  assert.match(avatarManager, new RegExp(`id: '${itemId}'`));
  if ('url' in item) assert.ok(avatarManager.includes(`url: '${item.url}'`));
}
assert.match(avatarManager, /equipServerShopAvatar/);
assert.match(avatarManager, /purchaseServerShopItem/);
assert.match(avatarManager, /equip\('default'\)/);
assert.match(avatarManager, /Gekaufte Avatare kannst du jederzeit kostenlos wechseln/);
assert.match(avatarManager, /wissenpur:stats-updated/);
assert.match(main, /<AvatarManagerPanel\s*\/>/);
assert.match(accountBoundary, /wissenpur:stats-updated/);

console.log('Avatar-Privacy, Provider-Foto-Minimierung, lokale Assets, serverseitiger Besitzcheck, Kauf-Sync und kostenloser Equip-/Reset-Flow geprüft.');
