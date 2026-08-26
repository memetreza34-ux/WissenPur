import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [banner, updateBanner, main] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/components/ConnectivityBanner.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/PwaUpdateBanner.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
]);

assert.match(main, /import \{ ConnectivityBanner \} from ['"]\.\/components\/ConnectivityBanner['"]/);
assert.match(main, /import \{ PwaUpdateBanner \} from ['"]\.\/components\/PwaUpdateBanner['"]/);
assert.match(main, /<ConnectivityBanner\s*\/>/);
assert.match(main, /<PwaUpdateBanner\s*\/>/);

assert.match(banner, /navigator\.onLine/);
assert.match(banner, /window\.addEventListener\('online', updateConnectivity\)/);
assert.match(banner, /window\.addEventListener\('offline', updateConnectivity\)/);
assert.match(banner, /window\.removeEventListener\('online', updateConnectivity\)/);
assert.match(banner, /window\.removeEventListener\('offline', updateConnectivity\)/);
assert.match(banner, /role="status"/);
assert.match(banner, /aria-live="polite"/);
assert.match(banner, /aria-atomic="true"/);
assert.match(banner, /lokale Lernsets, Karteikarten und Übungsfragen funktionieren weiter/);
assert.match(banner, /Rangliste, KI und gewertete Prüfungen benötigen Internet/);
assert.match(banner, /Wieder online – Online-Funktionen sind wieder verfügbar/);
assert.match(banner, /window\.clearTimeout\(restoredTimer\)/);

assert.match(updateBanner, /Boolean\(navigator\.serviceWorker\.controller\)/);
assert.match(updateBanner, /addEventListener\('controllerchange', handleControllerChange\)/);
assert.match(updateBanner, /removeEventListener\('controllerchange', handleControllerChange\)/);
assert.match(updateBanner, /if \(hasSeenController\)/);
assert.match(updateBanner, /setUpdateAvailable\(true\)/);
assert.match(updateBanner, /Neue WissenPur-Version verfügbar/);
assert.match(updateBanner, /window\.location\.reload\(\)/);
assert.match(updateBanner, /onClick=\{\(\) => setUpdateAvailable\(false\)\}/);
assert.match(updateBanner, /role="status"/);
assert.match(updateBanner, /aria-live="polite"/);
assert.doesNotMatch(
  updateBanner,
  /controllerchange[\s\S]{0,220}window\.location\.reload\(\)/,
  'Ein Service-Worker-Wechsel darf keine laufende Lernrunde automatisch neu laden.',
);

console.log('Offline-/Online-Banner, PWA-Update-Hinweis, Listener-Cleanup und barrierefreie Statusmeldungen geprüft.');
