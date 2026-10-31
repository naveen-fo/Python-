// Makes the site installable and lets it work offline after the first visit.
const CACHE = 'pystep-v1';
const SHELL = ['./', 'index.html', 'main.js', 'App.js', 'Scene3D.js', 'python.js', 'curriculum.js', 'index.css', 'manifest.webmanifest', 'icon.svg', 'pwa-192.png', 'pwa-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const same = url.origin === self.location.origin;
  const cdn = /(^|\.)(esm\.sh|jsdelivr\.net)$/.test(url.hostname);
  if (!same && !cdn) return;
  const keep = (res) => {
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  };
  if (same) {
    // own files: newest first, cache when offline
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request)));
  } else {
    // libraries and Python from CDN: cache first
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then(keep)));
  }
});
