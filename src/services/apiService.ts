import { RiskPrediction } from './mlService';

// Get AI settings from localStorage
const getAISettings = () => {
  const saved = localStorage.getItem('oracle-ai-settings');
  if (saved) {
    return JSON.parse(saved);
  }
  return { apiKey: '', apiProvider: 'openai' };
};

// Free API alternatives configuration
const API_ENDPOINTS = {
  huggingface: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  openai: 'https://api.openai.com/v1/chat/completions',
  ollama: 'http://localhost:11434/api/generate'
};

// Simulated AI responses for demo purposes
const SIMULATED_RESPONSES = {
  healthAnalysis: `**Health Risk Analysis:**

Based on your vitals and profile, I've identified several key areas for attention. Your blood pressure readings suggest you're in the prehypertensive range, which is common for your age group but requires monitoring. The combination of your BMI and glucose levels indicates a moderate risk for metabolic syndrome.

**Personalized Dietary Plan:**

*Day 1:*
- Breakfast: [DO] Start with oats porridge with almonds and seasonal fruits [/DO]
- Lunch: [DO] Include brown rice with dal and mixed vegetables [/DO] 
- Dinner: [AVOID] Heavy meals after 8 PM [/AVOID] [DO] Light soup with whole grain bread [/DO]

*Day 2:*
- Breakfast: [DO] Vegetable upma with coconut chutney [/DO]
- Lunch: [DO] Quinoa salad with local seasonal vegetables [/DO]
- Dinner: [DO] Grilled fish with steamed vegetables [/DO]

*Day 3:*
- Breakfast: [DO] Smoothie with spinach, banana, and yogurt [/DO]
- Lunch: [AVOID] Processed foods and excess salt [/AVOID] [DO] Home-cooked curry with roti [/DO]
- Dinner: [DO] Lentil soup with mixed grain bread [/DO]

**Recommended Exercise Regimen:**

[DO] Start with 30 minutes of brisk walking daily [/DO]
[DO] Include 2 days of strength training per week [/DO]
[DO] Practice yoga or stretching for 15 minutes daily [/DO]
[AVOID] High-intensity workouts without proper warm-up [/AVOID]`,

  trendAnalysis: {
    overallAssessment: "Your health metrics show steady improvement over the past month with consistent blood pressure management.",
    positiveTrends: [
      "Blood pressure has decreased by 8% over the last 30 days",
      "BMI has stabilized within the healthy range",
      "Cholesterol levels show gradual improvement"
    ],
    areasForImprovement: [
      "Blood glucose shows slight upward trend in evening readings",
      "Weight fluctuations suggest need for consistent meal timing"
    ],
    dynamicRecommendations: [
      "Consider monitoring blood glucose specifically after dinner",
      "Implement a consistent meal schedule to stabilize weight",
      "Continue current exercise routine as it's showing positive results"
    ]
  },

  imageAnalysis: `**Disclaimer: This is an AI-powered analysis and not a medical diagnosis. Please consult a qualified healthcare professional.**

**Visual Indicator Analysis:**
Based on the preliminary finding of "Normal chest X-ray with 65% confidence," the image shows clear lung fields with no obvious signs of consolidation, masses, or abnormal shadows. The heart appears to be of normal size and position, and the diaphragm is clearly visible with normal curvature.

**Cause & Prevention:**
To maintain healthy lungs:
1. Avoid smoking and secondhand smoke exposure
2. Regular exercise to improve lung capacity
3. Maintain good air quality in living spaces

**Next Steps:**
While this preliminary analysis suggests normal findings, it's essential to have this reviewed by a qualified radiologist or physician who can provide a definitive medical interpretation and correlate findings with your clinical symptoms.`,

  diseaseInfo: `**COVID-19 Global Update**

**Current Statistics:**
- Global Cases: 700M+ (estimated)
- Recovery Rate: 98.2%
- Active Cases: Declining in most regions

**Recent Developments:**
Several countries have updated their vaccination strategies with new bivalent boosters. The WHO continues to monitor new variants, with current strains showing reduced severity but maintained transmissibility.

**Prevention Guidelines:**
- Maintain good hygiene practices
- Stay updated with local health authority recommendations
- Consider vaccination based on risk factors and local guidelines`
};

// Main API service functions
export const getAIHealthAnalysis = async (
  profile: any,
  vitals: any,
  predictions: RiskPrediction[]
): Promise<string> => {
  const aiSettings = getAISettings();
  
  // Return simulated response if no API key
  if (!aiSettings.apiKey || aiSettings.apiKey.trim() === '') {
    return SIMULATED_RESPONSES.healthAnalysis;
  }

  try {
    // Real API call
    const response = await callAIAPI(aiSettings, generateHealthAnalysisPrompt(profile, vitals, predictions));
    return response;
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback to simulated response on error
    return SIMULATED_RESPONSES.healthAnalysis;
  }
};

export const getAITrendAnalysis = async (
  healthHistory: any[]
): Promise<any> => {
  // For demo purposes, return simulated response
  return SIMULATED_RESPONSES.trendAnalysis;
};

export const getImageAnalysis = async (
  analysisResult: any,
  analysisType: string
): Promise<string> => {
  // For demo purposes, return simulated response
  return SIMULATED_RESPONSES.imageAnalysis;
};

export const getChatCompletion = async (
  messages: Array<{role: string, content: string}>,
  profile: any
): Promise<string> => {
  const aiSettings = getAISettings();
  
  // Use real API if available
  if (aiSettings.apiKey && aiSettings.apiKey.trim() !== '') {
    try {
      const lastMessage = messages[messages.length - 1]?.content || '';
      const prompt = `You are a helpful AI health assistant. The user asked: "${lastMessage}". Provide helpful, general health information but always remind them to consult healthcare professionals for medical advice.`;
      const response = await callAIAPI(aiSettings, prompt);
      return response;
    } catch (error) {
      console.error('Chat API Error:', error);
      // Fall through to simulated response
    }
  }

  // For demo purposes, return a helpful response
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  if (lastMessage.toLowerCase().includes('blood pressure')) {
    return "Blood pressure is an important vital sign. Normal blood pressure is typically around 120/80 mmHg. If you're concerned about your readings, I'd recommend discussing them with your healthcare provider. Regular monitoring, a healthy diet low in sodium, regular exercise, and stress management can all help maintain healthy blood pressure levels.";
  }
  
  if (lastMessage.toLowerCase().includes('diet') || lastMessage.toLowerCase().includes('food')) {
    return "A balanced diet is crucial for good health. Based on your profile, I'd recommend focusing on whole grains, lean proteins, plenty of vegetables, and fruits. Try to limit processed foods, excess sugar, and sodium. Would you like specific meal suggestions based on your location and any dietary restrictions?";
  }
  
  return "I'm here to help with your health questions! I can provide general health information, but remember that I'm not a substitute for professional medical advice. For specific medical concerns, please consult with a healthcare provider.";
};

export const getDiseaseInfo = async (diseaseName: string): Promise<any> => {
  // Simulate disease information retrieval
  return {
    name: diseaseName,
    description: `${diseaseName} is a health condition that affects millions worldwide.`,
    symptoms: ['Symptom 1', 'Symptom 2', 'Symptom 3'],
    prevention: ['Prevention tip 1', 'Prevention tip 2', 'Prevention tip 3'],
    treatment: 'Treatment varies based on severity and individual factors.',
    statistics: {
      globalCases: Math.floor(Math.random() * 1000000),
      mortality: Math.floor(Math.random() * 10),
      recovery: 85 + Math.floor(Math.random() * 10)
    }
  };
};

// Helper functions
const generateHealthAnalysisPrompt = (
  profile: UserProfile,
  vitals: any,
  predictions: RiskPrediction[]
): string => {
  return `As an expert AI health analyst, provide a detailed health assessment for:
  
  User Profile:
  - Age: ${profile.age}
  - Gender: ${profile.gender}
  - Location: ${profile.city}, ${profile.country}
  - BMI: ${((profile.weight / ((profile.height/100) ** 2))).toFixed(1)}
  - Allergies: ${profile.allergies.join(', ') || 'None'}
  - Family History: ${profile.geneticMarkers.join(', ') || 'None'}
  
  Current Vitals:
  - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
  - Blood Glucose: ${vitals.bloodGlucose} mg/dL
  - Cholesterol: ${vitals.cholesterol} mg/dL
  
  Risk Predictions:
  ${predictions.map(p => `- ${p.disease}: ${p.riskLevel} risk (${p.score}%)`).join('\n')}
  
  Provide a comprehensive analysis with personalized recommendations.`;
};

const callAIAPI = async (aiSettings: any, prompt: string): Promise<string> => {
  const provider = aiSettings.apiProvider || 'openai';
  const apiKey = aiSettings.apiKey;
  
  if (!apiKey) {
    throw new Error('API key required');
  }

  switch (provider) {
    case 'openai':
      return await callOpenAI(apiKey, prompt);
    case 'huggingface':
      return await callHuggingFace(apiKey, prompt);
    case 'ollama':
      return await callOllama(prompt);
    default:
      throw new Error('Unsupported API provider');
  }
};

const callOpenAI = async (apiKey: string, prompt: string): Promise<string> => {
  const response = await fetch(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const callHuggingFace = async (apiKey: string, prompt: string): Promise<string> => {
  const response = await fetch(API_ENDPOINTS.huggingface, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_length: 1000 }
    })
  });

  const data = await response.json();
  return data.generated_text || data[0]?.generated_text || 'Unable to generate response';
};

const callOllama = async (prompt: string): Promise<string> => {
  const response = await fetch(API_ENDPOINTS.ollama, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama2',
      prompt: prompt,
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
};