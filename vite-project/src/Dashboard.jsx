import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserDataFromFirebase, sendVerificationEmail } from './firebaseUtils';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import AddExpense from './AddExpense';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const { toggleTheme, theme } = useTheme();
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        // Fetch user data from Firebase first
        const loadUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            const firebaseUser = await fetchUserDataFromFirebase();

            if (firebaseUser) {
                updateUser(firebaseUser);
                setEmailVerified(firebaseUser.emailVerified || false);
                calculateProfileCompletion(firebaseUser);
            } else {
                setEmailVerified(user.emailVerified || false);
                calculateProfileCompletion(user);
            }
            setLoading(false);
        };

        loadUserData();
    }, [user, updateUser]);

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

    const handleSendVerificationEmail = async () => {
        setVerificationMessage('');
        setVerificationError('');
        setVerificationLoading(true);

        try {
            const result = await sendVerificationEmail();
            setVerificationMessage(result.message);
        } catch (err) {
            setVerificationError(err.message || 'Failed to send verification email');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-top">
                    <h1>Welcome to Expense Tracker!!!</h1>
                    <div className="header-buttons">
                        <button
                            className="btn-theme-toggle"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
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

                <AddExpense />
            </div>
        </div>
    );
};

export default Dashboard;
