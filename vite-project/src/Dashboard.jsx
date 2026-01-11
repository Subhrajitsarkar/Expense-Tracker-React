import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            calculateProfileCompletion(parsedUser);
        }
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
                    {user && (
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
