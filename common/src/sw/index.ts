/* eslint-disable no-var */

import { preCacheList, isRuntimeCache } from './cache-info';

declare var self: ServiceWorkerGlobalScope;

/* global VERSION */
const cacheName = `common-${VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(preCacheList);
    })
  );
});

self.addEventListener('activate', event => {
  self.clients.claim();

  event.waitUntil(
    caches.keys().then(keys => {
      const promises: Promise<boolean>[] = [];

      keys.forEach(oldCacheName => {
        if (oldCacheName !== cacheName) {
          promises.push(caches.delete(oldCacheName));
        }
      });

      return Promise.all(promises);
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== location.origin || event.request.method !== 'GET') {
    return;
  }

  if (isRuntimeCache(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then(response => {
          if (!response.ok) return response;

          const responseToCache = response.clone();
          event.waitUntil(
            caches.open(cacheName).then(cache => {
              cache.put(event.request, responseToCache);
            })
          );

          return response;
        });
      })
    );

    return;
  }

  // FUTURE: Clear no need cached files.

  // For pre-cached assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('message', event => {
  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting();
      break;

    default:
  }
});
