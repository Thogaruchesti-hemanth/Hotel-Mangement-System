// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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
const db = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const hotelName = document.getElementById('hotel-name').value;
        const ownerEmail = document.getElementById('owner-email').value;
        const password = document.getElementById('password').value;
        const numberOfRooms = parseInt(document.getElementById('number-of-rooms').value);
        const facilities = document.getElementById('facilities').value;

        // Create user with Firebase Authentication
        createUserWithEmailAndPassword(auth, ownerEmail, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const hotelId = user.uid; // Use the Firebase User ID as the hotel ID

                // Check if a hotel already exists for this user
                const hotelRef = ref(db, 'hotels/' + hotelId);
                get(hotelRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        alert('A hotel is already registered with this account.');
                    } else {
                        // Create a new hotel object
                        const newHotel = {
                            hotelId: hotelId,
                            hotelName: hotelName,
                            ownerEmail: ownerEmail,
                            numberOfRooms: numberOfRooms,
                            facilities: facilities,
                            rooms: initializeRooms(numberOfRooms)
                        };

                        // Save the hotel details in the Realtime Database
                        set(hotelRef, newHotel)
                            .then(() => {
                                alert('Registration successful! Please log in.');
                                window.location.href = 'index.html'; // Redirect to login page
                            })
                            .catch((error) => {
                                console.error("Error saving data: ", error);
                                alert('Error saving hotel data.');
                            });
                    }
                }).catch((error) => {
                    console.error("Error checking hotel existence: ", error);
                    alert('Error checking hotel data.');
                });
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    alert('The email address is already in use by another account.');
                } else if (error.code === 'auth/weak-password') {
                    alert('The password is too weak.');
                } else {
                    console.error("Error creating user: ", error);
                    alert('Error creating account: ' + error.message);
                }
            });
    });

    // Helper function to initialize room data
    function initializeRooms(number) {
        let rooms = [];
        for (let i = 1; i <= number; i++) {
            rooms.push({
                roomNumber: i,
                status: 'Available',
                guest: '',
                checkIn: '',
                checkOut: ''
            });
        }
        return rooms;
    }
});
