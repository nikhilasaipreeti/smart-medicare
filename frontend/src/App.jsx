// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Appointments from './pages/Appointments';
import DoctorList from './pages/DoctorList';
import OnlineConsultation from './pages/OnlineConsultation';
import Pharmacy from './pages/Pharmacy';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import { api } from './services/api';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [systemHealth, setSystemHealth] = useState({});

  // Check backend connection on app start
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const health = await api.healthCheck();
      const apiTest = await api.testConnection();
      
      setSystemHealth({
        database: health.database,
        status: health.status,
        message: apiTest.message
      });
      setBackendStatus('connected');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('disconnected');
      setSystemHealth({
        database: 'Disconnected',
        status: 'Error',
        message: 'Backend unavailable'
      });
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await api.login(credentials);
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.user);
        setUserRole(result.user.role.toLowerCase());
        setUserData({
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone || ''
        });
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const handleSignup = async (userData) => {
    try {
      const result = await api.register(userData);
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.user);
        setUserRole('patient'); // Default role for new users
        setUserData({
          name: result.user.name,
          email: result.user.email,
          phone: userData.phone || ''
        });
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserRole('patient');
    setUserData({ name: '', email: '', phone: '' });
  };
  // Add this useEffect in your App component
useEffect(() => {
  checkExistingAuth();
}, []);

const checkExistingAuth = async () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    try {
      // Verify token is still valid
      const result = await api.getCurrentUser();
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.user);
        setUserRole(result.user.userType);
        setUserData(result.user);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
  // Show backend status in development
  const BackendStatusIndicator = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`backend-status ${backendStatus}`}>
          Backend: {backendStatus === 'connected' ? '✅' : '❌'}
          {backendStatus === 'disconnected' && (
            <button 
              onClick={checkBackendConnection}
              className="retry-btn"
            >
              Retry
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 custom-cursor">
        <BackendStatusIndicator />
        
        <Header 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn}
          user={user}
          setUser={setUser}
          userRole={userRole}
          setUserRole={setUserRole}
          onLogout={handleLogout}
          backendStatus={backendStatus}
        />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Home 
                  backendStatus={backendStatus}
                  systemHealth={systemHealth}
                />
              } 
            />
            <Route path="/contact" element={<Contact />} />
            // In your App.jsx, make sure the Login route looks like this:
<Route 
  path="/login" 
  element={
    !isLoggedIn ? (
      <Login 
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
        setUserRole={setUserRole}
        setUserData={setUserData}
      />
    ) : (
      <Navigate to={`/${userRole}-dashboard`} />
    )
  } 
/>
            <Route 
  path="/signup" 
  element={
    !isLoggedIn ? (
      <Signup 
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
        setUserRole={setUserRole}
        setUserData={setUserData}
      />
    ) : (
      <Navigate to={`/${userRole}-dashboard`} />
    )
  } 
/>

            {/* Protected Routes - Role Specific */}
            <Route 
              path="/patient-dashboard" 
              element={
                isLoggedIn && userRole === 'patient' ? (
                  <PatientDashboard 
                    user={user}
                    userData={userData}
                    onLogout={handleLogout}
                    backendStatus={backendStatus}
                    systemHealth={systemHealth}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/doctor-dashboard" 
              element={
                isLoggedIn && userRole === 'doctor' ? (
                  <DoctorDashboard 
                    user={user}
                    userData={userData}
                    onLogout={handleLogout}
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                isLoggedIn && userRole === 'admin' ? (
                  <AdminDashboard 
                    user={user}
                    userData={userData}
                    onLogout={handleLogout}
                    backendStatus={backendStatus}
                    systemHealth={systemHealth}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            {/* Protected Routes - General */}
            <Route 
              path="/appointments" 
              element={
                isLoggedIn ? (
                  <Appointments 
                    user={user}
                    userRole={userRole}
                    userData={userData}
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/doctors" 
              element={
                isLoggedIn ? (
                  <DoctorList 
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/consultation" 
              element={
                isLoggedIn ? (
                  <OnlineConsultation 
                    user={user}
                    userRole={userRole}
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/pharmacy" 
              element={
                isLoggedIn ? (
                  <Pharmacy 
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/feedback" 
              element={
                isLoggedIn ? (
                  <Feedback 
                    backendStatus={backendStatus}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            {/* Redirect based on login status */}
            <Route 
              path="/dashboard" 
              element={
                isLoggedIn ? (
                  <Navigate to={`/${userRole}-dashboard`} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                isLoggedIn ? (
                  <Navigate to={`/${userRole}-dashboard`} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;