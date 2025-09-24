import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Brush as Virus, Globe, MapPin, TrendingUp, Search, AlertTriangle, Activity, Heart, Skull, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DiseaseData {
  name: string;
  globalCases: number;
  countryCases: number;
  cityCases: number;
  globalDeaths: number;
  countryDeaths: number;
  cityDeaths: number;
  globalRecovered: number;
  countryRecovered: number;
  cityRecovered: number;
  deathRate: number;
  recoveryRate: number;
  trend: 'up' | 'down' | 'stable';
  highestLocation: string;
  lowestLocation: string;
}

interface OutbreakLocation {
  country: string;
  disease: string;
  cases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { lat: number; lng: number };
}

const DiseaseTracker: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState<'communicable' | 'non-communicable'>('communicable');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [diseaseData, setDiseaseData] = useState<DiseaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [outbreakLocations, setOutbreakLocations] = useState<OutbreakLocation[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    highestCasesCountry: { name: 'India', disease: 'COVID-19', cases: 45000000, cured: 43500000 },
    lowestCasesCountry: { name: 'New Zealand', disease: 'COVID-19', cases: 2500000, cured: 2450000 }
  });

  const communicableDiseases = [
    'COVID-19', 'Influenza', 'Tuberculosis', 'Malaria', 'Dengue Fever',
    'Hepatitis B', 'HIV/AIDS', 'Measles', 'Pneumonia', 'Cholera',
    'Typhoid', 'Chickenpox', 'Whooping Cough', 'Meningitis'
  ];

  const nonCommunicableDiseases = [
    'Diabetes Type 2', 'Hypertension', 'Heart Disease', 'Stroke', 'Cancer',
    'Chronic Kidney Disease', 'COPD', 'Alzheimer\'s Disease', 'Osteoporosis', 
    'Arthritis', 'Depression', 'Anxiety Disorders', 'Obesity'
  ];

  const currentDiseases = selectedCategory === 'communicable' ? communicableDiseases : nonCommunicableDiseases;
  const filteredDiseases = currentDiseases.filter(disease => 
    disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadOutbreakData();
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      loadDiseaseData(selectedDisease);
    }
  }, [selectedDisease]);

  const loadOutbreakData = async () => {
    // Simulate global disease outbreak locations
    const outbreaks: OutbreakLocation[] = [
      { country: 'India', disease: 'Dengue', cases: 450000, severity: 'high', coordinates: { lat: 20.5937, lng: 78.9629 } },
      { country: 'Brazil', disease: 'Zika', cases: 280000, severity: 'medium', coordinates: { lat: -14.2350, lng: -51.9253 } },
      { country: 'Nigeria', disease: 'Malaria', cases: 61000000, severity: 'critical', coordinates: { lat: 9.0820, lng: 8.6753 } },
      { country: 'China', disease: 'H5N1', cases: 125000, severity: 'medium', coordinates: { lat: 35.8617, lng: 104.1954 } },
      { country: 'USA', disease: 'West Nile', cases: 85000, severity: 'low', coordinates: { lat: 37.0902, lng: -95.7129 } },
      { country: 'DRC', disease: 'Ebola', cases: 15000, severity: 'critical', coordinates: { lat: -4.0383, lng: 21.7587 } }
    ];
    setOutbreakLocations(outbreaks);
  };

  const loadDashboardStats = async () => {
    // Simulate live dashboard statistics
    setDashboardStats({
      highestCasesCountry: { 
        name: 'India', 
        disease: 'COVID-19', 
        cases: 45000000 + Math.floor(Math.random() * 100000), 
        cured: 43500000 + Math.floor(Math.random() * 95000)
      },
      lowestCasesCountry: { 
        name: 'New Zealand', 
        disease: 'COVID-19', 
        cases: 2500000 + Math.floor(Math.random() * 1000), 
        cured: 2450000 + Math.floor(Math.random() * 950)
      }
    });
  };

  const loadDiseaseData = async (disease: string) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic disease data
    const baseGlobal = Math.floor(Math.random() * 50000000) + 5000000;
    const countryMultiplier = profile?.country === 'India' ? 0.18 : 
                             profile?.country === 'United States' ? 0.04 : 0.02;
    const cityMultiplier = 0.001;

    const locations = ['China', 'India', 'USA', 'Brazil', 'Russia', 'Indonesia'];
    const highestLoc = locations[Math.floor(Math.random() * locations.length)];
    const lowestLoc = locations.filter(l => l !== highestLoc)[Math.floor(Math.random() * (locations.length - 1))];

    const globalDeaths = Math.floor(baseGlobal * (selectedCategory === 'communicable' ? 0.02 : 0.15));
    const globalRecovered = Math.floor(baseGlobal * (selectedCategory === 'communicable' ? 0.85 : 0.70));

    const data: DiseaseData = {
      name: disease,
      globalCases: baseGlobal,
      countryCases: Math.floor(baseGlobal * countryMultiplier),
      cityCases: Math.floor(baseGlobal * cityMultiplier),
      globalDeaths: globalDeaths,
      countryDeaths: Math.floor(globalDeaths * countryMultiplier),
      cityDeaths: Math.floor(globalDeaths * cityMultiplier),
      globalRecovered: globalRecovered,
      countryRecovered: Math.floor(globalRecovered * countryMultiplier),
      cityRecovered: Math.floor(globalRecovered * cityMultiplier),
      deathRate: selectedCategory === 'communicable' ? 
        Math.random() * 15 + 1 : Math.random() * 25 + 5,
      recoveryRate: selectedCategory === 'communicable' ? 
        Math.random() * 20 + 75 : Math.random() * 30 + 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
      highestLocation: highestLoc,
      lowestLocation: lowestLoc
    };

    setDiseaseData(data);
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      default: return <div className="w-4 h-4 bg-yellow-500 rounded-full" />;
    }
  };

  const getSeveritySize = (severity: string) => {
    switch (severity) {
      case 'critical': return 'w-6 h-6';
      case 'high': return 'w-5 h-5';
      case 'medium': return 'w-4 h-4';
      case 'low': return 'w-3 h-3';
      default: return 'w-4 h-4';
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Virus className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Disease Tracker
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Live global disease monitoring and outbreak tracking
          </p>
        </div>
      </div>

      {/* Dashboard Stats Card */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Live Global Disease Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                Highest Cases Country
              </h3>
            </div>
            <div className="space-y-2">
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.highestCasesCountry.name}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Disease: {dashboardStats.highestCasesCountry.disease}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cases: {formatNumber(dashboardStats.highestCasesCountry.cases)}
              </p>
              <p className={`text-sm text-green-600`}>
                Cured: {formatNumber(dashboardStats.highestCasesCountry.cured)}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <Heart className="w-6 h-6 text-green-500" />
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                Lowest Cases Country
              </h3>
            </div>
            <div className="space-y-2">
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats.lowestCasesCountry.name}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Disease: {dashboardStats.lowestCasesCountry.disease}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cases: {formatNumber(dashboardStats.lowestCasesCountry.cases)}
              </p>
              <p className={`text-sm text-green-600`}>
                Cured: {formatNumber(dashboardStats.lowestCasesCountry.cured)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Disease Outbreak Map */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Live Disease Outbreak Map
        </h2>
        <div className={`relative rounded-lg p-8 min-h-64 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
          <div className="text-center">
            <Globe className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-blue-500'}`} />
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Interactive Disease Outbreak Map
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              {outbreakLocations.map((outbreak, index) => (
                <div key={index} className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} p-4 rounded-lg shadow relative`}>
                  <div className="flex items-center space-x-3">
                    <div className={`${getSeveritySize(outbreak.severity)} ${getSeverityColor(outbreak.severity)} rounded-full animate-pulse`} />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {outbreak.country}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {outbreak.disease}
                      </p>
                      <p className={`text-xs font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                        {formatNumber(outbreak.cases)} cases
                      </p>
                      <p className={`text-xs ${outbreak.severity === 'critical' ? 'text-red-500' : outbreak.severity === 'high' ? 'text-orange-500' : outbreak.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {outbreak.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disease Search and Selection */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Disease Statistics & Comparison
        </h2>

        {/* Category Selection */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedCategory('communicable')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'communicable'
                ? theme === 'dark' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Communicable Diseases
          </button>
          <button
            onClick={() => setSelectedCategory('non-communicable')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'non-communicable'
                ? theme === 'dark' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Non-Communicable Diseases
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search diseases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-800 text-white border-gray-700'
                : 'bg-gray-50 text-gray-900 border-gray-300'
            } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Disease List */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {filteredDiseases.map((disease) => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDisease === disease
                  ? theme === 'dark' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {disease}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme === 'dark' ? 'border-red-600' : 'border-blue-600'}`}></div>
            <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading live disease data...
            </span>
          </div>
        )}

        {/* Disease Statistics */}
        {diseaseData && !loading && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {diseaseData.name} - Live Statistics Comparison
              </h3>
              {getTrendIcon(diseaseData.trend)}
            </div>

            {/* Statistics Grid - Global, Country, City */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Global Stats */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  Global Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cases: {formatNumber(diseaseData.globalCases)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deaths: {formatNumber(diseaseData.globalDeaths)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recovered: {formatNumber(diseaseData.globalRecovered)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Country Stats */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {profile?.country} Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cases: {formatNumber(diseaseData.countryCases)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deaths: {formatNumber(diseaseData.countryDeaths)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recovered: {formatNumber(diseaseData.countryRecovered)}
                    </span>
                  </div>
                </div>
              </div>

              {/* City Stats */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {profile?.city} Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cases: {formatNumber(diseaseData.cityCases)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deaths: {formatNumber(diseaseData.cityDeaths)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recovered: {formatNumber(diseaseData.cityRecovered)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="mt-6">
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cases Comparison: Global vs {profile?.country} vs {profile?.city}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    location: 'Global',
                    cases: diseaseData.globalCases / 1000000,
                    deaths: diseaseData.globalDeaths / 1000000,
                    recovered: diseaseData.globalRecovered / 1000000
                  },
                  {
                    location: profile?.country,
                    cases: diseaseData.countryCases / 1000000,
                    deaths: diseaseData.countryDeaths / 1000000,
                    recovered: diseaseData.countryRecovered / 1000000
                  },
                  {
                    location: profile?.city,
                    cases: diseaseData.cityCases / 1000,
                    deaths: diseaseData.cityDeaths / 1000,
                    recovered: diseaseData.cityRecovered / 1000
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="location" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cases" fill={theme === 'dark' ? '#EF4444' : '#3B82F6'} name="Cases (M)" />
                  <Bar dataKey="deaths" fill="#DC2626" name="Deaths (M)" />
                  <Bar dataKey="recovered" fill="#059669" name="Recovered (M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Treatment Information */}
            <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                Treatment Available in {profile?.country}
              </h4>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                Standard treatment protocols are available at major hospitals and healthcare centers.
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Nearest Treatment Centers:</strong> Available at all major hospitals and government health centers. 
                For medications, consult your local pharmacy or healthcare provider.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseTracker;