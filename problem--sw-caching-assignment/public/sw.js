var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';

// 2) Identify the AppShell (i.e. core assets your app requires to provide its basic "frame")
// 3) Precache the AppShell
// 5) Precache other assets required to make the root index.html file work
// 6) Change some styling in the main.css file and make sure that the new file gets loaded + cached (hint: versioning)
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Pre-caching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/material.min.js',
          '/src/js/main.js',
          '/src/css/main.css',
          '/src/css/app.css',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  );
});

// 7) Make sure to clean up unused caches
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activated ...', event);
  event.waitUntil(
    caches.keys() // returns a promise with all sub cache names in use
      .then(function(keyList) {
        // all returns a single Promise that resolves when promises in the
        // iterable argument have resolved or the iterable doesn't have any
        // promises.
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old subcache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// 4) Add Code to fetch the precached assets from cache when needed
// 8) Add dynamic caching (with versioning) to cache everything in your app when visited/ fetched by the user
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        } else {
          return fetch(event.request)
            .then(function(response) {  // We take the response ...
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) { // and the dynamic cache ...
                  cache.put(event.request.url, response.clone()); // and save the response
                  return response;
                })
            });
        }
      })
      .catch(function(err) {})
  );
});
