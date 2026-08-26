import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [banner, main] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/components/ConnectivityBanner.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
]);

assert.match(main, /import \{ ConnectivityBanner \} from ['"]\.\/components\/ConnectivityBanner['"]/);
assert.match(main, /<ConnectivityBanner\s*\/>/);
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

console.log('Offline-/Online-Banner, Listener-Cleanup und barrierefreie Statusmeldungen geprüft.');
