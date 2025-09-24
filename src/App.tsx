import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfileProvider } from './contexts/ProfileContext';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import { getStoredProfile } from './services/storageService';

function App() {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = () => {
      const profile = getStoredProfile();
      setIsProfileComplete(!!profile?.age && !!profile?.country && !!profile?.city);
      setLoading(false);
    };

    checkProfile();
  }, []);

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ProfileProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route 
                path="/setup" 
                element={<ProfileSetup onComplete={handleProfileComplete} />} 
              />
              <Route 
                path="/dashboard/*" 
                element={isProfileComplete ? <Dashboard /> : <Navigate to="/setup" replace />} 
              />
              <Route 
                path="/" 
                element={<Navigate to={isProfileComplete ? "/dashboard" : "/setup"} replace />} 
              />
            </Routes>
          </div>
        </Router>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;