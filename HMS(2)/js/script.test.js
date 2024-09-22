// login.test.js

// Import the required functions from the selected code
const { signInWithEmailAndPassword } = require('./script');

// Mock Firebase authentication
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn()
}));

// Mock window.location
Object.defineProperty(window, 'location', {
    writable: true,
    value: {
        href: ''
    }
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn()
    }
});

// Test case for login with valid email and password
test('should handle login with valid email and password', async () => {
    // Mock the signInWithEmailAndPassword function to return a resolved promise
    signInWithEmailAndPassword.mockResolvedValue({
        user: {
            uid: '12345'
        }
    });

    // Simulate a login form submission
    const loginForm = {
        email: 'test@example.com',
        password: 'password123'
    };

    // Call the function to handle login form submission
    await handleLoginFormSubmit(loginForm);

    // Assert that the user is redirected to the dashboard
    expect(window.location.href).toBe('dashboard.html');

    // Assert that the user's ID is stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('loggedInUser', JSON.stringify({ uid: '12345' }));
});