import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import store from './store/index';
import { useAuth } from './hooks/useRedux';
import { restoreSession } from './store/slices/authSlice';
import SignUp from './SignUp';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Welcome from './Welcome';
import Dashboard from './Dashboard';
import ProfileCompletion from './ProfileCompletion';
import './App.css';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/welcome" element={isAuthenticated ? <Welcome /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/complete-profile" element={isAuthenticated ? <ProfileCompletion /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function AppInitializer({ children }) {
  const dispatch = useDispatch();

  //This runs once immediately when the app loads.
  useEffect(() => {
    const token = localStorage.getItem('firebaseToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch(restoreSession({
          isAuthenticated: true,
          user,
          token,
          userId: user.userId,
        }));
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <BrowserRouter>
          <div className="App">
            <main>
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </AppInitializer>
    </Provider>
  );
}

export default App;