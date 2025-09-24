import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import HealthCheck from './HealthCheck';
import ProgressView from './ProgressView';
import CommunityView from './CommunityView';
import DiseaseTracker from './DiseaseTracker';
import ImageAnalysis from './ImageAnalysis';
import AICompanion from './AICompanion';
import HealthReport from './HealthReport';
import AboutView from './AboutView';
import AISettingsPage from './AISettings';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex`}>
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/checkup" replace />} />
          <Route path="/checkup" element={<HealthCheck />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/community" element={<CommunityView />} />
          <Route path="/disease-tracker" element={<DiseaseTracker />} />
          <Route path="/imaging" element={<ImageAnalysis />} />
          <Route path="/companion" element={<AICompanion />} />
          <Route path="/report" element={<HealthReport />} />
          <Route path="/ai-settings" element={<AISettingsPage />} />
          <Route path="/about" element={<AboutView />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;