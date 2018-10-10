
var box = document.querySelector('.box');
var button = document.querySelector('button');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Registered Service Worker!');
    });
}

button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});

//=== Cache then Network
var url = 'https://httpbin.org/ip';
var networkResponseReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log('Network:', data.origin);
    networkResponseReceived = true;
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  });

if ('caches' in window) {
  caches.match(url)
    .then(function(cached) {
      if (cached) {
        return cached.json();
      }
    })
    .then(function(data) {
      if (!networkResponseReceived && data && data.origin) {
        console.log('Cache:', data.origin);
        box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
      }
    });
}

// 1) Identify the strategy we currently use in the Service Worker (for caching)
// Cache with network fallback

// 6) Add "Routing"/ URL Parsing to pick the right strategies: Try to implement "Cache, then network", "Cache with network fallback" and "Cache only" (all of these, with appropriate URL selection)
