// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2V-6IRM7u2w1VCXn-Wp5-ucryz-zxioc",
    authDomain: "rupeeswise-2a814.firebaseapp.com",
    projectId: "rupeeswise-2a814",
    storageBucket: "rupeeswise-2a814.firebasestorage.app",
    messagingSenderId: "722160242281",
    appId: "1:722160242281:web:ea1edad66f878d98d99cf8",
    measurementId: "G-D0LP3H0NE4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleLink = document.getElementById('toggle-link');
const formTitle = document.getElementById('form-title');
const messageArea = document.getElementById('message-area');

const formsContainer = document.getElementById('forms-container');
const loggedInView = document.getElementById('logged-in-view');
const userEmailDisplay = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');

// --- UI Functions ---
function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError 
        ? 'text-center mb-4 text-sm font-medium text-red-500' 
        : 'text-center mb-4 text-sm font-medium text-green-500';
}

function toggleForms() {
    const isLoginVisible = !loginForm.classList.contains('hidden');
    if (isLoginVisible) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        formTitle.textContent = 'Create a new account';
        toggleLink.textContent = 'Already have an account? Sign in';
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        formTitle.textContent = 'Login to your account';
        toggleLink.textContent = "Don't have an account? Register";
    }
    messageArea.textContent = '';
}

function updateUIForUser(user) {
    if (user) {
        // User is signed in
        formsContainer.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        formTitle.textContent = 'Welcome back!';
        userEmailDisplay.textContent = user.email;
    } else {
        // User is signed out
        formsContainer.classList.remove('hidden');
        loggedInView.classList.add('hidden');
        formTitle.textContent = 'Login to your account';
    }
}

// --- Event Listeners ---
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

// Registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = registerForm.name.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;
    const confirmPassword = registerForm['confirm-password'].value;

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", true);
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            showMessage("Registration successful! You are now logged in.");
            // You can add more logic here, like saving the user's name to Firestore
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            showMessage(errorMessage, true);
        });
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            showMessage("Login successful!");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            showMessage(errorMessage, true);
        });
});

// Logout
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        showMessage("You have been logged out.");
    }).catch((error) => {
        showMessage(error.message, true);
    });
});

// --- Auth State Observer ---
// This is the central function that listens for changes in the user's login state.
onAuthStateChanged(auth, (user) => {
    updateUIForUser(user);
});
