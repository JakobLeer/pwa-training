const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');

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
      webpush.setVapidDetails('mailto:jpleer@tdcadsl.dk',
          'BJSWji6qiyMrBB2usbw7uVOa0sxI71jPzljxyQSPPAAPQEa7wNqYYktrg4c-YLvT7FoXvmtkikPdMz2vyjqb_KE',
          '5J9mxQgukpDoNKhloc9zedHXHr6HLZqPB-9C8CR04uw'
      );
      return admin.database().ref('subscription').once('value');
    })
    .then(subscriptions => {
      subscriptions.forEach(sub => {
        var pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };
        webpush.sendNotification(pushConfig. JSON.stringify({
          title: 'New Post',
          content: 'New Post added!'
        }))
          .catch(err => console.log(err));
      });
      response.status(201).json({message: 'Data stored', id: request.body.id});
    })
    .catch(function(err) {
      response.status(500).json({error: err});
    });
 });
});
