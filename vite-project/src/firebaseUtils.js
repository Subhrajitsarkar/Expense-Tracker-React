// Firebase utility functions for user data management

export const fetchUserDataFromFirebase = async () => {
    try {
        const token = localStorage.getItem('firebaseToken');
        const apiKey = import.meta.env.VITE_API_KEY;

        if (!token || !apiKey) {
            console.error('Missing token or API key');
            return null;
        }

        // Call Firebase REST API to get account info
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken: token,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch user data from Firebase:', data.error?.message);
            return null;
        }

        // Extract user info from the response
        if (data.users && data.users.length > 0) {
            const firebaseUser = data.users[0];
            const userData = {
                email: firebaseUser.email,
                userId: firebaseUser.localId,
                fullName: firebaseUser.displayName || '',
                profilePhotoUrl: firebaseUser.photoUrl || '',
                emailVerified: firebaseUser.emailVerified || false,
            };

            // Update localStorage with fresh data from Firebase
            localStorage.setItem('userData', JSON.stringify(userData));

            return userData;
        }

        return null;
    } catch (err) {
        console.error('Error fetching user data from Firebase:', err);
        return null;
    }
};

export const sendVerificationEmail = async () => {
    try {
        const token = localStorage.getItem('firebaseToken');
        const apiKey = import.meta.env.VITE_API_KEY;

        if (!token || !apiKey) {
            throw new Error('Missing authentication token or API key');
        }

        // Call Firebase REST API to send verification email
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestType: 'VERIFY_EMAIL',
                    idToken: token,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const errorCode = data.error?.code;
            const errorMessage = data.error?.message;

            // Handle specific Firebase error codes
            let userFriendlyError = 'Failed to send verification email. Please try again.';

            if (errorCode === 'INVALID_ID_TOKEN') {
                userFriendlyError = 'Your session has expired. Please log in again.';
            } else if (errorCode === 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN') {
                userFriendlyError = 'Your session has expired. Please log in again.';
            } else if (errorCode === 'USER_DISABLED') {
                userFriendlyError = 'Your account has been disabled. Please contact support.';
            } else if (errorCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
                userFriendlyError = 'Too many attempts. Please try again after some time.';
            } else if (errorCode === 'EMAIL_NOT_FOUND') {
                userFriendlyError = 'Email not found. Please check and try again.';
            } else if (errorMessage && errorMessage.includes('ALREADY_VERIFIED')) {
                userFriendlyError = 'Your email is already verified.';
            }

            throw new Error(userFriendlyError);
        }

        return {
            success: true,
            message: 'Verification email sent successfully! Check your email for the verification link.',
        };
    } catch (err) {
        console.error('Error sending verification email:', err);
        throw err;
    }
};

export const sendPasswordResetEmail = async (email) => {
    try {
        const apiKey = import.meta.env.VITE_API_KEY;

        if (!apiKey) {
            throw new Error('Firebase API Key is not configured');
        }

        if (!email) {
            throw new Error('Email is required');
        }

        // Call Firebase REST API to send password reset email
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestType: 'PASSWORD_RESET',
                    email: email.trim(),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const errorCode = data.error?.code;
            const errorMessage = data.error?.message;

            // Handle specific Firebase error codes
            let userFriendlyError = 'Failed to send password reset email. Please try again.';

            if (errorCode === 'EMAIL_NOT_FOUND') {
                userFriendlyError = 'No account found with this email address.';
            } else if (errorCode === 'INVALID_EMAIL') {
                userFriendlyError = 'Please enter a valid email address.';
            } else if (errorCode === 'USER_DISABLED') {
                userFriendlyError = 'This account has been disabled. Please contact support.';
            } else if (errorCode === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
                userFriendlyError = 'Too many attempts. Please try again later.';
            } else if (errorCode === 'OPERATION_NOT_ALLOWED') {
                userFriendlyError = 'Password reset is not enabled for this account.';
            }

            throw new Error(userFriendlyError);
        }

        return {
            success: true,
            message: 'Password reset email sent successfully! Check your email for the password reset link.',
        };
    } catch (err) {
        console.error('Error sending password reset email:', err);
        throw err;
    }
};

// Realtime Database helpers
const FIREBASE_DB_URL = import.meta.env.VITE_FIREBASE_DB_URL || 'https://authentication-app-d8725-default-rtdb.asia-southeast1.firebasedatabase.app';

export const addExpenseToFirebase = async (userId, expense) => {
    try {
        const token = localStorage.getItem('firebaseToken');
        if (!userId || !token) throw new Error('Not authenticated');

        const url = `${FIREBASE_DB_URL}/expenses/${userId}.json?auth=${token}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to add expense');
        }

        // Firebase returns { name: 'generatedId' }
        return { ...expense, id: data.name };
    } catch (err) {
        console.error('Error adding expense to Firebase:', err);
        throw err;
    }
};

export const fetchExpensesFromFirebase = async (userId) => {
    try {
        const token = localStorage.getItem('firebaseToken');
        if (!userId || !token) return [];

        const url = `${FIREBASE_DB_URL}/expenses/${userId}.json?auth=${token}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Failed to fetch expenses:', data?.error || data);
            return [];
        }

        if (!data) return [];

        const items = Object.keys(data).map((key) => ({ id: key, ...data[key] }));

        // Sort by id/key (most recent first if keys are push ids)
        items.sort((a, b) => (a.id < b.id ? 1 : -1));
        return items;
    } catch (err) {
        console.error('Error fetching expenses from Firebase:', err);
        return [];
    }
};

export const deleteExpenseFromFirebase = async (userId, expenseId) => {
    try {
        const token = localStorage.getItem('firebaseToken');
        if (!userId || !token) throw new Error('Not authenticated');

        const url = `${FIREBASE_DB_URL}/expenses/${userId}/${expenseId}.json?auth=${token}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data?.error?.message || 'Failed to delete expense');
        }

        return true;
    } catch (err) {
        console.error('Error deleting expense from Firebase:', err);
        throw err;
    }
};

