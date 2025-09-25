export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  country: string;
  city: string;
  state: string;
  height: number;
  weight: number;
  waist: number;
  hip: number;
  allergies: string[];
  geneticMarkers: string[];
  apiKey?: string;
  apiProvider: 'openai' | 'huggingface' | 'custom';
}

export interface Vitals {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodGlucose: number;
  cholesterol: number;
  bodyTemp: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  date: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  vitals: Vitals;
  notes?: string;
  imageAnalysis?: ImageAnalysisResult[];
}

export interface ImageAnalysisResult {
  id: string;
  type: 'xray' | 'mri' | 'skin' | 'other';
  findings: string;
  confidence: number;
  recommendations: string[];
  addToRecord: boolean;
}

export interface DiseaseData {
  name: string;
  type: 'communicable' | 'non-communicable';
  globalCases: number;
  globalDeaths: number;
  globalCured: number;
  countryCases: number;
  countryDeaths: number;
  countryCured: number;
  cityCases: number;
  cityDeaths: number;
  cityCured: number;
  description: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
}

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  batteryLevel: number;
  vitals?: Partial<Vitals>;
}

export interface MapData {
  location: string;
  latitude: number;
  longitude: number;
  aqi: number;
  waterQuality: number;
  diseaseCount: number;
  diseases: string[];
}