import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const [serviceWorker, main, indexHtml, manifestText, firebaseText] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/public/sw.js'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/index.html'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/public/manifest.json'), 'utf8'),
  readFile(resolve(repoRoot, 'firebase.json'), 'utf8'),
]);

const manifest = JSON.parse(manifestText) as Record<string, unknown>;
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
  "const CACHE_VERSION = 'wissenpur-v3';",
  'Sicherheits- und Offlineänderungen benötigen eine neue Cache-Version.',
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
requireText(
  'wissenpur/public/sw.js',
  serviceWorker,
  "new Request(url, { cache: 'reload' })",
  'Die App-Shell darf beim Installieren nicht aus einem veralteten HTTP-Cache stammen.',
);
forbid(
  'wissenpur/public/sw.js',
  serviceWorker,
  /networkResponsePromise\s*\|\||\|\|\s*Response\.error\(\)/,
  'Promises dürfen nicht per Wahrheitswert als vermeintliche Offline-Response verwendet werden.',
);

requireText(
  'wissenpur/src/main.tsx',
  main,
  "navigator.serviceWorker.register('/sw.js', { scope: '/' })",
  'Die gebündelte Anwendung muss den Service Worker mit Root-Scope registrieren.',
);
forbid(
  'wissenpur/index.html',
  indexHtml,
  /<script(?![^>]*type=["']module["'][^>]*src=)[^>]*>[\s\S]*?<\/script>/i,
  'Die statische App-Shell darf kein Inline-JavaScript enthalten.',
);
requireText(
  'wissenpur/index.html',
  indexHtml,
  '<link rel="manifest" href="/manifest.json" />',
  'Die App-Shell muss das Web-App-Manifest verknüpfen.',
);

if (manifest.start_url !== '/' || manifest.scope !== '/' || manifest.id !== '/') {
  failures.push('wissenpur/public/manifest.json: id, start_url und scope müssen konsistent auf / zeigen.');
}
if (manifest.display !== 'standalone') {
  failures.push('wissenpur/public/manifest.json: Die PWA muss im standalone-Modus starten.');
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 1) {
  failures.push('wissenpur/public/manifest.json: Mindestens ein App-Icon fehlt.');
}

const serviceWorkerHeaders = firebase.hosting?.headers?.find(
  (entry) => entry.source === '/sw.js',
)?.headers || [];
const headerMap = new Map(serviceWorkerHeaders.map((entry) => [entry.key, entry.value]));
if (headerMap.get('Cache-Control') !== 'no-cache, no-store, must-revalidate') {
  failures.push('firebase.json: /sw.js muss ohne Browsercache ausgeliefert werden.');
}
if (headerMap.get('Service-Worker-Allowed') !== '/') {
  failures.push('firebase.json: Der Service Worker benötigt explizit den Root-Scope.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-PWA-Prüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('PWA-App-Shell, Offline-Antworten, Cachewechsel und Hosting-Header geprüft.');
