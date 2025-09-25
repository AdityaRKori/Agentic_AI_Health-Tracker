import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, Settings, Globe } from 'lucide-react';
import { getAIProvider } from '../services/aiService';
import { UserProfile } from '../types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICompanionProps {
  userProfile: UserProfile;
}

const AICompanion: React.FC<AICompanionProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)', voice: 'en-US' },
    { code: 'hi-IN', name: 'Hindi', voice: 'hi-IN' },
    { code: 'es-ES', name: 'Spanish', voice: 'es-ES' },
    { code: 'fr-FR', name: 'French', voice: 'fr-FR' },
    { code: 'de-DE', name: 'German', voice: 'de-DE' },
    { code: 'ja-JP', name: 'Japanese', voice: 'ja-JP' },
    { code: 'ko-KR', name: 'Korean', voice: 'ko-KR' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)', voice: 'zh-CN' }
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Hello ${userProfile.name}! I'm your AI Health Companion. I can help you with health questions, explain your reports, and provide general wellness advice. How can I assist you today?`,
      timestamp: new Date()
    }]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [userProfile.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiProvider = getAIProvider(userProfile.apiProvider);
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      conversationHistory.push({ role: 'user', content: inputMessage });

      const response = await aiProvider.chatCompletion(conversationHistory, userProfile.apiKey);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please check your API configuration and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedLang = languages.find(lang => lang.code === selectedLanguage);
      
      if (selectedLang) {
        utterance.lang = selectedLang.voice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 rounded-2xl overflow-hidden h-48 relative flex-shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/background.jpg)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-primary)/30, var(--accent-secondary)/30)' }} />
        <div className="relative z-10 p-8 h-full flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Health Companion</h1>
            <p className="text-white/90">Your personal health assistant with multi-language support</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-4 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--text-primary)' }}>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 rounded border"
              style={{ 
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} style={{ background: 'var(--bg-tertiary)' }}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'text-white' 
                    : ''
                }`}
                style={{
                  background: message.type === 'user' 
                    ? 'var(--accent-gradient)' 
                    : 'var(--bg-tertiary)',
                  color: message.type === 'user' ? 'white' : 'var(--text-primary)'
                }}>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type === 'assistant' && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                        className="ml-2 p-1 rounded hover:bg-black/10 transition-colors"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div style={{ background: 'var(--bg-tertiary)' }} className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center space-x-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'hover:bg-gray-700'
                }`}
                style={{ 
                  background: isListening ? '#ef4444' : 'var(--bg-tertiary)',
                  color: isListening ? 'white' : 'var(--text-primary)'
                }}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Type your message in ${languages.find(l => l.code === selectedLanguage)?.name}...`}
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{ 
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  focusRingColor: 'var(--accent-primary)'
                }}
              />
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 rounded-full transition-colors disabled:opacity-50"
                style={{ 
                  background: 'var(--accent-gradient)',
                  color: 'white'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {isListening && (
              <div className="mt-2 text-center">
                <span className="text-sm px-3 py-1 rounded-full"
                      style={{ 
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)'
                      }}>
                  🎤 Listening... Speak now
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;