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

const [secureSubmit, economyCallables, economyCore] = await Promise.all([
  readFile(resolve(repoRoot, 'functions/src/secureSubmit.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCallables.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/src/economyCore.ts'), 'utf8'),
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

console.log('Shop- und Leaderboard-Avatare sind auf lokale, versionierte SVG-Assets begrenzt.');
