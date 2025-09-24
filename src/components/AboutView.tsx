import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Info, Shield, Brain, Heart, Users, Zap, Lock, Globe } from 'lucide-react';

const AboutView: React.FC = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning models analyze your health data to provide personalized risk assessments and recommendations.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All your health data is stored locally on your device. We never send your personal information to our servers.'
    },
    {
      icon: Heart,
      title: 'Comprehensive Health Tracking',
      description: 'Monitor vital signs, track progress over time, and get insights into your overall health trends.'
    },
    {
      icon: Users,
      title: 'Community Insights',
      description: 'Compare your health metrics with regional and global averages while maintaining complete anonymity.'
    },
    {
      icon: Zap,
      title: 'Real-time Analysis',
      description: 'Get instant feedback on your health vitals with emergency alerts for critical conditions.'
    },
    {
      icon: Globe,
      title: 'Global Disease Tracking',
      description: 'Stay informed about disease outbreaks and health trends in your region and worldwide.'
    }
  ];

  const technologies = [
    { name: 'React & TypeScript', purpose: 'Modern, type-safe frontend development' },
    { name: 'Machine Learning Models', purpose: 'Risk prediction and health analysis' },
    { name: 'Web Speech API', purpose: 'Voice interaction with AI companion' },
    { name: 'Local Storage', purpose: 'Privacy-first data storage' },
    { name: 'Recharts', purpose: 'Interactive health data visualization' },
    { name: 'Tailwind CSS', purpose: 'Responsive and accessible design' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Info className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            About AI Agentic
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered health risk prediction and analysis platform
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Our Mission
        </h2>
        <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          AI Agentic is designed to democratize access to advanced health analytics while maintaining absolute privacy. 
          We believe everyone should have access to personalized health insights without compromising their personal data. 
          Our platform combines cutting-edge AI technology with medical expertise to provide actionable health guidance 
          that empowers individuals to make informed decisions about their wellbeing.
        </p>
      </div>

      {/* Key Features */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <feature.icon className={`w-8 h-8 mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8`}>
        <div className="flex items-center space-x-3 mb-6">
          <Lock className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Privacy & Security
          </h2>
        </div>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
              Local Data Storage
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-200' : 'text-green-700'}`}>
              All your health data, including vitals, medical images, and chat history, is stored exclusively 
              in your browser's local storage. This data never leaves your device.
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              No Server Communication
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
              AI Agentic operates entirely in your browser. We don't collect, store, or transmit any personal 
              health information to external servers.
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
              Optional AI Integration
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-purple-700'}`}>
              AI features are optional and require your explicit consent. You can use your own API keys 
              for enhanced AI-powered health analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technologies.map((tech, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div>
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {tech.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tech.purpose}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className={`rounded-xl border-2 ${theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} p-8`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
          Important Medical Disclaimer
        </h2>
        <div className={`space-y-3 text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>
          <p>
            <strong>AI Agentic is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</strong>
          </p>
          <p>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. 
            Never disregard professional medical advice or delay in seeking it because of something you have read or learned from AI Agentic.
          </p>
          <p>
            The AI predictions and analyses provided by AI Agentic are based on general health guidelines and statistical models. 
            They should not be considered as definitive medical diagnoses or treatment recommendations.
          </p>
          <p>
            If you think you may have a medical emergency, call your doctor or emergency services immediately.
          </p>
        </div>
      </div>

      {/* Version Info */}
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>
          AI Agentic v1.0.0 | Built with ❤️ for better health outcomes
        </p>
        <p className="text-xs mt-2">
          © 2024 AI Agentic Health Platform. Privacy-first health analytics.
        </p>
      </div>
    </div>
  );
};

export default AboutView;