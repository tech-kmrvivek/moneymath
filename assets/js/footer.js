/* /assets/js/footer.js */
/*
  Final Visitor Counter Script
  - Connects to Firebase
  - Reads the visitor count in real-time
  - Increments the count once per browser session
  - Requires the 'site-stats/visitor-counter' document to be created manually in Firestore first.
*/

// Step 1: Add your Firebase project configuration here.
// This object connects the script to your specific Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyA2V-6IRM7u2w1VCXn-Wp5-ucryz-zxioc",
  authDomain: "rupeeswise-2a814.firebaseapp.com",
  projectId: "rupeeswise-2a814",
  storageBucket: "rupeeswise-2a814.firebasestorage.app",
  messagingSenderId: "722160242281",
  appId: "1:722160242281:web:ea1edad66f878d98d99cf8",
  measurementId: "G-D0LP3H0NE4"
};

// Step 2: Initialize Firebase services.
// This sets up the connection to the database.
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Step 3: Wait for the HTML document to be fully loaded before running the script.
document.addEventListener('DOMContentLoaded', function() {
  
  // Find the HTML element where the count will be displayed.
  const visitorCountElement = document.getElementById('visitor-count');
  
  // If the element doesn't exist on the page, stop the script.
  if (!visitorCountElement) {
    console.error("Error: The HTML element with id='visitor-count' was not found.");
    return;
  }

  // Define the path to the counter document in the database.
  const counterRef = db.collection('site-stats').doc('visitor-counter');

  // Step 4: Set up a real-time listener to display the count.
  // This function runs immediately and then again every time the data changes in the database.
  counterRef.onSnapshot((doc) => {
    if (doc.exists) {
      // If the document exists, get the 'count' field and display it.
      const count = doc.data().count;
      visitorCountElement.textContent = count.toLocaleString('en-IN');
    } else {
      // If the document is missing, display an error message.
      // This helps with debugging if the document was deleted or named incorrectly.
      visitorCountElement.textContent = 'N/A';
      console.warn("Warning: The 'visitor-counter' document does not exist in Firestore. Please create it manually.");
    }
  }, (error) => {
    // If there's an error fetching the data (e.g., permission denied), log it.
    console.error("Firebase Snapshot Error: ", error);
    visitorCountElement.textContent = 'Error';
  });

  // Step 5: Check if the user has already been counted in this session.
  // sessionStorage is cleared when the browser tab is closed.
  const countedInSession = sessionStorage.getItem('rupeeswise_counted');

  if (!countedInSession) {
    // If not counted yet, increment the count in the database.
    db.runTransaction((transaction) => {
      return transaction.get(counterRef).then((doc) => {
        if (!doc.exists) {
          // The document should already exist. If it doesn't, do nothing.
          return;
        }
        // Calculate the new count.
        const newCount = doc.data().count + 1;
        // Update the document with the new count.
        transaction.update(counterRef, { count: newCount });
      });
    }).then(() => {
      // After a successful update, mark this session as "counted".
      sessionStorage.setItem('rupeeswise_counted', 'true');
    }).catch((error) => {
      // Log any errors during the update process (e.g., security rules blocking the write).
      console.error("Firebase Transaction Error: ", error);
    });
  }
});
