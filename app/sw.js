/* 轻 · 日历 Service Worker */

const CACHE_NAME = 'qing-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './todo.html',
  './detail.html',
  './settings.html',
  './css/style.css',
  './js/storage.js',
  './js/messages.js',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        // 缓存成功的响应
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        return cached;
      });

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'clear-cache') {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
    self.skipWaiting();
  }
});
