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
