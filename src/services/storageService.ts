import { UserProfile } from '../contexts/ProfileContext';

export interface VitalRecord {
  systolicBP: number;
  diastolicBP: number;
  bloodGlucose: number;
  cholesterol: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  timestamp: string;
  bmi: number;
}

export interface ImageAnalysisRecord {
  id: string;
  type: 'chest-xray' | 'skin-lesion' | 'mri' | 'ct-scan';
  filename: string;
  analysis: any;
  timestamp: string;
  addToReport: boolean;
}

// Profile Storage
export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem('oracle-profile', JSON.stringify(profile));
};

export const getStoredProfile = (): UserProfile | null => {
  const stored = localStorage.getItem('oracle-profile');
  return stored ? JSON.parse(stored) : null;
};

// Vitals Storage
export const saveVitals = (vitals: VitalRecord): void => {
  const history = getVitalsHistory();
  history.push(vitals);
  localStorage.setItem('oracle-vitals-history', JSON.stringify(history));
};

export const getVitalsHistory = (): VitalRecord[] => {
  const stored = localStorage.getItem('oracle-vitals-history');
  return stored ? JSON.parse(stored) : [];
};

export const getLatestVitals = (): VitalRecord | null => {
  const history = getVitalsHistory();
  return history.length > 0 ? history[history.length - 1] : null;
};

// Image Analysis Storage
export const saveImageAnalysis = (analysis: ImageAnalysisRecord): void => {
  const history = getImageAnalysisHistory();
  history.push(analysis);
  localStorage.setItem('oracle-image-analysis', JSON.stringify(history));
};

export const getImageAnalysisHistory = (): ImageAnalysisRecord[] => {
  const stored = localStorage.getItem('oracle-image-analysis');
  return stored ? JSON.parse(stored) : [];
};

export const updateImageAnalysisReportStatus = (id: string, addToReport: boolean): void => {
  const history = getImageAnalysisHistory();
  const updated = history.map(item => 
    item.id === id ? { ...item, addToReport } : item
  );
  localStorage.setItem('oracle-image-analysis', JSON.stringify(updated));
};

// Chat History Storage
export const saveChatMessage = (message: { role: 'user' | 'assistant'; content: string; timestamp: string }): void => {
  const history = getChatHistory();
  history.push(message);
  localStorage.setItem('oracle-chat-history', JSON.stringify(history));
};

export const getChatHistory = (): Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> => {
  const stored = localStorage.getItem('oracle-chat-history');
  return stored ? JSON.parse(stored) : [];
};

export const clearChatHistory = (): void => {
  localStorage.removeItem('oracle-chat-history');
};