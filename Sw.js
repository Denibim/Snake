// sw.js : "penjaga offline" untuk Snake Arena
// Naikkan angka versi ini kalau kamu menambah atau mengganti file selain index.html
const NAMA_CACHE = 'snake-arena-v1';

// file yang disimpan di HP supaya game bisa dibuka tanpa internet
const FILE_OFFLINE = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-512.png'
];

// 1) Saat pertama dipasang: simpan semua file ke memori HP
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(NAMA_CACHE).then(function (cache) {
            return cache.addAll(FILE_OFFLINE);
        })
    );
    self.skipWaiting();
});

// 2) Saat aktif: hapus simpanan versi lama
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (daftar) {
            return Promise.all(
                daftar
                    .filter(function (nama) { return nama !== NAMA_CACHE; })
                    .map(function (nama) { return caches.delete(nama); })
            );
        })
    );
    self.clients.claim();
});

// 3) Setiap file diminta: coba ambil yang terbaru dulu.
//    Kalau server mati atau tidak ada internet, pakai simpanan di HP.
self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request, { cache: 'no-cache' }).then(function (hasil) {
            if (hasil && hasil.ok) {
                const salinan = hasil.clone();
                caches.open(NAMA_CACHE).then(function (cache) { cache.put(e.request, salinan); });
            }
            return hasil;
        }).catch(function () {
            return caches.match(e.request).then(function (simpanan) {
                return simpanan || caches.match('./index.html');
            });
        })
    );
});