// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC242ubwfaydqi5404Gm_MNra9poVfXn9U",
  authDomain: "hotel-management-system-902ff.firebaseapp.com",
  databaseURL:
    "https://hotel-management-system-902ff-default-rtdb.firebaseio.com",
  projectId: "hotel-management-system-902ff",
  storageBucket: "hotel-management-system-902ff.appspot.com",
  messagingSenderId: "480579412051",
  appId: "1:480579412051:web:a019b3eca9172c06f626a6",
  measurementId: "G-TZ29XKLG4S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Global variables
let hotelId;
let userUid;

// DOM Elements
const hotelNameElement = document.getElementById("hotel-name");
const ownerEmailElement = document.getElementById("owner-email");
const numberOfRoomsElement = document.getElementById("number-of-rooms");
const facilitiesElement = document.getElementById("facilities");
const costPerRoomElement = document.getElementById("cost-per-room");
const roomTableBody = document.getElementById("room-table-body");
const bookingPopup = document.getElementById("booking-popup");
const closePopupBtn = document.getElementById("close-popup-btn");
const checkoutButton = document.getElementById("checkout-btn");
const bookRoomBtn = document.getElementById("book-room-btn");
const uniqueHotelId = document.getElementById("hotel-id");

// Event listeners for login and registration
document.addEventListener("DOMContentLoaded", () => {
  setupLogoutButton();
  setupBookingPopup();
  setupEditRoomButton();
  setupCheckoutRoomButton();
});

// Set up logout button functionality
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "index.html";
          window.history.pushState(null, null, window.location.href);
          window.onpopstate = function () {
            window.history.go(1);
          };
        })
        .catch((error) => {
          console.error("Error signing out: ", error);
        });
    });
  }
}

// Initialize room data
function initializeRooms(number) {
  let rooms = [];
  for (let i = 1; i <= number; i++) {
    rooms.push({
      roomNumber: i,
      status: "Available",
      guest: "",
      checkIn: "",
      checkOut: "",
    });
  }
  return rooms;
}

// Check user authentication on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    userUid = user.uid;
    loadHotelData(user.uid);
  } else {
    window.location.href = "index.html"; // Redirect to login if not logged in
  }
});

// Load hotel data based on user UID
function loadHotelData(uid) {
  const hotelRef = ref(db, `hotels/${uid}`);
  get(hotelRef)
    .then((snapshot) => {
      const hotel = snapshot.val();
      if (hotel) {
        displayHotelInfo(hotel);
        hotelId = uid;
        loadRooms(hotelId);
      }
    })
    .catch((error) => {
      console.error("Error fetching hotel data: ", error);
    });
}

// Display hotel information on the dashboard
function displayHotelInfo(hotel) {
  uniqueHotelId.textContent = hotel.uniqueCode;
  hotelNameElement.textContent = hotel.hotelName;
  ownerEmailElement.textContent = hotel.ownerEmail;
  numberOfRoomsElement.textContent = hotel.numberOfRooms;
  facilitiesElement.textContent = hotel.facilities;
}

// Load room data from Firebase and display in the table
function loadRooms(hotelId) {
  get(ref(db, `hotels/${hotelId}/rooms`))
    .then((snapshot) => {
      const rooms = snapshot.val();
      roomTableBody.innerHTML = ""; // Clear previous room data
      for (const roomNumber in rooms) {
        addRoomToTable(rooms[roomNumber]);
      }
    })
    .catch((error) => {
      console.error("Error fetching room data: ", error);
    });
}

// Add room information to the table
function addRoomToTable(room) {
  const row = document.createElement("tr");
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const checkInFormatted = room.checkIn
    ? new Date(room.checkIn).toLocaleString("en-GB", options)
    : "N/A";
  const checkOutFormatted = room.checkOut
    ? new Date(room.checkOut).toLocaleString("en-GB", options)
    : "N/A";
  row.innerHTML = `
        <td>${room.roomNumber}</td>
        <td>${room.status}</td>
        <td>${room.guest || "N/A"}</td>
        <td>${room.numberOfVisitors || "N/A"}</td>
        <td>${room.mobileNumber1 || "N/A"}</td>
        <td>${room.advanceAmount || "N/A"}</td>
        <td>${checkInFormatted}</td>
        <td>${checkOutFormatted}</td>
    `;
  roomTableBody.appendChild(row);
}

// Set up the booking popup
function setupBookingPopup() {
  bookRoomBtn.addEventListener("click", () => {
    bookingPopup.style.display = "block";
    document.getElementById("booking-form").reset(); // Reset the form for new booking
  });

  closePopupBtn.addEventListener("click", () => {
    bookingPopup.style.display = "none";
  });

  // Handle form submission for booking
  document
    .getElementById("booking-form")
    .addEventListener("submit", handleBookingFormSubmit);
}

/// Handle booking form submission
function handleBookingFormSubmit(e) {
  e.preventDefault();

  const guestName = document.getElementById("guest-name").value;
  const roomNumber = parseInt(document.getElementById("room-number").value, 10);
  const checkIn = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;
  const aadhaarNumber = document.getElementById("aadhaar-number").value;
  const mobileNumber1 = document.getElementById("mobile-number1").value;
  const mobileNumber2 = document.getElementById("mobile-number2").value;
  const purpose = document.getElementById("purpose").value;
  const numberOfVisitors = parseInt(
    document.getElementById("number-of-visitors").value,
    10
  );
  const advanceAmount = parseFloat(
    document.getElementById("advance-amount").value
  );
  const aadhaarScanFile = document.getElementById("aadhaar-scan").files[0];

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    alert("Check-in time must be before the check-out time.");
    return;
  }

  // Phone Number Validation (10 digits, all numbers)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(mobileNumber1)) {
    alert("Mobile Number 1 must be a 10-digit numeric value.");
    return;
  }
  if (mobileNumber2 && !phoneRegex.test(mobileNumber2)) {
    // Allow second number to be optional
    alert("Mobile Number 2 must be a 10-digit numeric value.");
    return;
  }

  // Aadhaar Number Validation (12 digits, all numbers)
  const aadhaarRegex = /^[0-9]{12}$/;
  if (!aadhaarRegex.test(aadhaarNumber)) {
    alert("Aadhaar Number must be a 12-digit numeric value.");
    return;
  }

  // Only require Aadhaar scan if a new file is uploaded, skip if in edit mode and no new file is uploaded
  let aadhaarScanPromise;
  if (aadhaarScanFile) {
    //const uniqueCode = generateUniqueCode();
    const aadhaarScanStorageRef = storageRef(
      storage,
      `aadhaarScans/${uniqueCode}`
    );
    aadhaarScanPromise = uploadBytes(
      aadhaarScanStorageRef,
      aadhaarScanFile
    ).then(() => {
      return getDownloadURL(aadhaarScanStorageRef);
    });
  } else {
    // Use existing Aadhaar scan if no new file is uploaded
    aadhaarScanPromise = get(
      ref(db, `hotels/${hotelId}/rooms/${roomNumber - 1}/aadhaarScan`)
    ).then((snapshot) => snapshot.val());
  }

  aadhaarScanPromise
    .then((aadhaarScanURL) => {
      const roomRef = ref(db, `hotels/${hotelId}/rooms/${roomNumber - 1}`);
      get(roomRef)
        .then((snapshot) => {
          const room = snapshot.val();

          if (room.status === "Available") {
            room.status = "Booked";
            room.guest = guestName;
            room.numberOfVisitors = numberOfVisitors;
            room.checkIn = checkIn;
            room.checkOut = checkOut;
            room.aadhaarNumber = aadhaarNumber;
            room.aadhaarScan = aadhaarScanURL;
            room.mobileNumber1 = mobileNumber1;
            room.mobileNumber2 = mobileNumber2;
            room.purpose = purpose;
            room.advanceAmount = advanceAmount;

            return update(roomRef, room);
          } else {
            alert(" The room is already in use");
          }
        })
        .then(() => {
          alert(`Room Booked successfully!`);
          bookingPopup.style.display = "none";
          loadRooms(hotelId); // Reload rooms data
        })
        .catch((error) => {
          console.error("Error updating room: ", error);
        });
    })
    .catch((error) => {
      console.error("Error uploading Aadhaar scan: ", error);
    });
}

function setupEditRoomButton() {
  document.getElementById("edit-room-btn").addEventListener("click", () => {
    const roomNumber = prompt("Enter room number to edit:");
    if (roomNumber) {
      const roomIndex = parseInt(roomNumber, 10) - 1; // Assuming room numbers are 1-indexed
      const roomRef = ref(db, `hotels/${hotelId}/rooms/${roomIndex}`);

      get(roomRef)
        .then((snapshot) => {
          const room = snapshot.val();
          if (room && room.status === "Booked") {
            // Fill the form with existing room data for editing
            document.getElementById("guest-name").value = room.guest || "";
            document.getElementById("room-number").value =
              room.roomNumber || "";
            document.getElementById("check-in").value = room.checkIn || "";
            document.getElementById("check-out").value = room.checkOut || "";
            document.getElementById("aadhaar-number").value =
              room.aadhaarNumber || "";
            document.getElementById("mobile-number1").value =
              room.mobileNumber1 || "";
            document.getElementById("mobile-number2").value =
              room.mobileNumber2 || "";
            document.getElementById("purpose").value = room.purpose || "";
            document.getElementById("advance-amount").value =
              room.advanceAmount || "";
            document.getElementById("number-of-visitors").value =
              room.numberOfVisitors || "";

            let aadhaarScanURL = room.aadhaarScan || ""; // Store existing Aadhaar scan URL

            // Show the booking popup for editing
            bookingPopup.style.display = "block";

            // Handle form submission for editing
            document.getElementById("booking-form").onsubmit = function (e) {
              e.preventDefault();

              // Gather updated values
              const updatedGuestName =
                document.getElementById("guest-name").value;
              const updatedRoomNumber =
                document.getElementById("room-number").value;
              const updatedCheckIn = document.getElementById("check-in").value;
              const updatedCheckOut =
                document.getElementById("check-out").value;
              const updatedAadhaarNumber =
                document.getElementById("aadhaar-number").value;
              const updatedMobileNumber1 =
                document.getElementById("mobile-number1").value;
              const updatedMobileNumber2 =
                document.getElementById("mobile-number2").value;
              const updatedPurpose = document.getElementById("purpose").value;
              const updatedAdvanceAmount =
                document.getElementById("advance-amount").value;
              const updateNumberOfVisitors = parseInt(
                document.getElementById("number-of-visitors").value,
                10
              );

              const checkInDate = new Date(updatedCheckIn);
              const checkOutDate = new Date(updatedCheckOut);
              if (checkInDate >= checkOutDate) {
                alert("Check-in time must be before the check-out time.");
                return;
              }

              // Phone Number Validation (10 digits, all numbers)
              const phoneRegex = /^[0-9]{10}$/;
              if (!phoneRegex.test(updatedMobileNumber1)) {
                alert("Mobile Number 1 must be a 10-digit numeric value.");
                return;
              }
              if (
                updatedMobileNumber2 &&
                !phoneRegex.test(updatedMobileNumber2)
              ) {
                // Allow second number to be optional
                alert("Mobile Number 2 must be a 10-digit numeric value.");
                return;
              }

              // Aadhaar Number Validation (12 digits, all numbers)
              const aadhaarRegex = /^[0-9]{12}$/;
              if (!aadhaarRegex.test(updatedAadhaarNumber)) {
                alert("Aadhaar Number must be a 12-digit numeric value.");
                return;
              }

              // Check if a new Aadhaar scan is uploaded
              const aadhaarScanFile =
                document.getElementById("aadhaar-scan").files[0];

              let aadhaarScanPromise;

              if (aadhaarScanFile) {
                // If a new Aadhaar scan is uploaded, upload it
               // const uniqueCode = generateUniqueCode();
                const aadhaarScanStorageRef = storageRef(
                  storage,
                  `aadhaarScans/${uniqueCode}`
                );
                aadhaarScanPromise = uploadBytes(
                  aadhaarScanStorageRef,
                  aadhaarScanFile
                ).then(() => {
                  return getDownloadURL(aadhaarScanStorageRef);
                });
              } else {
                // No new scan, reuse the existing one
                aadhaarScanPromise = Promise.resolve(aadhaarScanURL);
              }

              // Update the room data once the Aadhaar scan upload (if any) is complete
              aadhaarScanPromise
                .then((aadhaarScanURL) => {
                  room.guest = updatedGuestName;
                  room.checkIn = updatedCheckIn;
                  room.checkOut = updatedCheckOut;
                  room.aadhaarNumber = updatedAadhaarNumber;
                  room.aadhaarScan = aadhaarScanURL; // Store updated/reused Aadhaar scan URL
                  room.mobileNumber1 = updatedMobileNumber1;
                  room.mobileNumber2 = updatedMobileNumber2;
                  room.purpose = updatedPurpose;
                  room.advanceAmount = updatedAdvanceAmount;
                  room.numberOfVisitors = updateNumberOfVisitors;

                  // Update the room data in the database
                  return update(roomRef, room);
                })
                .then(() => {
                  alert(`Room ${room.roomNumber} details updated.`);
                  bookingPopup.style.display = "none";
                  loadRooms(hotelId); // Reload rooms data
                })
                .catch((error) => {
                  console.error("Error updating room: ", error);
                });
            };
          } else {
            alert("Room is not booked or does not exist.");
          }
        })
        .catch((error) => {
          console.error("Error fetching room data for editing: ", error);
        });
    }
  });
}

// Function to set up the checkout room button functionality
function setupCheckoutRoomButton() {
  // Set up the checkout button
  document
    .getElementById("checkout-room-btn")
    .addEventListener("click", handleCheckout);

  function handleCheckout() {
    const roomNumber = prompt("Enter room number to checkout:");
    if (roomNumber) {
      const roomIndex = parseInt(roomNumber, 10) - 1; // Adjust for zero-based index
      const roomRef = ref(db, `hotels/${hotelId}/rooms/${roomIndex}`);

      get(roomRef)
        .then((snapshot) => {
          const room = snapshot.val();
          if (room && room.status === "Booked") {
            document.getElementById("checkout-popup").style.display = "block";

            // Close button logic
            document
              .getElementById("close-checkout-popup-btn")
              .addEventListener("click", function () {
                document.getElementById("checkout-popup").style.display =
                  "none";
              });

            // Handle form submission for checkout
            document.getElementById("checkout-form").onsubmit = function (e) {
              e.preventDefault();
              const totalAmount = parseFloat(
                document.getElementById("total-amount").value
              );

              const roomData = {
                roomNumber: room.roomNumber,
                guestName: room.guest,
                checkIn: room.checkIn,
                checkOut: room.checkOut,
                advanceAmount: room.advanceAmount,
                balanceAmount: totalAmount,
                hotelUniqueCode: uniqueHotelId.textContent,
                aadhaarScan: room.aadhaarScan,
              };

              // Send data to Google Apps Script Web App
              fetch(
                "https://script.google.com/macros/s/AKfycbw_YCsqOcOTTIeUvEh5IORlV_tIHzJFleGshxLldG2ALNjIh3006rx4UCmLx8Dez-ee/exec",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(roomData),
                  mode: "no-cors",
                }
              )
                .then((response) => {
                  if (response.ok) {
                    alert("Room details and balance updated in Google Sheet!");
                  }
                })
                .catch((error) => {
                  console.error("Error updating Google Sheet:", error);
                });

              // Update room details to clear guest data
              room.status = "Available";
              room.guest = null;
              room.aadhaarNumber = null;
              room.aadhaarScan = null;
              room.mobileNumber1 = null;
              room.mobileNumber2 = null;
              room.purpose = null;
              room.numberOfVisitors = null;
              room.checkIn = null;
              room.checkOut = null;
              room.advanceAmount = null; // Or any other logic you have for clearing

              // Save updated room details
              update(roomRef, room)
                .then(() => {
                  alert(`Room ${roomNumber} checked out successfully.`);
                  document.getElementById("checkout-popup").style.display =
                    "none";
                  loadRooms(hotelId); // Reload rooms data
                })
                .catch((error) => {
                  console.error("Error checking out room: ", error);
                });
            };
          } else {
            alert("Room is not booked or does not exist.");
          }
        })
        .catch((error) => {
          console.error("Error fetching room data for checkout: ", error);
        });
    }
  }
}
