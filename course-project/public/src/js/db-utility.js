const DB = 'posts-store';
const STORE = 'posts';
const SYNC_STORE = 'sync-posts';

// idb.open
// par1: name of database
// par2: version
// par3: on create callback
var dbPromise = idb.open(DB, 1, function(db) {
  if (!db.objectStoreNames.contains(STORE)) {
    // db.createObjectStore create an object store
    // par1: name of object store
    // par2: configuration object, e.g. keyPath sets the primary key of the stored object.
    db.createObjectStore(STORE, {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains(SYNC_STORE)) {
    db.createObjectStore(SYNC_STORE, {keyPath: 'id'});
  }
});

function storePosts(posts) {
  return storeObject(STORE, posts, true);
}

function storeSync(sync) {
  return storeObject(SYNC_STORE, sync, false);
}

function storeObject(storeName, data, storePropertiesIndividually) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      store.clear();
      if (storePropertiesIndividually) {
        Object.values(data).forEach(function(dataElement) {
          store.put(dataElement);
        });
      } else {
        store.put(data);
      }

      return tx.complete;
    });
}

function readPosts() {
  return readObjects(STORE);
}

function readSyncs() {
  return readObjects(SYNC_STORE);
}

function readObjects(storeName) {
  return dbPromise
  .then(function(db) {
    var tx = db.transaction(storeName, 'readonly');
    var store = tx.objectStore(storeName);
    return store.getAll();
  });
}

function deletePost(id) {
  return deleteObject(STORE, id);
}

function deleteSync(id) {
  return deleteObject(SYNC_STORE, id);
}

function deleteObject(storeName, id) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      store.delete(id);
      return tx.complete;
    });
}

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
