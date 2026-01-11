import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from './firebaseUtils';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const isFormValid = email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await sendPasswordResetEmail(email);
            setSuccess(result.message);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to send password reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <header className="header">
                <div className="header-content">
                    <div className="logo">MyWebLink</div>
                    <nav className="nav">
                        <a href="#home">Home</a>
                        <a href="#products">Products</a>
                        <a href="#about">About Us</a>
                    </nav>
                </div>
            </header>

            <div className="signup-wrapper">
                <div className="blue-decoration"></div>

                <div className="form-container">
                    <div className="form-card">
                        <h2>Forgot Password?</h2>
                        <p className="form-subtitle">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {success && (
                            <div className="success-message">
                                ✓ {success}
                            </div>
                        )}
                        {error && (
                            <div className="error-message">
                                ✗ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading || success}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-signup"
                                disabled={!isFormValid || loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <Link to="/login" className="btn-login">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
