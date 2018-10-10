
var CACHE_STATIC_NAME = 'static-v3';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(STATIC_ASSETS);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

//=== Network only
// All calls go through the network, fails in offline mode.
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

//=== Cache only
// All which is not statically cached, fails both online and offline.
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

//=== Network with Cache fallback
// Connected works fine, offline serves the statically cached assets.
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

//=== Cache, then Network for httpbin.org/ip call.
//=== Cache only for static assets.
//=== Cache with network fallback for the rest.
// Offline fails when using non cached assets
self.addEventListener('fetch', function(event) {
  if (event.request.url === 'https://httpbin.org/ip') {
    //=== Cache, then Network for httpbin.org/ip call.
    event.respondWith(
      fetch(event.request)
        .then(function(networkResponse) {
          return caches.open(CACHE_DYNAMIC_NAME)
            .then(function(cache) {
              console.log('[Service Worker] Updating the cache.', event.request.url);
              cache.put(event.request.url, networkResponse.clone());
              return networkResponse;
            });
        })
    );
  } else if (STATIC_ASSETS.some(function(asset) { event.request.url.indexOf(asset); })) {
      //=== Cache only for static assets.
      event.respondWith(
        caches.match(event.request)
      );
  } else {
    //=== Cache with network fallback for the rest.
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              })
              .catch(function(err) {
              });
          }
        })
    );
  }
});

//=== Cache then Network
// Doesn't work in offline, missing the static assets
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(networkResponse) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(function(cache) {
//             console.log('[Service Worker] Updating the cache.', event.request.url);
//             cache.put(event.request.url, networkResponse.clone());
//             return networkResponse;
//           });
//       })
//   );
// });

//=== Cache with network fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 });
//             })
//             .catch(function(err) {
//
//             });
//         }
//       })
//   );
// });
