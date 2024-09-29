// Firebase SDKs for Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC242ubwfaydqi5404Gm_MNra9poVfXn9U",
    authDomain: "hotel-management-system-902ff.firebaseapp.com",
    projectId: "hotel-management-system-902ff",
    storageBucket: "hotel-management-system-902ff.appspot.com",
    messagingSenderId: "480579412051",
    appId: "1:480579412051:web:a019b3eca9172c06f626a6",
    measurementId: "G-TZ29XKLG4S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Firebase Authentication: Sign in user
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Store user info locally if needed, then redirect
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                window.location.href = 'dashboard.html'; // Redirect after successful login
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert('Error: ' + errorMessage);
            });
    });
});