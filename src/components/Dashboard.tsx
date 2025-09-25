import React, { useState } from 'react';
import { 
  Activity, Users, TrendingUp, FileText, Info, Image, MessageCircle, 
  Stethoscope, Sun, Moon, Settings, Menu, X, Zap, Key
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import APISettings from './APISettings';

interface DashboardProps {
  userProfile: any;
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onUpdateProfile: (updates: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userProfile, 
  children, 
  currentView, 
  onViewChange,
  onUpdateProfile
}) => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAPISettings, setShowAPISettings] = useState(false);

  const menuItems = [
    { id: 'checkup', icon: Activity, label: 'Health Check-up', color: 'text-red-500' },
    { id: 'imaging', icon: Image, label: 'Image Analysis', color: 'text-purple-500' },
    { id: 'companion', icon: MessageCircle, label: 'AI Companion', color: 'text-blue-500' },
    { id: 'community', icon: Users, label: 'Community Health', color: 'text-green-500' },
    { id: 'disease-tracker', icon: Stethoscope, label: 'Disease Tracker', color: 'text-yellow-500' },
    { id: 'progress', icon: TrendingUp, label: 'Progress Tracking', color: 'text-indigo-500' },
    { id: 'report', icon: FileText, label: 'Health Report', color: 'text-pink-500' },
    { id: 'about', icon: Info, label: 'About', color: 'text-gray-500' }
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden p-0.5" style={{ background: 'var(--accent-gradient)' }}>
                  <img 
                    src="/logo.png" 
                    alt="AI Agentic"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const canvas = document.createElement('canvas');
                      canvas.width = 40;
                      canvas.height = 40;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        const gradient = ctx.createLinearGradient(0, 0, 40, 40);
                        gradient.addColorStop(0, '#e74c3c');
                        gradient.addColorStop(1, '#9b59b6');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 40, 40);
                        (e.target as HTMLImageElement).src = canvas.toDataURL();
                      }
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    AI Agentic
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Health Tracker
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-700"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id 
                    ? 'bg-gradient-to-r from-red-500/20 to-purple-600/20 border border-red-500/30' 
                    : 'hover:bg-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                {currentView === item.id && (
                  <Zap className="w-4 h-4 ml-auto text-red-500" />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI Settings</span>
              <button
                onClick={() => setShowAPISettings(true)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Configure AI API"
              >
                <Key className="w-5 h-5 text-blue-500" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
              </button>
            </div>
            
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p className="mb-1">👋 Hello, {userProfile?.name}</p>
              <p className="text-green-500">🔒 Data stored locally</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <header className="h-16 px-6 flex items-center justify-between border-b" style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--bg-tertiary)'
        }}>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
            
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {userProfile?.city}, {userProfile?.country}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* API Settings Modal */}
      {showAPISettings && (
        <APISettings
          userProfile={userProfile}
          onSave={(apiConfig) => onUpdateProfile(apiConfig)}
          onClose={() => setShowAPISettings(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;