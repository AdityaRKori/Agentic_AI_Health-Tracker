import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Key, Settings, Save, TestTube } from 'lucide-react';

interface AISettings {
  apiKey: string;
  apiProvider: 'openai' | 'huggingface' | 'ollama';
}

const AISettingsPage: React.FC = () => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<AISettings>({
    apiKey: '',
    apiProvider: 'openai'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('oracle-ai-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('oracle-ai-settings', JSON.stringify(settings));
    alert('AI settings saved successfully!');
  };

  const testConnection = async () => {
    if (!settings.apiKey.trim()) {
      setTestResult('Please enter an API key first');
      return;
    }

    setTesting(true);
    setTestResult('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestResult('✅ Connection successful! API key is working.');
      } else {
        const error = await response.json();
        setTestResult(`❌ Connection failed: ${error.error?.message || 'Invalid API key'}`);
      }
    } catch (error) {
      setTestResult('❌ Connection failed: Network error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            AI Configuration
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure your AI provider for enhanced health analysis
          </p>
        </div>
      </div>

      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8`}>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              AI Provider
            </label>
            <select
              value={settings.apiProvider}
              onChange={(e) => setSettings({...settings, apiProvider: e.target.value as any})}
              className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="openai">OpenAI (Recommended)</option>
              <option value="huggingface">Hugging Face (Free Tier)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                className={`w-full pl-10 pr-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter your API key"
              />
            </div>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {settings.apiProvider === 'openai' && 'Get your API key from https://platform.openai.com/api-keys'}
              {settings.apiProvider === 'huggingface' && 'Get your API key from https://huggingface.co/settings/tokens'}
              {settings.apiProvider === 'ollama' && 'Make sure Ollama is running locally on port 11434'}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>

            <button
              onClick={testConnection}
              disabled={testing || !settings.apiKey.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.includes('✅') 
                ? theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                : theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                testResult.includes('✅')
                  ? theme === 'dark' ? 'text-green-300' : 'text-green-800'
                  : theme === 'dark' ? 'text-red-300' : 'text-red-800'
              }`}>
                {testResult}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
          About AI Features
        </h3>
        <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <p>• <strong>Health Reports:</strong> Personalized dietary plans and exercise recommendations</p>
          <p>• <strong>AI Companion:</strong> Interactive health assistant with voice support</p>
          <p>• <strong>Image Analysis:</strong> Detailed explanations of medical imaging results</p>
          <p>• <strong>Trend Analysis:</strong> AI-powered insights from your health progress</p>
        </div>
        <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <strong>Note:</strong> Without an API key, the app will use simulated responses for demonstration purposes.
        </p>
      </div>
    </div>
  );
};

export default AISettingsPage;