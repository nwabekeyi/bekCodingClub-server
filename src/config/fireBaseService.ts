const admin = require('firebase-admin');
const serviceAccount = require('../../beks-coding-club-firebase-adminsdk-fbsvc-fd8ea8e508.json'); // Path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Example query to Firestore
const usersRef = db.collection('users');
usersRef.get().then(snapshot => {
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}).catch(error => {
  console.log('Error fetching documents: ', error);
});
