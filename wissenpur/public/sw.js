const CACHE_VERSION = 'wissenpur-v5';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = [
  '/manifest.json',
  '/wissenpur-icon.svg',
  '/wissenpur-maskable-icon.svg',
  '/avatars/aneka.svg',
  '/avatars/jude.svg',
  '/avatars/avery.svg',
  '/avatars/robot-blue.svg',
  '/avatars/robot-gold.svg',
];
const VITE_ASSET_PATTERN = /(?:src|href)=["'](\/assets\/[^"']+)["']/g;

const offlineResponse = () => new Response(
  'WissenPur ist momentan offline und diese Seite wurde noch nicht zwischengespeichert.',
  {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  },
);

const reloadRequest = (url) => new Request(url, { cache: 'reload' });

const cacheBuiltAppShell = async () => {
  const cache = await caches.open(APP_SHELL_CACHE);
  await cache.addAll(APP_SHELL.map(reloadRequest));

  const indexResponse = await fetch(reloadRequest('/index.html'));
  if (!indexResponse.ok) {
    throw new Error(`App-Shell konnte nicht geladen werden (${indexResponse.status}).`);
  }

  await Promise.all([
    cache.put('/index.html', indexResponse.clone()),
    cache.put('/', indexResponse.clone()),
  ]);

  const html = await indexResponse.text();
  const assetUrls = [...html.matchAll(VITE_ASSET_PATTERN)]
    .map((match) => match[1])
    .filter((url) => typeof url === 'string');
  const uniqueAssetUrls = [...new Set(assetUrls)];

  if (uniqueAssetUrls.length > 0) {
    await cache.addAll(uniqueAssetUrls.map(reloadRequest));
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheBuiltAppShell().then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (['script', 'style', 'font', 'image', 'manifest'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedPage = await caches.match(request);
    if (cachedPage) return cachedPage;

    const appShell = await caches.match('/index.html');
    return appShell || offlineResponse();
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await caches.match(request);
  const networkResponsePromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    event.waitUntil(networkResponsePromise.then(() => undefined));
    return cachedResponse;
  }

  const networkResponse = await networkResponsePromise;
  return networkResponse || offlineResponse();
}
