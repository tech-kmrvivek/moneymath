/* /assets/js/footer.js */
/* This file contains the visitor count logic for the footer using Firebase for real-time data. */

// IMPORTANT: You need to replace the placeholder values below with your actual Firebase project's "Web app" configuration.
// You can get this from your Firebase project settings > Your apps > Web app.
const firebaseConfig = {
    apiKey: "AIzaSyA2V-6IRM7u2w1VCXn-Wp5-ucryz-zxioc",
    authDomain: "rupeeswise-2a814.firebaseapp.com",
    projectId: "rupeeswise-2a814",
    storageBucket: "rupeeswise-2a814.firebasestorage.app",
    messagingSenderId: "722160242281",
    appId: "1:722160242281:web:ea1edad66f878d98d99cf8",
    measurementId: "G-D0LP3H0NE4"
  };

// Initialize Firebase and Firestore
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
  const visitorCountElement = document.getElementById('visitor-count');
  if (!visitorCountElement) return;

  const counterRef = db.collection('site-stats').doc('visitor-counter');

  // Check if this user has been counted in this browser session
  const countedInSession = sessionStorage.getItem('rupeeswise_counted');

  if (!countedInSession) {
    // If not counted, increment the count in the database.
    // This uses a transaction to handle the case where the document might not exist yet.
    db.runTransaction((transaction) => {
      return transaction.get(counterRef).then((doc) => {
        if (!doc.exists) {
          transaction.set(counterRef, { count: 1 });
          return 1;
        }
        const newCount = doc.data().count + 1;
        transaction.update(counterRef, { count: newCount });
        return newCount;
      });
    }).then(() => {
      // Mark this session as counted
      sessionStorage.setItem('rupeeswise_counted', 'true');
    }).catch((error) => {
      console.error("Error updating visitor count: ", error);
    });
  }

  // Listen for real-time updates to the counter to display it
  counterRef.onSnapshot((doc) => {
    if (doc.exists) {
      const count = doc.data().count;
      visitorCountElement.textContent = count.toLocaleString('en-IN');
    } else {
      visitorCountElement.textContent = '1'; // Initial state if document doesn't exist yet
    }
  }, (error) => {
    console.error("Error fetching visitor count: ", error);
    visitorCountElement.textContent = 'N/A';
  });
});
