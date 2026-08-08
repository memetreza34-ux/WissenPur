import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];
const avatarUrls = [
  '/avatars/aneka.svg',
  '/avatars/jude.svg',
  '/avatars/avery.svg',
  '/avatars/robot-blue.svg',
  '/avatars/robot-gold.svg',
] as const;

const [serviceWorker, main, indexHtml, manifestText, iconSvg, maskableSvg, firebaseText] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/public/sw.js'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/index.html'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/public/manifest.json'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/public/wissenpur-icon.svg'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/public/wissenpur-maskable-icon.svg'), 'utf8'),
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

const requireText = (
  file: string,
  content: string,
  expected: string,
  explanation: string,
) => {
  if (!content.includes(expected)) failures.push(`${file}: ${explanation}`);
};

const forbid = (
  file: string,
  content: string,
  pattern: RegExp,
  explanation: string,
) => {
  if (pattern.test(content)) failures.push(`${file}: ${explanation}`);
};

requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "const CACHE_VERSION = 'wissenpur-v5';",
  'Lokale Shop-Avatare benötigen die aktuelle Cache-Version.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  'const VITE_ASSET_PATTERN =',
  'Der Installpfad muss die von Vite erzeugten gehashten Assets erkennen.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "const indexResponse = await fetch(reloadRequest('/index.html'));",
  'Der Installpfad muss die tatsächlich gebaute index.html frisch laden.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  'const assetUrls = [...html.matchAll(VITE_ASSET_PATTERN)]',
  'Gehashtes JavaScript und CSS müssen aus der gebauten App-Shell extrahiert werden.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  'await cache.addAll(uniqueAssetUrls.map(reloadRequest));',
  'Die beim Build referenzierten Assets müssen bereits während der Installation gecacht werden.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "cache.put('/index.html', indexResponse.clone())",
  'Die Offline-App-Shell muss die gebaute index.html enthalten.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "cache.put('/', indexResponse.clone())",
  'Die Root-Navigation muss direkt durch die gecachte App-Shell abgedeckt sein.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  'event.waitUntil(networkResponsePromise.then(() => undefined));',
  'Stale-while-revalidate muss die Hintergrundaktualisierung am Leben halten.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  'return networkResponse || offlineResponse();',
  'Ein Netzfehler ohne Cache muss immer eine gültige Response liefern.',
);
forbid(
  'wissenpur/public/sw.js',
  serviceWorker,
  /networkResponsePromise\s*\|\||\|\|\s*Response\.error\(\)/,
  'Promises dürfen nicht per Wahrheitswert als vermeintliche Offline-Response verwendet werden.',
);

for (const avatarUrl of avatarUrls) {
  requireText(
    'wissenpur/public/sw.js',
    serviceWorker,
    `'${avatarUrl}'`,
    `${avatarUrl} muss Teil der Offline-App-Shell sein.`,
  );
  try {
    await access(resolve(repoRoot, 'wissenpur/public', avatarUrl.slice(1)));
  } catch {
    failures.push(`wissenpur/public${avatarUrl}: Versioniertes Avatar-Asset fehlt.`);
  }
}

requireText(
  'wissenpur/src/main.tsx',
  main,
  "navigator.serviceWorker.register('/sw.js', { scope: '/' })",
  'Die gebündelte Anwendung muss den Service Worker explizit mit Root-Scope registrieren.',
);
forbid(
  'wissenpur/index.html',
  indexHtml,
  /<script(?![^>]*type=["']module["'][^>]*src=)[^>]*>[\s\S]*?<\/script>/i,
  'Die statische App-Shell darf kein Inline-JavaScript enthalten.',
);
for (const [expected, explanation] of [
  ['<link rel="manifest" href="/manifest.json" />', 'Die App-Shell muss das Web-App-Manifest verknüpfen.'],
  ['<meta name="mobile-web-app-capable" content="yes" />', 'Die mobile Installationsmetadaten fehlen.'],
  ['<meta name="apple-mobile-web-app-capable" content="yes" />', 'Der iOS-Standalone-Hinweis fehlt.'],
  ['<meta name="apple-mobile-web-app-title" content="WissenPur" />', 'Der iOS-App-Name fehlt.'],
  ['<meta name="color-scheme" content="light dark" />', 'Browser-Oberflächen sollen beide Farbschemata kennen.'],
] as const) {
  requireText('wissenpur/index.html', indexHtml, expected, explanation);
}

if (manifest.start_url !== '/' || manifest.scope !== '/' || manifest.id !== '/') {
  failures.push('wissenpur/public/manifest.json: id, start_url und scope müssen konsistent auf / zeigen.');
}
if (manifest.display !== 'standalone') {
  failures.push('wissenpur/public/manifest.json: Die PWA muss im standalone-Modus starten.');
}
if (typeof manifest.name !== 'string' || typeof manifest.short_name !== 'string') {
  failures.push('wissenpur/public/manifest.json: name und short_name müssen gesetzt sein.');
}
if (typeof manifest.background_color !== 'string' || typeof manifest.theme_color !== 'string') {
  failures.push('wissenpur/public/manifest.json: Hintergrund- und Theme-Farbe fehlen.');
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  failures.push('wissenpur/public/manifest.json: Normales und maskierbares App-Icon werden benötigt.');
} else {
  const anyIcon = manifest.icons.find((icon) => icon.purpose === 'any');
  const maskableIcon = manifest.icons.find((icon) => icon.purpose === 'maskable');
  if (anyIcon?.src !== '/wissenpur-icon.svg' || anyIcon.type !== 'image/svg+xml') {
    failures.push('wissenpur/public/manifest.json: Das normale SVG-App-Icon ist falsch konfiguriert.');
  }
  if (maskableIcon?.src !== '/wissenpur-maskable-icon.svg' || maskableIcon.type !== 'image/svg+xml') {
    failures.push('wissenpur/public/manifest.json: Das dedizierte maskierbare SVG-Icon ist falsch konfiguriert.');
  }
}

requireText(
  'wissenpur/public/wissenpur-icon.svg',
  iconSvg,
  'viewBox="0 0 512 512"',
  'Das normale SVG-Icon benötigt eine quadratische 512er Zeichenfläche.',
);
requireText(
  'wissenpur/public/wissenpur-maskable-icon.svg',
  maskableSvg,
  '<rect width="512" height="512" fill="url(#background)"/>',
  'Das maskierbare Icon benötigt einen vollflächigen Hintergrund ohne transparente Randzone.',
);
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "'/wissenpur-maskable-icon.svg'",
  'Das maskierbare Icon muss Teil der Offline-App-Shell sein.',
);

const headersFor = (source: string) => firebase.hosting?.headers?.find(
  (entry) => entry.source === source,
)?.headers || [];
const headerValue = (source: string, key: string) => new Map(
  headersFor(source).map((entry) => [entry.key, entry.value]),
).get(key);

for (const source of ['/', '/index.html']) {
  if (headerValue(source, 'Cache-Control') !== 'no-cache, no-store, must-revalidate') {
    failures.push(`firebase.json: ${source} muss ohne langlebigen HTTP-Cache ausgeliefert werden.`);
  }
}
if (headerValue('/sw.js', 'Cache-Control') !== 'no-cache, no-store, must-revalidate') {
  failures.push('firebase.json: /sw.js muss ohne Browsercache ausgeliefert werden.');
}
if (headerValue('/sw.js', 'Service-Worker-Allowed') !== '/') {
  failures.push('firebase.json: Der Service Worker benötigt explizit den Root-Scope.');
}
if (headerValue('/assets/**', 'Cache-Control') !== 'public, max-age=31536000, immutable') {
  failures.push('firebase.json: Gehashte Vite-Assets müssen langfristig immutable gecacht werden.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-PWA-Prüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('PWA-App-Shell, Build-Asset-Precache, lokale Shop-Avatare, Installationsmetadaten, Icons, Cacheheader und Offline-Antworten geprüft.');
