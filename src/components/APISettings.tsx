import React, { useState, useEffect } from 'react';
import { Key, Save, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface APISettingsProps {
  userProfile: UserProfile;
  onSave: (apiConfig: { apiProvider: string; apiKey: string }) => void;
  onClose: () => void;
}

const APISettings: React.FC<APISettingsProps> = ({ userProfile, onSave, onClose }) => {
  const [apiProvider, setApiProvider] = useState(userProfile.apiProvider || 'openai');
  const [apiKey, setApiKey] = useState(userProfile.apiKey || '');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave({ apiProvider, apiKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 mr-3 text-blue-500" />
          <h2 className="text-xl font-bold text-white">AI Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              AI Provider
            </label>
            <select
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="openai" className="bg-gray-800">OpenAI (Recommended)</option>
              <option value="huggingface" className="bg-gray-800">Hugging Face</option>
              <option value="custom" className="bg-gray-800">Custom API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              API Key
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none pr-12"
              />
              {testResult === 'success' && (
                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
              )}
              {testResult === 'error' && (
                <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-xs mt-2 text-gray-400">
              Your API key is stored locally and used only for AI analysis.
            </p>
          </div>

          {apiProvider === 'openai' && (
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                💡 Get your OpenAI API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200"
                >
                  platform.openai.com
                </a>
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              disabled={!apiKey.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Test
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default APISettings;