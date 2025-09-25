import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Globe, MapPin, TrendingUp, TrendingDown, 
  Activity, AlertTriangle, RefreshCw, Info, Shield, Zap
} from 'lucide-react';
import { UserProfile } from '../types';

interface DiseaseTrackerProps {
  userProfile: UserProfile;
}

interface DiseaseStats {
  global: {
    cases: number;
    deaths: number;
    recovered: number;
    active: number;
  };
  country: {
    cases: number;
    deaths: number;
    recovered: number;
    active: number;
  };
  city: {
    cases: number;
    deaths: number;
    recovered: number;
    active: number;
  };
  highestCountry: {
    name: string;
    cases: number;
  };
  lowestCountry: {
    name: string;
    cases: number;
  };
}

interface OutbreakData {
  country: string;
  disease: string;
  cases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number];
  trend: 'up' | 'down' | 'stable';
}

const DiseaseTracker: React.FC<DiseaseTrackerProps> = ({ userProfile }) => {
  const [selectedCategory, setSelectedCategory] = useState<'communicable' | 'non-communicable'>('communicable');
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diseaseStats, setDiseaseStats] = useState<DiseaseStats | null>(null);
  const [outbreakData, setOutbreakData] = useState<OutbreakData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const communicableDiseases = [
    'COVID-19', 'Influenza', 'Tuberculosis', 'Malaria', 'Dengue Fever',
    'Chikungunya', 'Zika Virus', 'Hepatitis B', 'HIV/AIDS', 'Cholera',
    'Typhoid', 'Measles', 'Mumps', 'Rubella', 'Whooping Cough',
    'Pneumonia', 'Meningitis', 'Ebola', 'MERS', 'SARS'
  ];

  const nonCommunicableDiseases = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Stroke', 'Cancer',
    'COPD', 'Asthma', 'Kidney Disease', 'Liver Disease', 'Obesity',
    'Osteoporosis', 'Arthritis', 'Alzheimer\'s', 'Parkinson\'s', 'Depression',
    'Anxiety Disorders', 'Bipolar Disorder', 'Schizophrenia', 'Epilepsy', 'Migraine'
  ];

  const getCurrentDiseases = () => {
    const diseases = selectedCategory === 'communicable' ? communicableDiseases : nonCommunicableDiseases;
    return diseases.filter(disease => 
      disease.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const loadDiseaseData = async (disease: string) => {
    setLoading(true);
    try {
      // Simulate API call for disease statistics
      const mockStats: DiseaseStats = {
        global: {
          cases: Math.floor(Math.random() * 100000000) + 10000000,
          deaths: Math.floor(Math.random() * 5000000) + 500000,
          recovered: Math.floor(Math.random() * 80000000) + 20000000,
          active: Math.floor(Math.random() * 20000000) + 5000000
        },
        country: {
          cases: Math.floor(Math.random() * 10000000) + 1000000,
          deaths: Math.floor(Math.random() * 500000) + 50000,
          recovered: Math.floor(Math.random() * 8000000) + 2000000,
          active: Math.floor(Math.random() * 2000000) + 500000
        },
        city: {
          cases: Math.floor(Math.random() * 100000) + 10000,
          deaths: Math.floor(Math.random() * 5000) + 500,
          recovered: Math.floor(Math.random() * 80000) + 20000,
          active: Math.floor(Math.random() * 20000) + 5000
        },
        highestCountry: {
          name: 'United States',
          cases: Math.floor(Math.random() * 50000000) + 30000000
        },
        lowestCountry: {
          name: 'New Zealand',
          cases: Math.floor(Math.random() * 10000) + 1000
        }
      };

      setDiseaseStats(mockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading disease data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOutbreakData = async () => {
    try {
      // Simulate live outbreak data
      const mockOutbreaks: OutbreakData[] = [
        {
          country: 'India',
          disease: 'Dengue Fever',
          cases: 45000,
          severity: 'high',
          coordinates: [20.5937, 78.9629],
          trend: 'up'
        },
        {
          country: 'Brazil',
          disease: 'Zika Virus',
          cases: 12000,
          severity: 'medium',
          coordinates: [-14.2350, -51.9253],
          trend: 'stable'
        },
        {
          country: 'Nigeria',
          disease: 'Malaria',
          cases: 89000,
          severity: 'critical',
          coordinates: [9.0820, 8.6753],
          trend: 'up'
        },
        {
          country: 'China',
          disease: 'COVID-19',
          cases: 156000,
          severity: 'high',
          coordinates: [35.8617, 104.1954],
          trend: 'down'
        },
        {
          country: 'United States',
          disease: 'Influenza',
          cases: 234000,
          severity: 'medium',
          coordinates: [37.0902, -95.7129],
          trend: 'stable'
        }
      ];

      setOutbreakData(mockOutbreaks);
    } catch (error) {
      console.error('Error loading outbreak data:', error);
    }
  };

  useEffect(() => {
    loadOutbreakData();
    const interval = setInterval(loadOutbreakData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      loadDiseaseData(selectedDisease);
    }
  }, [selectedDisease]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDotSize = (cases: number) => {
    if (cases > 100000) return 'w-6 h-6';
    if (cases > 50000) return 'w-5 h-5';
    if (cases > 10000) return 'w-4 h-4';
    return 'w-3 h-3';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 rounded-2xl overflow-hidden h-48 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/background.png)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-primary)/30, var(--accent-secondary)/30)' }} />
        <div className="relative z-10 p-8 h-full flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Global Disease Tracker</h1>
            <p className="text-white/90">Live disease statistics and outbreak monitoring</p>
            <p className="text-white/70 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={loadOutbreakData}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Live Dashboard */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Live Disease Dashboard
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Highest Cases */}
          <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Highest Cases Today</h4>
            </div>
            {outbreakData.slice(0, 3).map((outbreak, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{outbreak.country}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{outbreak.disease}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-400">{formatNumber(outbreak.cases)}</p>
                  <div className="flex items-center">
                    {getTrendIcon(outbreak.trend)}
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${getSeverityColor(outbreak.severity)} text-white`}>
                      {outbreak.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lowest Cases */}
          <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 mr-2 text-green-500" />
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Controlled Regions</h4>
            </div>
            {outbreakData.slice().reverse().slice(0, 3).map((outbreak, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{outbreak.country}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{outbreak.disease}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{formatNumber(Math.floor(outbreak.cases * 0.1))}</p>
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="ml-1 px-2 py-1 rounded text-xs bg-green-500 text-white">
                      CONTROLLED
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disease Selection */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Disease Statistics
        </h3>
        
        {/* Category Selection */}
        <div className="flex space-x-4 mb-6">
          {(['communicable', 'non-communicable'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg transition-colors ${
                selectedCategory === category ? 'text-white' : 'hover:bg-gray-700'
              }`}
              style={{
                background: selectedCategory === category ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                color: selectedCategory === category ? 'white' : 'var(--text-primary)'
              }}
            >
              {category === 'communicable' ? 'Communicable Diseases' : 'Non-Communicable Diseases'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search diseases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{ 
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Disease List */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {getCurrentDiseases().slice(0, 12).map((disease) => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedDisease === disease ? 'text-white' : 'hover:bg-gray-700'
              }`}
              style={{
                background: selectedDisease === disease ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                color: selectedDisease === disease ? 'white' : 'var(--text-primary)'
              }}
            >
              {disease}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Statistics */}
      {selectedDisease && diseaseStats && (
        <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {selectedDisease} Statistics
            </h3>
            {loading && <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--accent-primary)' }} />}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Global Stats */}
            <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Globe className="w-5 h-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Global</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Cases:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatNumber(diseaseStats.global.cases)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                  <span className="text-red-400">{formatNumber(diseaseStats.global.deaths)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                  <span className="text-green-400">{formatNumber(diseaseStats.global.recovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Active:</span>
                  <span className="text-orange-400">{formatNumber(diseaseStats.global.active)}</span>
                </div>
              </div>
            </div>

            {/* Country Stats */}
            <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 mr-2" style={{ color: 'var(--accent-secondary)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{userProfile.country}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Cases:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatNumber(diseaseStats.country.cases)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                  <span className="text-red-400">{formatNumber(diseaseStats.country.deaths)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                  <span className="text-green-400">{formatNumber(diseaseStats.country.recovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Active:</span>
                  <span className="text-orange-400">{formatNumber(diseaseStats.country.active)}</span>
                </div>
              </div>
            </div>

            {/* City Stats */}
            <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{userProfile.city}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Cases:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatNumber(diseaseStats.city.cases)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                  <span className="text-red-400">{formatNumber(diseaseStats.city.deaths)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                  <span className="text-green-400">{formatNumber(diseaseStats.city.recovered)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Active:</span>
                  <span className="text-orange-400">{formatNumber(diseaseStats.city.active)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Outbreak Map */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Live Disease Outbreak Map
        </h3>
        
        {/* Map Visualization */}
        <div className="relative h-96 rounded-lg overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <p style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-2">
                Global Disease Outbreak Visualization
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Interactive map showing live disease outbreaks worldwide
              </p>
            </div>
          </div>
          
          {/* Outbreak Dots Overlay */}
          <div className="absolute inset-0">
            {outbreakData.map((outbreak, index) => (
              <div
                key={index}
                className={`absolute ${getDotSize(outbreak.cases)} ${getSeverityColor(outbreak.severity)} rounded-full animate-pulse cursor-pointer`}
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 10)}%`,
                }}
                title={`${outbreak.country}: ${outbreak.disease} - ${formatNumber(outbreak.cases)} cases`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-red-500 rounded-full mr-2" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">High Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-600 rounded-full mr-2" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseTracker;