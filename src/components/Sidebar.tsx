import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Activity, TrendingUp, Users, Brush as Virus, Camera, MessageCircle, FileText, Info, Moon, Sun, Brain, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/dashboard/checkup', icon: Activity, label: 'Health Check-up' },
    { path: '/dashboard/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/dashboard/community', icon: Users, label: 'Community' },
    { path: '/dashboard/disease-tracker', icon: Virus, label: 'Disease Tracker' },
    { path: '/dashboard/imaging', icon: Camera, label: 'Medical Imaging' },
    { path: '/dashboard/companion', icon: MessageCircle, label: 'AI Companion' },
    { path: '/dashboard/report', icon: FileText, label: 'Health Report' },
    { path: '/dashboard/ai-settings', icon: Settings, label: 'AI Settings' },
    { path: '/dashboard/about', icon: Info, label: 'About' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full w-64 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-r shadow-lg z-50`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <img src="/app-icon.png" alt="AI Agentic" className="w-8 h-8" />
          <div>
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              AI Agentic
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Health Tracker
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-colors ${
              theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;