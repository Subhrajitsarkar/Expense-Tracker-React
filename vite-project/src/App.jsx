// The user needs to install react-router-dom by running: npm install react-router-dom
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
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

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <BrowserRouter>
          <div className="App">
            <main>
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;