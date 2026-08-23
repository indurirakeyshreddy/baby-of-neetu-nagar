const CACHE_NAME = 'klintara-offline-v1';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './scripts/scripts.html',
  './scripts/scripts.css',
  './rhymes/telugu-rhymes.html',
  './rhymes/hindi-rhymes.html',
  './rhymes/sanskrit-rhymes.html',
  './rhymes/rhymes.css',
  './rhymes/rhymes.js',
  './rhymes/hindi/index.json',
  './rhymes/hindi/aha-tamatar.json',
  './rhymes/hindi/chandamama.json',
  './rhymes/hindi/ek-mota-hathi.json',
  './rhymes/hindi/lallaa-lallaa-lory.json',
  './rhymes/hindi/machhli-jal-ki-rani-hai.json',
  './rhymes/hindi/nani-teri-morni.json',
  './rhymes/hindi/upar-pankha-chalta-hai.json',
  './rhymes/sanskrit/index.json',
  './rhymes/sanskrit/amra-phalam.json',
  './rhymes/sanskrit/bati-vibhati.json',
  './rhymes/sanskrit/dvichakrika.json',
  './rhymes/sanskrit/Krishna-Krishna-Aambam.json',
  './rhymes/telugu/index.json',
  './rhymes/telugu/chandamama.json',
  './rhymes/telugu/chima-ento-chinnadi.json',
  './rhymes/telugu/chitti-chilakamma.json',
  './rhymes/telugu/chuka-railu.json',
  './rhymes/telugu/dagudumuthalu.json',
  './rhymes/telugu/toorpu-padamara.json',
  './rhymes/telugu/udata-udata-ooch.json',
  './withus/with-us.html',
  './withus/withus.css',
  './withus/with-us.js',
  './script.js',
  './shared/base.css',
  './shared/components.css',
  './shared/home.css',
  './celebration/klintara-celebration.css',
  './celebration/klintara-celebration.js',
  './assets/favicon.svg',
  './assets/og-teaser.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
