// Service Worker untuk Snake Arena.
const NAMA_CACHE = 'snake-arena-v2';

// Aset inti agar game tetap dapat dibuka saat offline.
const FILE_OFFLINE = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(NAMA_CACHE).then(function (cache) {
            return cache.addAll(FILE_OFFLINE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (cacheName) {
                        return cacheName.startsWith('snake-arena-') && cacheName !== NAMA_CACHE;
                    })
                    .map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request, { cache: 'no-cache' }).then(function (response) {
            if (response && response.ok) {
                const responseCopy = response.clone();
                caches.open(NAMA_CACHE).then(function (cache) {
                    cache.put(event.request, responseCopy);
                });
            }
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cachedResponse) {
                return cachedResponse || caches.match('./index.html');
            });
        })
    );
});
