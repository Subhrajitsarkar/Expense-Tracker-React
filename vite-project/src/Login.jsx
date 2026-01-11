import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email && password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      setError('Firebase API Key is not configured. Please check your .env file.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
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

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || 'An unknown error occurred.';
        throw new Error(errorMessage);
      }

      console.log('User has successfully logged in', data);
      localStorage.setItem('firebaseToken', data.idToken);
      navigate('/welcome');

    } catch (err) {
      console.error('Login Error:', err);
      let userFriendlyError = 'Login failed. Please check your credentials.';
      if (err.message.includes('INVALID_PASSWORD') || err.message.includes('EMAIL_NOT_FOUND')) {
        userFriendlyError = 'Invalid email or password.';
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
            <h2>Login</h2>
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
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="btn-signup" disabled={!isFormValid || loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <Link to="/signup" className="btn-login">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
