// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Check which page is loaded
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === 'index.html') {
        handleLogin();
    } else if (page === 'register.html') {
        handleRegistration();
    } else if (page === 'dashboard.html') {
        handleDashboard();
    }
});

// Handle Login
function handleLogin() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const hotels = JSON.parse(localStorage.getItem('hotels')) || [];
        const hotel = hotels.find(h => h.ownerEmail === email && h.password === password);

        if (hotel) {
            localStorage.setItem('loggedInHotel', JSON.stringify(hotel));
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password.');
        }
    });
}

// Handle Registration
function handleRegistration() {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const hotelName = document.getElementById('hotel-name').value;
        const ownerEmail = document.getElementById('owner-email').value;
        const password = document.getElementById('password').value;
        const numberOfRooms = parseInt(document.getElementById('number-of-rooms').value);
        const facilities = document.getElementById('facilities').value;
        const costPerRoom = parseFloat(document.getElementById('cost-per-room').value);

        const hotels = JSON.parse(localStorage.getItem('hotels')) || [];

        // Check if email already exists
        const existingHotel = hotels.find(h => h.ownerEmail === ownerEmail);
        if (existingHotel) {
            alert('A hotel with this email already exists.');
            return;
        }

        const newHotel = {
            id: Date.now(),
            hotelName,
            ownerEmail,
            password,
            numberOfRooms,
            facilities,
            costPerRoom,
            rooms: initializeRooms(numberOfRooms)
        };

        hotels.push(newHotel);
        localStorage.setItem('hotels', JSON.stringify(hotels));
        alert('Registration successful! Please login.');
        window.location.href = 'index.html';
    });
}

// Initialize Rooms
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

// Handle Dashboard
function handleDashboard() {
    const loggedInHotel = JSON.parse(localStorage.getItem('loggedInHotel'));

    if (!loggedInHotel) {
        window.location.href = 'index.html';
        return;
    }

    // Display Hotel Info
    document.getElementById('hotel-name').innerText = loggedInHotel.hotelName;
    document.getElementById('owner-email').innerText = loggedInHotel.ownerEmail;
    document.getElementById('number-of-rooms').innerText = loggedInHotel.numberOfRooms;
    document.getElementById('facilities').innerText = loggedInHotel.facilities;
    document.getElementById('cost-per-room').innerText = loggedInHotel.costPerRoom.toFixed(2);

    // Populate Room Table
    const roomTableBody = document.getElementById('room-table-body');
    roomTableBody.innerHTML = '';
    loggedInHotel.rooms.forEach(room => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${room.roomNumber}</td>
            <td>${room.status}</td>
            <td>${room.guest}</td>
            <td>${room.checkIn}</td>
            <td>${room.checkOut}</td>
        `;
        roomTableBody.appendChild(tr);
    });

    // Handle Logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInHotel');
        window.location.href = 'index.html';
    });

    // Handle Booking and Checkout
    const bookRoomBtn = document.getElementById('book-room-btn');
    const checkoutRoomBtn = document.getElementById('checkout-room-btn');

    bookRoomBtn.addEventListener('click', () => {
        const availableRooms = loggedInHotel.rooms.filter(r => r.status === 'Available');
        if (availableRooms.length === 0) {
            alert('No available rooms.');
            return;
        }
        const roomNumber = prompt(`Enter Room Number to Book (Available: ${availableRooms.map(r => r.roomNumber).join(', ')})`);
        const room = loggedInHotel.rooms.find(r => r.roomNumber == roomNumber);
        if (room && room.status === 'Available') {
            const guest = prompt('Enter Guest Name:');
            if (guest) {
                room.status = 'Booked';
                room.guest = guest;
                const checkIn = new Date().toLocaleString();
                room.checkIn = checkIn;
                // Generate a random password (for demonstration)
                room.checkOut = new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString(); // Expires in 2 hours
                // Update localStorage
                updateHotelData(loggedInHotel);
                alert(`Room ${roomNumber} booked successfully. Check-Out time: ${room.checkOut}`);
                window.location.reload();
            }
        } else {
            alert('Invalid room number or room is not available.');
        }
    });

    checkoutRoomBtn.addEventListener('click', () => {
        const bookedRooms = loggedInHotel.rooms.filter(r => r.status === 'Booked');
        if (bookedRooms.length === 0) {
            alert('No rooms are currently booked.');
            return;
        }
        const roomNumber = prompt(`Enter Room Number to Check Out (Booked: ${bookedRooms.map(r => r.roomNumber).join(', ')})`);
        const room = loggedInHotel.rooms.find(r => r.roomNumber == roomNumber);
        if (room && room.status === 'Booked') {
            room.status = 'Available';
            room.guest = '';
            room.checkIn = '';
            room.checkOut = '';
            // Update localStorage
            updateHotelData(loggedInHotel);
            alert(`Room ${roomNumber} checked out successfully.`);
            window.location.reload();
        } else {
            alert('Invalid room number or room is not booked.');
        }
    });
}

// Update Hotel Data in localStorage
function updateHotelData(updatedHotel) {
    let hotels = JSON.parse(localStorage.getItem('hotels')) || [];
    hotels = hotels.map(h => h.id === updatedHotel.id ? updatedHotel : h);
    localStorage.setItem('hotels', JSON.stringify(hotels));
    localStorage.setItem('loggedInHotel', JSON.stringify(updatedHotel));
}
