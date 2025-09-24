import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Users, Globe, MapPin, TrendingUp, Search, AlertTriangle, Activity, Skull, Heart, Info, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GlobalStats {
  totalPopulation: number;
  totalCases: number;
  totalDeaths: number;
  totalRecovered: number;
  activeCases: number;
}

interface DiseaseInfo {
  name: string;
  cases: number;
  deaths: number;
  recovered: number;
  organism: string;
  vector: string;
  image: string;
  history: string;
  prevention: string[];
  vaccine: string;
}

interface SeasonalDisease {
  name: string;
  cases: number;
  season: string;
  organism: string;
  vector: string;
  prevention: string[];
  moreInfo: DiseaseInfo;
}

const CommunityView: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalPopulation: 8100000000,
    totalCases: 750000000,
    totalDeaths: 15000000,
    totalRecovered: 700000000,
    activeCases: 35000000
  });
  
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [mapView, setMapView] = useState<'global' | 'country' | 'state'>('global');
  const [selectedMetric, setSelectedMetric] = useState<'disease' | 'aqi' | 'water'>('disease');

  // Seasonal diseases for user's location
  const seasonalDiseases: SeasonalDisease[] = [
    {
      name: 'Dengue Fever',
      cases: 45000,
      season: 'Monsoon',
      organism: 'Dengue Virus (DENV)',
      vector: 'Aedes aegypti mosquito',
      prevention: ['Remove stagnant water', 'Use mosquito nets', 'Wear long sleeves'],
      moreInfo: {
        name: 'Dengue Fever',
        cases: 390000000,
        deaths: 25000,
        recovered: 389000000,
        organism: 'Dengue Virus (DENV-1, DENV-2, DENV-3, DENV-4)',
        vector: 'Aedes aegypti and Aedes albopictus mosquitoes',
        image: 'https://images.pexels.com/photos/5340280/pexels-photo-5340280.jpeg',
        history: 'First described in 1779, dengue has become endemic in over 100 countries. Major outbreaks occurred in Southeast Asia in the 1950s.',
        prevention: ['Eliminate mosquito breeding sites', 'Use protective clothing', 'Apply mosquito repellent', 'Use bed nets'],
        vaccine: 'Dengvaxia (limited use, only for those with prior dengue infection)'
      }
    },
    {
      name: 'Malaria',
      cases: 12000,
      season: 'Post-Monsoon',
      organism: 'Plasmodium parasites',
      vector: 'Anopheles mosquito',
      prevention: ['Use bed nets', 'Take antimalarial drugs', 'Eliminate standing water'],
      moreInfo: {
        name: 'Malaria',
        cases: 247000000,
        deaths: 619000,
        recovered: 246000000,
        organism: 'Plasmodium falciparum, P. vivax, P. ovale, P. malariae',
        vector: 'Female Anopheles mosquitoes',
        image: 'https://images.pexels.com/photos/5340281/pexels-photo-5340281.jpeg',
        history: 'Ancient disease mentioned in Chinese medical writings from 2700 BC. Killed more people than all wars combined.',
        prevention: ['Insecticide-treated bed nets', 'Indoor residual spraying', 'Antimalarial medications', 'Eliminate breeding sites'],
        vaccine: 'RTS,S/AS01 (Mosquirix) - WHO approved for children in high-risk areas'
      }
    },
    {
      name: 'Chikungunya',
      cases: 8500,
      season: 'Summer',
      organism: 'Chikungunya Virus (CHIKV)',
      vector: 'Aedes mosquito',
      prevention: ['Remove water containers', 'Use repellents', 'Wear protective clothing'],
      moreInfo: {
        name: 'Chikungunya',
        cases: 5000000,
        deaths: 1000,
        recovered: 4950000,
        organism: 'Chikungunya Virus (CHIKV) - RNA virus',
        vector: 'Aedes aegypti and Aedes albopictus mosquitoes',
        image: 'https://images.pexels.com/photos/5340282/pexels-photo-5340282.jpeg',
        history: 'First identified in Tanzania in 1952. Name means "to become contorted" in Kimakonde language.',
        prevention: ['Vector control', 'Personal protection', 'Community awareness', 'Environmental management'],
        vaccine: 'No vaccine available - prevention focuses on vector control'
      }
    }
  ];

  // Heat map data for different metrics
  const heatMapData = {
    disease: [
      { region: 'Mumbai', value: 45000, severity: 'high' },
      { region: 'Delhi', value: 38000, severity: 'high' },
      { region: 'Bangalore', value: 25000, severity: 'medium' },
      { region: 'Chennai', value: 32000, severity: 'medium' },
      { region: 'Kolkata', value: 28000, severity: 'medium' },
      { region: 'Hyderabad', value: 18000, severity: 'low' }
    ],
    aqi: [
      { region: 'Delhi', value: 350, severity: 'critical' },
      { region: 'Mumbai', value: 180, severity: 'high' },
      { region: 'Kolkata', value: 220, severity: 'high' },
      { region: 'Chennai', value: 120, severity: 'medium' },
      { region: 'Bangalore', value: 95, severity: 'low' },
      { region: 'Hyderabad', value: 110, severity: 'medium' }
    ],
    water: [
      { region: 'Chennai', value: 85, severity: 'high' },
      { region: 'Delhi', value: 65, severity: 'medium' },
      { region: 'Mumbai', value: 45, severity: 'medium' },
      { region: 'Kolkata', value: 70, severity: 'high' },
      { region: 'Bangalore', value: 25, severity: 'low' },
      { region: 'Hyderabad', value: 35, severity: 'low' }
    ]
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

  const getHighestRegion = (metric: 'disease' | 'aqi' | 'water') => {
    const data = heatMapData[metric];
    return data.reduce((max, current) => current.value > max.value ? current : max);
  };

  const showDiseaseDetails = (disease: SeasonalDisease) => {
    setSelectedDisease(disease.moreInfo);
    setShowDiseaseModal(true);
  };

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        ...prev,
        totalCases: prev.totalCases + Math.floor(Math.random() * 1000),
        totalDeaths: prev.totalDeaths + Math.floor(Math.random() * 10),
        totalRecovered: prev.totalRecovered + Math.floor(Math.random() * 800)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Users className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Community Health
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Global health statistics and regional insights
          </p>
        </div>
      </div>

      {/* Live Global Statistics */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Live Global Health Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                World Population
              </span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {(globalStats.totalPopulation / 1000000000).toFixed(1)}B
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Live count
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Total Cases
              </span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {(globalStats.totalCases / 1000000).toFixed(0)}M
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              All diseases
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Skull className="w-5 h-5 text-red-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Global Deaths
              </span>
            </div>
            <p className={`text-2xl font-bold text-red-500`}>
              {(globalStats.totalDeaths / 1000000).toFixed(1)}M
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Mortality count
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-green-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Global Recovered
              </span>
            </div>
            <p className={`text-2xl font-bold text-green-500`}>
              {(globalStats.totalRecovered / 1000000).toFixed(0)}M
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Recovery count
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Active Cases
              </span>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {(globalStats.activeCases / 1000000).toFixed(1)}M
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Currently active
            </p>
          </div>
        </div>
      </div>

      {/* Seasonal Diseases in User's Location */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Seasonal Diseases in {profile?.city}, {profile?.country}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {seasonalDiseases.map((disease, index) => (
            <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {disease.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  disease.cases > 30000 ? 'bg-red-100 text-red-800' :
                  disease.cases > 15000 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {disease.season}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Cases:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {disease.cases.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Organism:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {disease.organism}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Vector:</span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {disease.vector}
                  </span>
                </div>
              </div>

              <button
                onClick={() => showDiseaseDetails(disease)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                More Info
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Health Map */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Live Health Map
          </h2>
          
          <div className="flex space-x-2">
            <select
              value={mapView}
              onChange={(e) => setMapView(e.target.value as any)}
              className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border`}
            >
              <option value="global">Global</option>
              <option value="country">{profile?.country}</option>
              <option value="state">{profile?.city} Region</option>
            </select>
            
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border`}
            >
              <option value="disease">Disease Cases</option>
              <option value="aqi">Air Quality Index</option>
              <option value="water">Water Quality</option>
            </select>
          </div>
        </div>

        {/* Map Visualization */}
        <div className={`relative rounded-lg p-8 min-h-96 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center mb-6">
            <Globe className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-blue-500'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {mapView === 'global' ? 'World' : mapView === 'country' ? profile?.country : profile?.city} - {selectedMetric.toUpperCase()} Heat Map
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Highest {selectedMetric}: {getHighestRegion(selectedMetric).region} ({getHighestRegion(selectedMetric).value.toLocaleString()})
            </p>
          </div>

          {/* Heat Map Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {heatMapData[selectedMetric].map((region, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-lg ${getSeverityColor(region.severity)} text-white transform hover:scale-105 transition-transform cursor-pointer`}
                style={{ 
                  opacity: 0.7 + (region.value / Math.max(...heatMapData[selectedMetric].map(r => r.value))) * 0.3 
                }}
              >
                <h4 className="font-semibold mb-1">{region.region}</h4>
                <p className="text-lg font-bold">{region.value.toLocaleString()}</p>
                <p className="text-xs opacity-90">{region.severity.toUpperCase()}</p>
                
                {/* Pulsing animation for high severity */}
                {region.severity === 'critical' && (
                  <div className="absolute inset-0 rounded-lg bg-red-500 animate-pulse opacity-30"></div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disease Details Modal */}
      {showDiseaseModal && selectedDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDisease.name}
                </h3>
                <button
                  onClick={() => setShowDiseaseModal(false)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Global Cases</p>
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDisease.cases.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Deaths</p>
                  <p className="text-lg font-bold text-red-500">
                    {selectedDisease.deaths.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Recovered</p>
                  <p className="text-lg font-bold text-green-500">
                    {selectedDisease.recovered.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Causative Organism
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDisease.organism}
                  </p>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Transmission Vector
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDisease.vector}
                  </p>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Historical Impact
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDisease.history}
                  </p>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Prevention (WHO Guidelines)
                  </h4>
                  <ul className="space-y-1">
                    {selectedDisease.prevention.map((tip, index) => (
                      <li key={index} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-start space-x-2`}>
                        <span className="text-green-500">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Vaccine Status
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDisease.vaccine}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;