import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email && password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setError('Firebase API Key is not configured. Please check your .env file.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();   //raw text converts to JSON obj

      if (!response.ok) {
        const errorMessage = data.error?.message || 'An unknown error occurred.';
        throw new Error(errorMessage);
      }

      console.log('User has successfully signed up', data);

      // Store user data in localStorage
      const userData = {
        email: data.email,
        userId: data.localId,
        fullName: '',
        profilePhotoUrl: '',
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('firebaseToken', data.idToken);

      alert('Successfully signed up!');
      navigate('/dashboard');

    } catch (err) {
      console.error('Signup Error:', err);
      // Map common Firebase error messages to more user-friendly ones
      let userFriendlyError = 'Signup failed. Please try again.';
      if (err.message.includes('EMAIL_EXISTS')) {
        userFriendlyError = 'This email address is already in use.';
      } else if (err.message.includes('WEAK_PASSWORD')) {
        userFriendlyError = 'The password is too weak. It must be at least 6 characters long.';
      }
      setError(userFriendlyError);
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
            <h2>SignUp</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="btn-signup" disabled={!isFormValid || loading}>
                {loading ? 'Signing Up...' : 'Sign up'}
              </button>
            </form>
            <Link to="/login" className="btn-login">
              Have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
