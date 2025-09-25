import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import HealthCheckup from './components/HealthCheckup';
import HealthReport from './components/HealthReport';
import ImageAnalysis from './components/ImageAnalysis';
import AICompanion from './components/AICompanion';
import CommunityHealth from './components/CommunityHealth';
import DiseaseTracker from './components/DiseaseTracker';
import ProgressTracking from './components/ProgressTracking';
import { UserProfile, Vitals, HealthRecord } from './types';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState('checkup');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [currentVitals, setCurrentVitals] = useState<Vitals | null>(null);
  const [lastReport, setLastReport] = useState<string | null>(null);

  useEffect(() => {
    // Load saved profile and data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    const savedRecords = localStorage.getItem('healthRecords');
    const savedReport = localStorage.getItem('lastReport');

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    if (savedRecords) {
      setHealthRecords(JSON.parse(savedRecords));
    }
    if (savedReport) {
      setLastReport(savedReport);
    }
  }, []);

  const handleProfileComplete = (profile: UserProfile) => {
    // Set default API provider if not set
    const completeProfile = {
      ...profile,
      apiProvider: profile.apiProvider || 'openai',
      apiKey: profile.apiKey || ''
    };
    
    setUserProfile(completeProfile);
    localStorage.setItem('userProfile', JSON.stringify(completeProfile));
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
  };

  const handleVitalsSubmit = (vitals: Vitals) => {
    setCurrentVitals(vitals);
    
    // Create new health record
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date: vitals.date,
      vitals,
      notes: `Health check-up - ${vitals.timeOfDay}`
    };
    
    const updatedRecords = [...healthRecords, newRecord];
    setHealthRecords(updatedRecords);
    localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    
    // Navigate to report view
    setCurrentView('report');
  };

  const renderCurrentView = () => {
    if (!userProfile) return null;

    switch (currentView) {
      case 'checkup':
        return (
          <HealthCheckup
            userProfile={userProfile}
            onVitalsSubmit={handleVitalsSubmit}
            lastReport={lastReport}
          />
        );
      case 'report':
        if (currentVitals) {
          return (
            <HealthReport
              userProfile={userProfile}
              vitals={currentVitals}
              healthHistory={healthRecords.map(r => r.vitals)}
            />
          );
        }
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-400 mb-4">No health data available</p>
              <button
                onClick={() => setCurrentView('checkup')}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Take Health Check-up
              </button>
            </div>
          </div>
        );
      case 'imaging':
        return <ImageAnalysis userProfile={userProfile} />;
      case 'companion':
        return <AICompanion userProfile={userProfile} />;
      case 'community':
        return <CommunityHealth userProfile={userProfile} />;
      case 'disease-tracker':
        return <DiseaseTracker userProfile={userProfile} />;
      case 'progress':
        return <ProgressTracking userProfile={userProfile} healthRecords={healthRecords} />;
      case 'about':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">About AI Agentic Health Tracker</h2>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Privacy-First Design</h3>
                  <p>All your health data is stored locally on your device. We never send your personal health information to external servers.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                  <p>Our advanced AI provides personalized health recommendations based on WHO standards and regional health patterns.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>Health vitals monitoring with emergency alerts</li>
                    <li>Medical image analysis (X-rays, MRI, skin lesions)</li>
                    <li>Personalized diet and exercise recommendations</li>
                    <li>Global disease tracking and community health insights</li>
                    <li>Progress tracking with predictive analytics</li>
                    <li>Bluetooth device integration</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Important Disclaimer</h4>
                  <p className="text-yellow-300 text-sm">
                    This application is for informational purposes only and does not provide medical advice. 
                    Always consult with qualified healthcare professionals for medical diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <HealthCheckup userProfile={userProfile} onVitalsSubmit={handleVitalsSubmit} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {!userProfile ? (
          <ProfileSetup onComplete={handleProfileComplete} />
        ) : (
          <Dashboard
            userProfile={userProfile}
            currentView={currentView}
            onViewChange={setCurrentView}
            onUpdateProfile={handleUpdateProfile}
          >
            {renderCurrentView()}
          </Dashboard>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;