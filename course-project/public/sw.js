var CACHE_STATIC_NAME = 'static-v12';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(function(cache) {
      return cache.keys()
        .then(function(keys) {
          if (keys.length > maxItems) {
            console.log('[Service Worker] deleting', keys[0]);
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems));
          }
        });
    })
}

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Pre-caching App Shell');
        cache.addAll(STATIC_ASSETS);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ...', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) { // The ones we want to keep.
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

//=== Mixed cache then network and cache with network fallback
self.addEventListener('fetch', function(event) {
  var url = 'https://httpbin.org/get';

  if (event.request.url === url) {
    //=== Do network cache the response
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function(cache) {
          return fetch(event.request)
            .then(function(response) {
              console.log('[Service Worker] Updating the cache.');
              // trimCache(CACHE_DYNAMIC_NAME, 5);
              cache.put(event.request.url, response.clone());
              return response;
            });
        })
    );
  } else if (STATIC_ASSETS.some(function(asset) { event.request.url.indexOf(asset); })) {
      //=== Always get static assets from the cache
      event.respondWith(
        caches.match(event.request)
      );
  } else {
    //=== Cache with network fallback
    event.respondWith(
      caches.match(event.request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          } else {
            return fetch(event.request)
              .then(function(response) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function(cache) {
                    console.log('[Service Worker] Updating the cache.');
                    // trimCache(CACHE_DYNAMIC_NAME, 5);
                    cache.put(event.request.url, response.clone());
                    return response;
                  })
              });
          }
        })
        .catch(function(err) {
          return caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
              // if (event.request.url.indexOf('/help')) {
              if (event.request.headers.get('accept').includes('text/html')) {
                return cache.match('/offline.html');
              }
            })
        })
    );
  }
});

//=== Cache with network fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(cachedResponse) {
//         if (cachedResponse) {
//           return cachedResponse;
//         } else {
//           return fetch(event.request)
//             .then(function(response) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, response.clone());
//                   return response;
//                 })
//             });
//         }
//       })
//       .catch(function(err) {
//         return caches.open(CACHE_STATIC_NAME)
//           .then(function(cache) {
//             return cache.match('/offline.html');
//           })
//       })
//   );
// });

//=== Network with cache fallback
// If on spotty connection we could wait forever to get a response.
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .catch(function(error) {
//         return caches.match(event.request);
//       })
//   );
// });

//=== Cache only strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });
