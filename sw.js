const CACHE_NAME = 'klintara-offline-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './404.html',
  './scripts/scripts.html',
  './scripts/scripts.css',
  './rhymes/telugu-rhymes.html',
  './rhymes/hindi-rhymes.html',
  './rhymes/sanskrit-rhymes.html',
  './rhymes/rhymes.css',
  './rhymes/rhymes.js',
  './shared/yaml.js',
  './rhymes/hindi/index.yaml',
  './rhymes/hindi/aha-tamatar.yaml',
  './rhymes/hindi/chandamama.yaml',
  './rhymes/hindi/ek-mota-hathi.yaml',
  './rhymes/hindi/lallaa-lallaa-lory.yaml',
  './rhymes/hindi/machhli-jal-ki-rani-hai.yaml',
  './rhymes/hindi/nani-teri-morni.yaml',
  './rhymes/hindi/upar-pankha-chalta-hai.yaml',
  './rhymes/sanskrit/index.yaml',
  './rhymes/sanskrit/amra-phalam.yaml',
  './rhymes/sanskrit/bati-vibhati.yaml',
  './rhymes/sanskrit/dvichakrika.yaml',
  './rhymes/sanskrit/Krishna-Krishna-Aambam.yaml',
  './rhymes/telugu/index.yaml',
  './rhymes/telugu/chandamama.yaml',
  './rhymes/telugu/chima-ento-chinnadi.yaml',
  './rhymes/telugu/chitti-chilakamma.yaml',
  './rhymes/telugu/chuka-railu.yaml',
  './rhymes/telugu/dagudumuthalu.yaml',
  './rhymes/telugu/koti-bavaku-pellanta.yaml',
  './rhymes/telugu/udata-udata-ooch.yaml',
  './songs/telugu-songs.html',
  './songs/songs.css',
  './songs/songs.js',
  './songs/telugu/index.yaml',
  './songs/telugu/aura-ammaka-chella.yaml',
  './songs/telugu/vidhatha-talapuna.yaml',
  './songs/telugu/orey-aanjaneyulu.yaml',
  './songs/telugu/jili-bili-palukulu.yaml',
  './songs/telugu/lali-lali.yaml',
  './songs/telugu/chu-manthar-kaali.yaml',
  './songs/telugu/krishnam-vande-jagadgurum.yaml',
  './songs/tamil-songs.html',
  './songs/tamil/index.yaml',
  './songs/tamil/vaa-rayil-vida.yaml',
  './withus/with-us.html',
  './withus/withus.css',
  './withus/with-us.js',
  './events/events.html',
  './events/events.css',
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
    const networkRequest = new Request(event.request, { cache: 'no-store' });
    event.respondWith(
      fetch(networkRequest)
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
