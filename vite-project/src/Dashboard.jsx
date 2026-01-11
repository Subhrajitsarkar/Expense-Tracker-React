import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserDataFromFirebase } from './firebaseUtils';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user data from Firebase first
        const loadUserData = async () => {
            const firebaseUser = await fetchUserDataFromFirebase();

            if (firebaseUser) {
                setUser(firebaseUser);
                calculateProfileCompletion(firebaseUser);
            } else {
                // Fallback to localStorage if Firebase fetch fails
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    calculateProfileCompletion(parsedUser);
                }
            }
            setLoading(false);
        };

        loadUserData();
    }, []);

    const calculateProfileCompletion = (userData) => {
        let completedFields = 0;
        const totalFields = 3; // email, fullName, profilePhotoUrl

        if (userData.email) completedFields++;
        if (userData.fullName) completedFields++;
        if (userData.profilePhotoUrl) completedFields++;

        setProfileCompletion(Math.round((completedFields / totalFields) * 100));
    };

    const handleCompleteProfile = () => {
        navigate('/complete-profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to Expense Tracker!!!</h1>
                {profileCompletion < 100 && (
                    <div className="profile-incomplete-banner">
                        <span className="banner-text">
                            Your profile is incomplete.
                            <button
                                className="complete-link"
                                onClick={handleCompleteProfile}
                            >
                                Complete now
                            </button>
                        </span>
                    </div>
                )}
            </div>

            <div className="dashboard-content">
                <div className="profile-section">
                    {loading ? (
                        <p className="loading-text">Loading your profile...</p>
                    ) : user ? (
                        <>
                            <h2>Your Profile</h2>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Full Name:</strong> {user.fullName || 'Not set'}</p>
                            <p><strong>Profile Photo URL:</strong> {user.profilePhotoUrl || 'Not set'}</p>
                            <p className="profile-completion">
                                Profile Completion: {profileCompletion}%
                            </p>
                            {profileCompletion < 100 && (
                                <button
                                    className="btn-complete-profile"
                                    onClick={handleCompleteProfile}
                                >
                                    Complete Your Profile
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="error-text">Unable to load profile. Please try logging in again.</p>
                    )}
                </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
