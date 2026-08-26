import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const publicRoot = resolve(repoRoot, 'wissenpur/public');
const failures: string[] = [];
const avatarUrls = [
  '/avatars/aneka.svg',
  '/avatars/jude.svg',
  '/avatars/avery.svg',
  '/avatars/robot-blue.svg',
  '/avatars/robot-gold.svg',
] as const;
const pngAssets = [
  { url: '/wissenpur-icon-192.png', width: 192, height: 192 },
  { url: '/wissenpur-icon-512.png', width: 512, height: 512 },
  { url: '/wissenpur-maskable-icon-512.png', width: 512, height: 512 },
  { url: '/apple-touch-icon.png', width: 180, height: 180 },
] as const;

const [serviceWorker, main, indexHtml, manifestText, iconSvg, maskableSvg, firebaseText] = await Promise.all([
  readFile(resolve(publicRoot, 'sw.js'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/index.html'), 'utf8'),
  readFile(resolve(publicRoot, 'manifest.json'), 'utf8'),
  readFile(resolve(publicRoot, 'wissenpur-icon.svg'), 'utf8'),
  readFile(resolve(publicRoot, 'wissenpur-maskable-icon.svg'), 'utf8'),
  readFile(resolve(repoRoot, 'firebase.json'), 'utf8'),
]);

const manifest = JSON.parse(manifestText) as {
  id?: unknown;
  start_url?: unknown;
  scope?: unknown;
  display?: unknown;
  name?: unknown;
  short_name?: unknown;
  background_color?: unknown;
  theme_color?: unknown;
  icons?: Array<Record<string, unknown>>;
};
const firebase = JSON.parse(firebaseText) as {
  hosting?: {
    headers?: Array<{
      source?: string;
      headers?: Array<{ key?: string; value?: string }>;
    }>;
  };
};

const requireText = (file: string, content: string, expected: string, explanation: string) => {
  if (!content.includes(expected)) failures.push(`${file}: ${explanation}`);
};
const forbid = (file: string, content: string, pattern: RegExp, explanation: string) => {
  if (pattern.test(content)) failures.push(`${file}: ${explanation}`);
};

requireText('wissenpur/public/sw.js', serviceWorker, "const CACHE_VERSION = 'wissenpur-v7';", 'Navigation-Privacy und PNG-App-Assets benötigen Cache-Version v7.');
requireText('wissenpur/public/sw.js', serviceWorker, "const APP_CACHE_PREFIX = 'wissenpur-';", 'Cache-Cleanup muss auf WissenPur-eigene Caches begrenzt sein.');
for (const expected of [
  'const VITE_ASSET_PATTERN =',
  "const indexResponse = await fetch(reloadRequest('/index.html'));",
  'const assetUrls = [...html.matchAll(VITE_ASSET_PATTERN)]',
  'await cache.addAll(uniqueAssetUrls.map(reloadRequest));',
  "cache.put('/index.html', indexResponse.clone())",
  "cache.put('/', indexResponse.clone())",
  'event.waitUntil(networkResponsePromise.then(() => undefined));',
  'return networkResponse || offlineResponse();',
  'cacheName.startsWith(APP_CACHE_PREFIX)',
  '!cacheName.startsWith(CACHE_VERSION)',
]) requireText('wissenpur/public/sw.js', serviceWorker, expected, `PWA-Runtime-Baustein fehlt: ${expected}`);
forbid('wissenpur/public/sw.js', serviceWorker, /networkResponsePromise\s*\|\||\|\|\s*Response\.error\(\)/, 'Promises dürfen nicht als Offline-Response verwendet werden.');
forbid(
  'wissenpur/public/sw.js',
  serviceWorker,
  /async function networkFirstNavigation[\s\S]{0,700}cache\.put\(request/,
  'Navigationen dürfen nicht unter vollständigen URLs oder Querystrings im Runtime-Cache gespeichert werden.',
);
forbid(
  'wissenpur/public/sw.js',
  serviceWorker,
  /\.filter\(\(cacheName\) => !cacheName\.startsWith\(CACHE_VERSION\)\)/,
  'Cache-Cleanup darf nicht pauschal fremde Origin-Caches löschen.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "const appShell = await caches.match('/index.html');",
  'Offline-Navigation muss ausschließlich auf die feste App-Shell zurückfallen.',
);

for (const avatarUrl of avatarUrls) {
  requireText('wissenpur/public/sw.js', serviceWorker, `'${avatarUrl}'`, `${avatarUrl} muss offline gecacht werden.`);
  try { await access(resolve(publicRoot, avatarUrl.slice(1))); } catch { failures.push(`wissenpur/public${avatarUrl}: Avatar fehlt.`); }
}

const pngSignature = '89504e470d0a1a0a';
for (const asset of pngAssets) {
  const path = resolve(publicRoot, asset.url.slice(1));
  try {
    const buffer = await readFile(path);
    if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) {
      failures.push(`wissenpur/public${asset.url}: Keine gültige PNG-Signatur.`);
      continue;
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width !== asset.width || height !== asset.height) {
      failures.push(`wissenpur/public${asset.url}: Erwartet ${asset.width}x${asset.height}, gefunden ${width}x${height}.`);
    }
    requireText('wissenpur/public/sw.js', serviceWorker, `'${asset.url}'`, `${asset.url} muss Teil der Offline-App-Shell sein.`);
  } catch {
    failures.push(`wissenpur/public${asset.url}: Versioniertes PNG-Asset fehlt.`);
  }
}

requireText('wissenpur/src/main.tsx', main, "navigator.serviceWorker.register('/sw.js', { scope: '/' })", 'Service Worker muss Root-Scope besitzen.');
forbid('wissenpur/index.html', indexHtml, /<script(?![^>]*type=["']module["'][^>]*src=)[^>]*>[\s\S]*?<\/script>/i, 'Statische App-Shell darf kein Inline-JavaScript enthalten.');
for (const expected of [
  '<link rel="manifest" href="/manifest.json" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="WissenPur" />',
  '<meta name="color-scheme" content="light dark" />',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
]) requireText('wissenpur/index.html', indexHtml, expected, `Installationsmetadatum fehlt: ${expected}`);

if (manifest.start_url !== '/' || manifest.scope !== '/' || manifest.id !== '/') failures.push('manifest.json: id/start_url/scope müssen / sein.');
if (manifest.display !== 'standalone') failures.push('manifest.json: display muss standalone sein.');
if (typeof manifest.name !== 'string' || typeof manifest.short_name !== 'string') failures.push('manifest.json: name/short_name fehlen.');
if (typeof manifest.background_color !== 'string' || typeof manifest.theme_color !== 'string') failures.push('manifest.json: Farben fehlen.');
const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
for (const expected of [
  ['/wissenpur-icon-192.png', '192x192', 'image/png', 'any'],
  ['/wissenpur-icon-512.png', '512x512', 'image/png', 'any'],
  ['/wissenpur-maskable-icon-512.png', '512x512', 'image/png', 'maskable'],
] as const) {
  if (!icons.some((icon) => icon.src === expected[0] && icon.sizes === expected[1] && icon.type === expected[2] && icon.purpose === expected[3])) {
    failures.push(`manifest.json: PNG-Icon ${expected[0]} ist nicht korrekt verdrahtet.`);
  }
}
if (!icons.some((icon) => icon.src === '/wissenpur-icon.svg' && icon.type === 'image/svg+xml')) failures.push('manifest.json: SVG-Fallback fehlt.');
if (!icons.some((icon) => icon.src === '/wissenpur-maskable-icon.svg' && icon.purpose === 'maskable')) failures.push('manifest.json: maskierbarer SVG-Fallback fehlt.');

requireText('wissenpur/public/wissenpur-icon.svg', iconSvg, 'viewBox="0 0 512 512"', 'Normales SVG benötigt 512er Zeichenfläche.');
requireText('wissenpur/public/wissenpur-maskable-icon.svg', maskableSvg, '<rect width="512" height="512" fill="url(#background)"/>', 'Maskable SVG benötigt vollflächigen Hintergrund.');

const headersFor = (source: string) => firebase.hosting?.headers?.find((entry) => entry.source === source)?.headers || [];
const headerValue = (source: string, key: string) => new Map(headersFor(source).map((entry) => [entry.key, entry.value])).get(key);
for (const source of ['/', '/index.html']) {
  if (headerValue(source, 'Cache-Control') !== 'no-cache, no-store, must-revalidate') failures.push(`firebase.json: ${source} darf nicht langlebig gecacht werden.`);
}
if (headerValue('/sw.js', 'Cache-Control') !== 'no-cache, no-store, must-revalidate') failures.push('firebase.json: /sw.js darf nicht gecacht werden.');
if (headerValue('/sw.js', 'Service-Worker-Allowed') !== '/') failures.push('firebase.json: Service-Worker-Allowed muss / sein.');
if (headerValue('/assets/**', 'Cache-Control') !== 'public, max-age=31536000, immutable') failures.push('firebase.json: Gehashte Assets müssen immutable sein.');

if (failures.length > 0) {
  console.error('\nWissenPur-PWA-Prüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('PWA-v7: App-Shell, Navigation-Privacy, scoped Cache-Cleanup, Build-Asset-Precache, lokale Avatare, PNG-Maße, Apple-Touch-Icon und Cacheheader geprüft.');
