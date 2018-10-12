var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// User requested caching, remember to turn off dynamic caching
// function onCardSaved(event) {
//   console.log('Clicked ...');
//   if ('caches' in window) {
//     caches.open('user-cache-v1')
//       .then(function(cache){
//         cache.add('https://httpbin.org/get');
//         cache.add('/src/images/sf-boat.jpg');
//       });
//   }
// }

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onCardSaved);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(posts) {
  clearCards();
  posts.forEach(function(post) { createCard(post); });
}

var url = 'https://pwagram-jakob-leer.firebaseio.com/posts.json';
var networkDataRecived = false;

// Get response from Network
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(posts) {
    networkDataRecived = true;
    console.log('From web', posts);
    updateUI(Object.values(posts));
  });

// Get response from Cache
if ('indexedDB' in window) {
  readPosts()
    .then(function(postsFromDB) {
      if (!networkDataRecived) {
        console.log('From indexed DB', postsFromDB);
        updateUI(postsFromDB);
      }
    });
}

function postData(data) {
  fetch('https://us-central1-pwagram-jakob-leer.cloudfunctions.net/storePosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(function(res) {
      console.log('POST directly', res);
      updateUI();
    });
}

form.addEventListener('submit', function(event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid values.')
    return;
  }

  closeCreatePostModal();

  var post = {
    id: new Date().toISOString(),
    title: titleInput.value,
    location: locationInput.value,
    image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-jakob-leer.appspot.com/o/sf-boat.jpg?alt=media&token=94b0df98-4866-429e-98c0-6057b918d077'
  };

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(function(sw) {
        storeSync(post)
          .then(function() {
            return sw.sync.register('sync-new-post');
          })
          .then(function() {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = { message: 'Your post was saved for syncing!' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function(err) {
            console.log('Trying to save post to sync', err);
          });
      });
  } else {
    postData(post);
  }
});
