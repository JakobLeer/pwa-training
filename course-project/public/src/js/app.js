var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');
var deferredPrompt;

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

const options = {
  icon: '/src/images/icons/app-icon-96x96.png',
  image: '/src/images/sf-boat.jpg',
  vibrate: [100, 50, 200],
  badge: '/src/images/icons/app-icon-96x96.png', // Android icon in toolbar
  tag: 'confirm-notification', // An ID, new instance replace old
  renotify: true, // will new notification of same tag vibrate?
  actions: [      // the buttons on your notification
    {
      action: 'confirm', // ID
      title: 'Approve', // text
      icon: '/src/images/icons/app-icon-48x48.png'
    },
    {
      action: 'cancel', // ID
      title: 'Ignore', // text
      icon: '/src/images/icons/app-icon-48x48.png'
    }
  ]
};

function displayConfirmNotificationFromPage() {
  options['body'] = 'This is from reguler page JavaScript';
  new Notification('My first notification', options);
}

function displayConfirmNotificationFromSW() {
  if ('serviceWorker' in navigator) {
    options['body'] = 'Service Worker notifying';
    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('My first notification', options);
      });
  }
}

function askForNotificationPermission() {
  Notification.requestPermission(function(choice) {
    console.log('User chose: ', choice);
    if (choice === 'granted') {
      displayConfirmNotificationFromSW();
    }
  });
}

// Notifications supported
if ('Notification' in window) {
  enableNotificationsButtons.forEach(function(btn) {
    btn.style.display = 'inline-block';
    btn.addEventListener('click', askForNotificationPermission);
  });
}
