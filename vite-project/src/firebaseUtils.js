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

