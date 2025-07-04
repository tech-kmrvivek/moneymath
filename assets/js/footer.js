/* /assets/js/footer.js */
/* This file contains the visitor count logic for the footer using Firebase for real-time data. */

// Import necessary Firebase modules using the modular SDK syntax
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, runTransaction, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let db;
let auth;
let userId = 'anonymous'; // Default to anonymous until authenticated

// Function to initialize Firebase and set up authentication
async function initializeFirebaseAndAuth() {
    try {
        // Use global variables provided by the Canvas environment
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase: Configuration not found. Please ensure __firebase_config is provided.");
            return;
        }

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Sign in with custom token if available, otherwise anonymously
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log("Firebase: Signed in with custom token.");
        } else {
            await signInAnonymously(auth);
            console.log("Firebase: Signed in anonymously.");
        }

        // Listen for auth state changes to get the user ID
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                console.log(`Firebase: User authenticated with UID: ${userId}`);
            } else {
                // If no user is authenticated (e.g., anonymous sign-in failed or user logged out),
                // generate a temporary ID for session tracking.
                userId = crypto.randomUUID();
                console.warn(`Firebase: User not authenticated. Using temporary ID: ${userId}`);
            }
            // Once auth state is known, set up the visitor counter
            setupVisitorCounter(appId, userId);
        });

    } catch (e) {
        console.error("Firebase: CRITICAL ERROR initializing Firebase or authentication:", e);
    }
}

// Setup the visitor counter logic
function setupVisitorCounter(appId, currentUserId) {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) {
        console.warn("Visitor count element with ID 'visitor-count' not found in the DOM.");
        return;
    }

    // Define the Firestore reference for the visitor counter
    // Using the public data path as per Canvas guidelines
    const counterRef = doc(collection(db, `artifacts/${appId}/public/data/site-stats`), 'visitor-counter');

    // Check if this user has been counted in this browser session
    // The session key now includes appId and currentUserId for robustness across different apps/users
    const sessionKey = `rupeeswise_counted_${appId}_${currentUserId}`;
    const countedInSession = sessionStorage.getItem(sessionKey);

    if (!countedInSession) {
        // If not counted, increment the count in the database using a transaction
        console.log("Visitor count: Incrementing count for new session...");
        runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(counterRef);

            let newCount;
            if (!docSnapshot.exists()) {
                newCount = 1;
                transaction.set(counterRef, { count: newCount });
                console.log("Visitor count: Document initialized to 1.");
            } else {
                const currentCount = docSnapshot.data().count;
                newCount = (currentCount || 0) + 1; // Ensure currentCount is a number, default to 0 if undefined
                transaction.update(counterRef, { count: newCount });
                console.log(`Visitor count: Document incremented to ${newCount}.`);
            }
            return newCount;
        }).then(() => {
            // Mark this session as counted
            sessionStorage.setItem(sessionKey, 'true');
            console.log("Visitor count: Session marked as counted.");
        }).catch((error) => {
            console.error("Visitor count: Error updating count in transaction: ", error);
        });
    } else {
        console.log("Visitor count: Already counted in this session.");
    }

    // Listen for real-time updates to the counter to display it
    onSnapshot(counterRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const count = docSnapshot.data().count;
            visitorCountElement.textContent = (count || 0).toLocaleString('en-IN');
            console.log(`Visitor count: Real-time update - current count is ${count}.`);
        } else {
            visitorCountElement.textContent = '0'; // Initial state if document doesn't exist yet
            console.log("Visitor count: Counter document does not exist yet. Displaying 0.");
        }
    }, (error) => {
        console.error("Visitor count: Error fetching real-time updates: ", error);
        visitorCountElement.textContent = 'N/A'; // Display N/A on error
    });
}

// Start Firebase initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeFirebaseAndAuth);
