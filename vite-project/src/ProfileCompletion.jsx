import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserDataFromFirebase } from './firebaseUtils';

const ProfileCompletion = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);
    const [fetchingData, setFetchingData] = useState(true);

    useEffect(() => {
        // Fetch user data from Firebase first
        const loadUserData = async () => {
            const firebaseUser = await fetchUserDataFromFirebase();

            if (firebaseUser) {
                setUser(firebaseUser);
                setFullName(firebaseUser.fullName || '');
                setProfilePhotoUrl(firebaseUser.profilePhotoUrl || '');
            } else {
                // Fallback to localStorage if Firebase fetch fails
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setFullName(parsedUser.fullName || '');
                    setProfilePhotoUrl(parsedUser.profilePhotoUrl || '');
                }
            }
            setFetchingData(false);
        };

        loadUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fullName.trim() || !profilePhotoUrl.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('firebaseToken');
            const userData = JSON.parse(localStorage.getItem('user'));

            // Update user data in localStorage
            const updatedUserData = {
                ...userData,
                fullName: fullName.trim(),
                profilePhotoUrl: profilePhotoUrl.trim(),
            };

            // Call Firebase REST API to update user profile
            const apiKey = import.meta.env.VITE_API_KEY;

            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idToken: token,
                        displayName: fullName.trim(),
                        photoUrl: profilePhotoUrl.trim(),
                        returnSecureToken: true,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error?.message || 'Failed to update profile';
                throw new Error(errorMessage);
            }

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(updatedUserData));

            setSuccess('Profile updated successfully!');

            // Redirect back to dashboard after 1.5 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err) {
            console.error('Profile Update Error:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <div className="profile-completion-wrapper">
            <div className="profile-completion-banner">
                <p className="banner-quote">Winners never quite, Quitters never win.</p>
                {false && (
                    <div className="profile-status">
                        Your Profile is 64% completed. A complete Profile has higher chances of landing a job.
                        <a href="#complete" className="complete-now-link">Complete now</a>
                    </div>
                )}
            </div>

            <div className="profile-completion-container">
                <div className="profile-form-card">
                    <div className="form-header">
                        <h2>Contact Details</h2>
                        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                    </div>

                    {success && <div className="success-message">{success}</div>}
                    {error && <div className="error-message">{error}</div>}

                    {fetchingData ? (
                        <div className="loading-text" style={{ padding: '2rem', textAlign: 'center' }}>
                            Loading your profile data...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">
                                        <span className="icon">👤</span> Full Name:
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="profilePhoto">
                                        <span className="icon">🌐</span> Profile Photo URL
                                    </label>
                                    <input
                                        type="url"
                                        id="profilePhoto"
                                        value={profilePhotoUrl}
                                        onChange={(e) => setProfilePhotoUrl(e.target.value)}
                                        placeholder="Enter your profile photo URL"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-update"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletion;
