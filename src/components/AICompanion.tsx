import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Globe, Settings } from 'lucide-react';
import { getChatCompletion } from '../services/apiService';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/storageService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

const AICompanion: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [speechLanguage, setSpeechLanguage] = useState('en-US');

  // Language options based on user's region
  const languageOptions = [
    { code: 'en-US', name: 'English', voice: 'en-US' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', voice: 'hi-IN' },
    { code: 'es-ES', name: 'Español', voice: 'es-ES' },
    { code: 'fr-FR', name: 'Français', voice: 'fr-FR' },
    { code: 'de-DE', name: 'Deutsch', voice: 'de-DE' },
    { code: 'zh-CN', name: '中文', voice: 'zh-CN' },
    { code: 'ja-JP', name: '日本語', voice: 'ja-JP' },
    { code: 'ko-KR', name: '한국어', voice: 'ko-KR' },
    { code: 'pt-BR', name: 'Português', voice: 'pt-BR' },
    { code: 'ru-RU', name: 'Русский', voice: 'ru-RU' }
  ];

  // Set default language based on user's country
  useEffect(() => {
    const countryLanguageMap: Record<string, string> = {
      'India': 'hi-IN',
      'Spain': 'es-ES',
      'France': 'fr-FR',
      'Germany': 'de-DE',
      'China': 'zh-CN',
      'Japan': 'ja-JP',
      'Brazil': 'pt-BR',
      'Russia': 'ru-RU'
    };

    const defaultLang = countryLanguageMap[profile?.country || ''] || 'en-US';
    setSelectedLanguage(defaultLang);
    setSpeechLanguage(defaultLang);
  }, [profile]);

  useEffect(() => {
    // Load chat history
    const history = getChatHistory();
    setMessages(history);

    // Initialize speech recognition with language support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = selectedLanguage;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Add welcome message if no history
    if (history.length === 0) {
      const welcomeMessages: Record<string, string> = {
        'en-US': `Hello! I'm your AI Health Companion. I can communicate in multiple languages and help answer your health questions. Please remember that I'm not a substitute for professional medical advice.`,
        'hi-IN': `नमस्ते! मैं आपका AI स्वास्थ्य साथी हूं। मैं कई भाषाओं में बात कर सकता हूं और आपके स्वास्थ्य प्रश्नों का उत्तर दे सकता हूं। कृपया याद रखें कि मैं पेशेवर चिकित्सा सलाह का विकल्प नहीं हूं।`,
        'es-ES': `¡Hola! Soy tu Compañero de Salud AI. Puedo comunicarme en múltiples idiomas y ayudar a responder tus preguntas de salud.`,
        'fr-FR': `Bonjour! Je suis votre Compagnon de Santé IA. Je peux communiquer dans plusieurs langues et aider à répondre à vos questions de santé.`
      };

      const welcomeMessage: Message = {
        role: 'assistant',
        content: welcomeMessages[selectedLanguage] || welcomeMessages['en-US'],
        timestamp: new Date().toISOString(),
        language: selectedLanguage
      };
      setMessages([welcomeMessage]);
      saveChatMessage(welcomeMessage);
    }
  }, [selectedLanguage]);

  // Update speech recognition language when changed
  useEffect(() => {
    if (recognition) {
      recognition.lang = selectedLanguage;
    }
  }, [selectedLanguage, recognition]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      language: selectedLanguage
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Include language preference in the prompt
      const languagePrompt = selectedLanguage !== 'en-US' 
        ? `Please respond in ${languageOptions.find(l => l.code === selectedLanguage)?.name || 'English'}. `
        : '';
      
      const response = await getChatCompletion([
        ...updatedMessages.slice(-5), // Last 5 messages for context
        {
          role: 'user',
          content: languagePrompt + userMessage.content
        }
      ], profile!);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        language: selectedLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
      saveChatMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessages: Record<string, string> = {
        'en-US': 'I apologize, but I encountered an error. Please try again or consult with a healthcare professional.',
        'hi-IN': 'मुझे खेद है, लेकिन मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें या किसी स्वास्थ्य पेशेवर से सलाह लें।',
        'es-ES': 'Me disculpo, pero encontré un error. Por favor intenta de nuevo o consulta con un profesional de la salud.',
        'fr-FR': 'Je m\'excuse, mais j\'ai rencontré une erreur. Veuillez réessayer ou consulter un professionnel de la santé.'
      };

      const errorMessage: Message = {
        role: 'assistant',
        content: errorMessages[selectedLanguage] || errorMessages['en-US'],
        timestamp: new Date().toISOString(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
      saveChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = selectedLanguage;
      recognition.start();
      setIsListening(true);
    }
  };

  const handleTextToSpeech = (text: string, messageLanguage?: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Set language for speech
      const langCode = messageLanguage || speechLanguage;
      utterance.lang = langCode;

      // Try to find a voice for the selected language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearChatHistory();
      setMessages([]);
    }
  };

  const getLanguageName = (code: string) => {
    return languageOptions.find(l => l.code === code)?.name || 'English';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageCircle className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              AI Health Companion
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Multilingual health assistant with voice support
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border text-sm`}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearChat}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg flex flex-col h-96`}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? theme === 'dark' ? 'bg-red-600' : 'bg-blue-600'
                    : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  )}
                </div>
                
                <div className={`rounded-lg p-4 ${
                  message.role === 'user'
                    ? theme === 'dark' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleTextToSpeech(message.content, message.language)}
                        className={`p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors`}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      {message.language && message.language !== 'en-US' && (
                        <span className="text-xs opacity-70">
                          {getLanguageName(message.language)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`flex items-center space-x-3 max-w-3xl`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <Bot className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                
                <div className={`rounded-lg p-4 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${theme === 'dark' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
              title={`Voice input in ${getLanguageName(selectedLanguage)}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about your health in ${getLanguageName(selectedLanguage)}...`}
              disabled={isLoading}
              className={`flex-1 p-3 rounded-lg resize-none ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-gray-50 text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
              rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Language indicator */}
          <div className="mt-2 text-center">
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Speaking in {getLanguageName(selectedLanguage)} • Voice input: {isListening ? 'Listening...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Language Features Info */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
          Multilingual Health Assistant Features
        </h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <div>
            <p>• <strong>Voice Input:</strong> Speak in your preferred language</p>
            <p>• <strong>Text-to-Speech:</strong> Hear responses in your language</p>
          </div>
          <div>
            <p>• <strong>10+ Languages:</strong> Including Hindi, Spanish, French, Chinese</p>
            <p>• <strong>Regional Health:</strong> Location-specific health advice</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>
          <strong>Important:</strong> This AI companion provides general health information only and is not a substitute 
          for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals 
          for medical decisions.
        </p>
      </div>
    </div>
  );
};

export default AICompanion;