import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const failures: string[] = [];

const firebaseConfig = JSON.parse(
  await readFile(resolve(repoRoot, 'firebase.json'), 'utf8'),
) as Record<string, unknown>;
const firebaseRc = JSON.parse(
  await readFile(resolve(repoRoot, '.firebaserc'), 'utf8'),
) as Record<string, unknown>;
const releaseChecker = await readFile(
  resolve(repoRoot, 'wissenpur/scripts/check-release-env.mjs'),
  'utf8',
);
const main = await readFile(
  resolve(repoRoot, 'wissenpur/src/main.tsx'),
  'utf8',
);
const indexHtml = await readFile(
  resolve(repoRoot, 'wissenpur/index.html'),
  'utf8',
);

const hosting = firebaseConfig.hosting;
if (!hosting || typeof hosting !== 'object' || Array.isArray(hosting)) {
  failures.push('firebase.json: Hosting-Konfiguration fehlt.');
} else {
  const data = hosting as Record<string, unknown>;
  const predeploy = Array.isArray(data.predeploy)
    ? data.predeploy.filter((value): value is string => typeof value === 'string')
    : [];
  if (!predeploy.some((value) => value.includes('wissenpur run build:release'))) {
    failures.push('firebase.json: Hosting muss vor jedem Deploy build:release ausführen.');
  }

  const headers = Array.isArray(data.headers)
    ? data.headers.filter((value): value is Record<string, unknown> =>
        Boolean(value) && typeof value === 'object' && !Array.isArray(value),
      )
    : [];
  const globalHeaderBlock = headers.find((entry) => entry.source === '**');
  const globalHeaders = globalHeaderBlock && Array.isArray(globalHeaderBlock.headers)
    ? globalHeaderBlock.headers.filter((value): value is Record<string, unknown> =>
        Boolean(value) && typeof value === 'object' && !Array.isArray(value),
      )
    : [];
  const globalKeys = new Set(
    globalHeaders
      .map((entry) => typeof entry.key === 'string' ? entry.key.toLowerCase() : '')
      .filter(Boolean),
  );

  for (const requiredHeader of [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
    'x-permitted-cross-domain-policies',
    'x-dns-prefetch-control',
  ]) {
    if (!globalKeys.has(requiredHeader)) {
      failures.push(`firebase.json: Sicherheitsheader ${requiredHeader} fehlt.`);
    }
  }

  const globalHeaderValue = (key: string): string => {
    const header = globalHeaders.find((entry) =>
      typeof entry.key === 'string' && entry.key.toLowerCase() === key.toLowerCase(),
    );
    return typeof header?.value === 'string' ? header.value : '';
  };

  if (globalHeaderValue('X-Permitted-Cross-Domain-Policies').toLowerCase() !== 'none') {
    failures.push('firebase.json: X-Permitted-Cross-Domain-Policies muss none sein.');
  }
  if (globalHeaderValue('X-DNS-Prefetch-Control').toLowerCase() !== 'off') {
    failures.push('firebase.json: X-DNS-Prefetch-Control muss off sein.');
  }

  const findHeaderValue = (source: string, key: string): string => {
    const block = headers.find((entry) => entry.source === source);
    if (!block || !Array.isArray(block.headers)) return '';
    const header = block.headers.find((value) =>
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof (value as Record<string, unknown>).key === 'string' &&
      ((value as Record<string, unknown>).key as string).toLowerCase() === key.toLowerCase(),
    ) as Record<string, unknown> | undefined;
    return typeof header?.value === 'string' ? header.value : '';
  };

  for (const source of ['/', '/index.html', '/sw.js']) {
    const cacheControl = findHeaderValue(source, 'Cache-Control').toLowerCase();
    if (!cacheControl.includes('no-cache') || !cacheControl.includes('no-store')) {
      failures.push(`firebase.json: ${source} muss no-cache und no-store verwenden.`);
    }
  }
  if (findHeaderValue('/sw.js', 'Service-Worker-Allowed') !== '/') {
    failures.push('firebase.json: Service-Worker-Allowed muss / sein.');
  }
  const assetCache = findHeaderValue('/assets/**', 'Cache-Control').toLowerCase();
  if (!assetCache.includes('immutable') || !assetCache.includes('31536000')) {
    failures.push('firebase.json: Fingerprinted Assets benötigen einjähriges immutable Caching.');
  }

  const rewrites = Array.isArray(data.rewrites)
    ? data.rewrites.filter((value): value is Record<string, unknown> =>
        Boolean(value) && typeof value === 'object' && !Array.isArray(value),
      )
    : [];
  if (!rewrites.some((entry) => entry.source === '**' && entry.destination === '/index.html')) {
    failures.push('firebase.json: SPA-Rewrite auf /index.html fehlt.');
  }
}

const projects = firebaseRc.projects;
if (!projects || typeof projects !== 'object' || Array.isArray(projects)) {
  failures.push('.firebaserc: Projektaliases fehlen.');
} else if ('default' in projects) {
  failures.push('.firebaserc: Ein Default-Projektalias ist für Releases verboten.');
}

for (const requiredReleaseGate of [
  'RELEASE_EXPECTED_FIREBASE_PROJECT_ID',
  'RELEASE_FIREBASE_PROJECT_REVIEW_CONFIRMED',
  'VITE_LEGAL_REVIEW_CONFIRMED',
  'VITE_RECAPTCHA_ENTERPRISE_SITE_KEY',
]) {
  if (!releaseChecker.includes(requiredReleaseGate)) {
    failures.push(`check-release-env.mjs: Release-Gate ${requiredReleaseGate} fehlt.`);
  }
}

if (!main.includes('<AppErrorBoundary>')) {
  failures.push('wissenpur/src/main.tsx: Globale AppErrorBoundary fehlt.');
}
if (!/<html\s+lang=["']de-DE["']/.test(indexHtml)) {
  failures.push('wissenpur/index.html: Dokumentensprache muss de-DE sein.');
}

if (failures.length > 0) {
  console.error('\nWissenPur-Hostingprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log('Hosting-Sicherheitsheader, Privacy-Header, Cache-Regeln, Sprache und Release-Gates geprüft.');
