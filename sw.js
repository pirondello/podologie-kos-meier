const CACHE_NAME = 'podologie-v1';
const ASSETS = ['./', './index.html', './logo.png', './bg.jpg',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) {
      fetch(e.request).then(r => {
        if (r && r.status === 200) caches.open(CACHE_NAME).then(c => c.put(e.request, r));
      }).catch(() => {});
      return cached;
    }
    return fetch(e.request).then(r => {
      if (!r || r.status !== 200) return r;
      const cl = r.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, cl));
      return r;
    }).catch(() => new Response('Offline', { status: 503 }));
  }));
});
