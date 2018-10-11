const DB = 'posts-store';
const STORE = 'posts';

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
});

function storePosts(posts) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(STORE, 'readwrite');
      var store = tx.objectStore(STORE);
      Object.values(posts).forEach(function(post) {
        store.put(post);
      });
      return tx.complete;
    });
}

function readPosts() {
  return dbPromise
  .then(function(db) {
    var tx = db.transaction(STORE, 'readonly');
    var store = tx.objectStore(STORE);
    return store.getAll();
  });
}
