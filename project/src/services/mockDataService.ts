import { DiseaseData, MapData } from '../types';
import { DISEASES } from '../utils/constants';

// Mock disease data service
export const getDiseaseData = async (diseaseName: string): Promise<DiseaseData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockData: DiseaseData = {
    name: diseaseName,
    type: DISEASES.communicable.includes(diseaseName) ? 'communicable' : 'non-communicable',
    globalCases: Math.floor(Math.random() * 10000000) + 1000000,
    globalDeaths: Math.floor(Math.random() * 100000) + 10000,
    globalCured: Math.floor(Math.random() * 5000000) + 500000,
    countryCases: Math.floor(Math.random() * 500000) + 10000,
    countryDeaths: Math.floor(Math.random() * 5000) + 100,
    countryCured: Math.floor(Math.random() * 250000) + 5000,
    cityCases: Math.floor(Math.random() * 10000) + 100,
    cityDeaths: Math.floor(Math.random() * 100) + 1,
    cityCured: Math.floor(Math.random() * 5000) + 50,
    description: `${diseaseName} is a significant health concern affecting millions worldwide.`,
    symptoms: ['Fever', 'Fatigue', 'Headache', 'Body aches'],
    prevention: ['Maintain good hygiene', 'Healthy diet', 'Regular exercise', 'Adequate sleep'],
    treatment: ['Consult healthcare provider', 'Follow prescribed medication', 'Rest and hydration']
  };
  
  return mockData;
};

export const getMapData = async (region: 'global' | 'country' | 'state'): Promise<MapData[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const locations = region === 'global' ? 
    ['New York', 'London', 'Mumbai', 'Tokyo', 'Sydney'] :
    region === 'country' ?
    ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'] :
    ['North District', 'South District', 'East District', 'West District', 'Central District'];
    
  return locations.map(location => ({
    location,
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
    aqi: Math.floor(Math.random() * 300) + 50,
    waterQuality: Math.floor(Math.random() * 100),
    diseaseCount: Math.floor(Math.random() * 1000) + 10,
    diseases: ['COVID-19', 'Dengue', 'Malaria'].slice(0, Math.floor(Math.random() * 3) + 1)
  }));
};

export const getLiveDiseaseOutbreaks = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      country: 'India',
      disease: 'COVID-19',
      cases: 45000000,
      severity: 'high',
      coordinates: [20.5937, 78.9629]
    },
    {
      country: 'Brazil',
      disease: 'Dengue',
      cases: 2500000,
      severity: 'medium',
      coordinates: [-14.2350, -51.9253]
    },
    {
      country: 'Nigeria',
      disease: 'Malaria',
      cases: 15000000,
      severity: 'high',
      coordinates: [9.0820, 8.6753]
    }
  ];
};