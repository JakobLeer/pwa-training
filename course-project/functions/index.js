const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const serviceAccount = require('./pwagram-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-jakob-leer.firebaseio.com/'
});

exports.storePosts = functions.https.onRequest((request, response) => {
 cors(request, response, function() {
   admin.database().ref('posts').push(request.body)
    .then(function() {
      response.status(201).json({message: 'Data stored', id: request.body.id});
    })
    .catch(function(err) {
      response.status(500).json({error: err});
    });
 });
});
