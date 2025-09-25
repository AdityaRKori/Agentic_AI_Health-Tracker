import React, { useState, useEffect } from 'react';
import { 
  Users, Globe, MapPin, TrendingUp, AlertTriangle, 
  Droplets, Wind, Activity, Search, Filter, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { getDiseaseData, getMapData } from '../services/mockDataService';

interface CommunityHealthProps {
  userProfile: UserProfile;
}

interface LiveStats {
  global: {
    population: number;
    activeCases: number;
    deaths: number;
    recovered: number;
  };
  country: {
    population: number;
    activeCases: number;
    deaths: number;
    recovered: number;
  };
  city: {
    population: number;
    activeCases: number;
    deaths: number;
    recovered: number;
  };
}

interface SeasonalDisease {
  name: string;
  cases: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high';
  description: string;
  organism?: string;
  transmission: string[];
  prevention: string[];
}

const CommunityHealth: React.FC<CommunityHealthProps> = ({ userProfile }) => {
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [seasonalDiseases, setSeasonalDiseases] = useState<SeasonalDisease[]>([]);
  const [mapView, setMapView] = useState<'global' | 'country' | 'state'>('global');
  const [mapData, setMapData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'aqi' | 'water' | 'disease'>('aqi');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadCommunityData();
    const interval = setInterval(loadCommunityData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [userProfile.country, userProfile.city]);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      // Simulate live statistics
      const mockStats: LiveStats = {
        global: {
          population: 8100000000,
          activeCases: Math.floor(Math.random() * 50000000) + 10000000,
          deaths: Math.floor(Math.random() * 2000000) + 500000,
          recovered: Math.floor(Math.random() * 100000000) + 50000000
        },
        country: {
          population: userProfile.country === 'India' ? 1400000000 : 330000000,
          activeCases: Math.floor(Math.random() * 5000000) + 1000000,
          deaths: Math.floor(Math.random() * 200000) + 50000,
          recovered: Math.floor(Math.random() * 10000000) + 5000000
        },
        city: {
          population: Math.floor(Math.random() * 10000000) + 1000000,
          activeCases: Math.floor(Math.random() * 100000) + 10000,
          deaths: Math.floor(Math.random() * 5000) + 500,
          recovered: Math.floor(Math.random() * 500000) + 50000
        }
      };

      // Simulate seasonal diseases for user's region
      const mockSeasonalDiseases: SeasonalDisease[] = [
        {
          name: 'Dengue Fever',
          cases: Math.floor(Math.random() * 50000) + 10000,
          trend: 'up',
          severity: 'high',
          description: 'Mosquito-borne viral infection common in tropical regions',
          organism: 'Aedes aegypti mosquito',
          transmission: ['Mosquito bites', 'Stagnant water breeding'],
          prevention: ['Remove stagnant water', 'Use mosquito nets', 'Wear protective clothing']
        },
        {
          name: 'Malaria',
          cases: Math.floor(Math.random() * 30000) + 5000,
          trend: 'stable',
          severity: 'medium',
          description: 'Parasitic infection transmitted by mosquitoes',
          organism: 'Anopheles mosquito',
          transmission: ['Infected mosquito bites'],
          prevention: ['Use bed nets', 'Take antimalarial medication', 'Eliminate breeding sites']
        },
        {
          name: 'Chikungunya',
          cases: Math.floor(Math.random() * 20000) + 3000,
          trend: 'down',
          severity: 'medium',
          description: 'Viral disease transmitted by mosquitoes',
          organism: 'Aedes mosquito',
          transmission: ['Mosquito bites'],
          prevention: ['Vector control', 'Personal protection', 'Community awareness']
        }
      ];

      setLiveStats(mockStats);
      setSeasonalDiseases(mockSeasonalDiseases);
      setLastUpdated(new Date());
      
      // Load map data
      const mapInfo = await getMapData(mapView);
      setMapData(mapInfo);
      
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getMetricColor = (value: number, type: string) => {
    switch (type) {
      case 'aqi':
        if (value <= 50) return 'bg-green-500';
        if (value <= 100) return 'bg-yellow-500';
        if (value <= 150) return 'bg-orange-500';
        return 'bg-red-500';
      case 'water':
        if (value >= 80) return 'bg-green-500';
        if (value >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
      case 'disease':
        if (value <= 100) return 'bg-green-500';
        if (value <= 500) return 'bg-yellow-500';
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
            <p style={{ color: 'var(--text-primary)' }}>Loading community health data...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-white mb-2">Community Health Dashboard</h1>
            <p className="text-white/90">Live health statistics and regional disease tracking</p>
            <p className="text-white/70 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={loadCommunityData}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Live Statistics Cards */}
      {liveStats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Global Stats */}
          <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 mr-3" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Global</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Population:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatNumber(liveStats.global.population)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Active Cases:</span>
                <span className="text-orange-400">{formatNumber(liveStats.global.activeCases)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                <span className="text-red-400">{formatNumber(liveStats.global.deaths)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                <span className="text-green-400">{formatNumber(liveStats.global.recovered)}</span>
              </div>
            </div>
          </div>

          {/* Country Stats */}
          <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 mr-3" style={{ color: 'var(--accent-secondary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{userProfile.country}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Population:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatNumber(liveStats.country.population)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Active Cases:</span>
                <span className="text-orange-400">{formatNumber(liveStats.country.activeCases)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                <span className="text-red-400">{formatNumber(liveStats.country.deaths)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                <span className="text-green-400">{formatNumber(liveStats.country.recovered)}</span>
              </div>
            </div>
          </div>

          {/* City Stats */}
          <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 mr-3 text-blue-500" />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{userProfile.city}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Population:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatNumber(liveStats.city.population)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Active Cases:</span>
                <span className="text-orange-400">{formatNumber(liveStats.city.activeCases)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Deaths:</span>
                <span className="text-red-400">{formatNumber(liveStats.city.deaths)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Recovered:</span>
                <span className="text-green-400">{formatNumber(liveStats.city.recovered)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Diseases */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Seasonal Diseases in {userProfile.city}, {userProfile.state}
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {seasonalDiseases.map((disease, index) => (
            <div key={index} style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{disease.name}</h4>
                {getTrendIcon(disease.trend)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Cases:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatNumber(disease.cases)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Severity:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    disease.severity === 'high' ? 'bg-red-500 text-white' :
                    disease.severity === 'medium' ? 'bg-yellow-500 text-black' :
                    'bg-green-500 text-white'
                  }`}>
                    {disease.severity.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-2">
                  {disease.description}
                </p>
                {disease.organism && (
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                    <strong>Vector:</strong> {disease.organism}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map Section */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Environmental Health Map
          </h3>
          <div className="flex space-x-2">
            {(['global', 'country', 'state'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setMapView(view)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mapView === view 
                    ? 'text-white' 
                    : 'hover:bg-gray-700'
                }`}
                style={{
                  background: mapView === view ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: mapView === view ? 'white' : 'var(--text-primary)'
                }}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selection */}
        <div className="flex space-x-4 mb-6">
          {([
            { key: 'aqi', label: 'Air Quality', icon: Wind },
            { key: 'water', label: 'Water Quality', icon: Droplets },
            { key: 'disease', label: 'Disease Count', icon: Activity }
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedMetric === key ? 'text-white' : 'hover:bg-gray-700'
              }`}
              style={{
                background: selectedMetric === key ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                color: selectedMetric === key ? 'white' : 'var(--text-primary)'
              }}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Map Data Display */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mapData.map((location, index) => (
            <div key={index} style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{location.location}</h4>
                <div 
                  className={`w-4 h-4 rounded-full ${getMetricColor(
                    selectedMetric === 'aqi' ? location.aqi :
                    selectedMetric === 'water' ? location.waterQuality :
                    location.diseaseCount, selectedMetric
                  )}`}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>AQI:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{location.aqi}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Water Quality:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{location.waterQuality}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Disease Cases:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{location.diseaseCount}</span>
                </div>
                {location.diseases.length > 0 && (
                  <div className="mt-2">
                    <span style={{ color: 'var(--text-secondary)' }} className="text-xs">Top Diseases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {location.diseases.slice(0, 2).map((disease, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityHealth;