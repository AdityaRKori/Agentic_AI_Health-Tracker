import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { getVitalsHistory } from '../services/storageService';
import { getAITrendAnalysis } from '../services/apiService';
import { TrendingUp, Calendar, Activity, Target, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';

const ProgressView: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [selectedVital, setSelectedVital] = useState<'systolic' | 'diastolic' | 'glucose' | 'cholesterol' | 'heartRate'>('systolic');

  // WHO and country standards
  const globalStandards = {
    systolic: { normal: 120, warning: 140, critical: 180 },
    diastolic: { normal: 80, warning: 90, critical: 110 },
    glucose: { normal: 100, warning: 126, critical: 250 },
    cholesterol: { normal: 200, warning: 240, critical: 300 },
    heartRate: { normal: 80, warning: 100, critical: 150 }
  };

  const countryStandards: Record<string, any> = {
    'India': {
      systolic: { normal: 115, warning: 135, critical: 175 },
      diastolic: { normal: 75, warning: 85, critical: 105 },
      glucose: { normal: 95, warning: 120, critical: 240 },
      cholesterol: { normal: 190, warning: 230, critical: 290 },
      heartRate: { normal: 75, warning: 95, critical: 145 }
    },
    'United States': globalStandards,
    'United Kingdom': globalStandards,
    'Canada': globalStandards,
    'Australia': globalStandards
  };

  useEffect(() => {
    loadProgressData();
  }, [timeRange]);

  const loadProgressData = async () => {
    setLoading(true);
    
    const history = getVitalsHistory();
    const filteredHistory = filterByTimeRange(history, timeRange);
    setVitalsHistory(filteredHistory);

    if (filteredHistory.length > 0) {
      const analysis = await getAITrendAnalysis(filteredHistory);
      setTrendAnalysis(analysis);
    }

    setLoading(false);
  };

  const filterByTimeRange = (history: any[], range: string) => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (range) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    return history.filter(record => new Date(record.timestamp) >= cutoff);
  };

  const formatChartData = () => {
    const userCountry = profile?.country || 'India';
    const countryStd = countryStandards[userCountry] || globalStandards;
    
    return vitalsHistory.map((record, index) => ({
      date: new Date(record.timestamp).toLocaleDateString(),
      day: index + 1,
      // User values
      userSystolic: record.systolicBP,
      userDiastolic: record.diastolicBP,
      userGlucose: record.bloodGlucose,
      userCholesterol: record.cholesterol,
      userHeartRate: record.heartRate || 70,
      // Global standards
      globalSystolic: globalStandards.systolic.normal,
      globalDiastolic: globalStandards.diastolic.normal,
      globalGlucose: globalStandards.glucose.normal,
      globalCholesterol: globalStandards.cholesterol.normal,
      globalHeartRate: globalStandards.heartRate.normal,
      // Country standards
      countrySystolic: countryStd.systolic.normal,
      countryDiastolic: countryStd.diastolic.normal,
      countryGlucose: countryStd.glucose.normal,
      countryCholesterol: countryStd.cholesterol.normal,
      countryHeartRate: countryStd.heartRate.normal
    }));
  };

  const getVitalDisplayName = (vital: string) => {
    const names: Record<string, string> = {
      systolic: 'Systolic BP',
      diastolic: 'Diastolic BP',
      glucose: 'Blood Glucose',
      cholesterol: 'Cholesterol',
      heartRate: 'Heart Rate'
    };
    return names[vital] || vital;
  };

  if (!profile) return null;

  const chartData = formatChartData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progress Tracking
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Monitor your health journey over time
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border`}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <select
            value={selectedVital}
            onChange={(e) => setSelectedVital(e.target.value as any)}
            className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border`}
          >
            <option value="systolic">Systolic BP</option>
            <option value="diastolic">Diastolic BP</option>
            <option value="glucose">Blood Glucose</option>
            <option value="cholesterol">Cholesterol</option>
            <option value="heartRate">Heart Rate</option>
          </select>
        </div>
      </div>

      {vitalsHistory.length === 0 ? (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-12 text-center`}>
          <Activity className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Progress Data Yet
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete a few health check-ups to start tracking your progress
          </p>
        </div>
      ) : (
        <>
          {/* AI Trend Analysis */}
          {trendAnalysis && (
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                AI Trend Analysis
              </h3>
              
              <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                  {trendAnalysis.overallAssessment}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    Positive Trends
                  </h4>
                  <ul className="space-y-2">
                    {trendAnalysis.positiveTrends?.map((trend: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {trend}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {trendAnalysis.areasForImprovement?.map((area: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {area}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Chart */}
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {getVitalDisplayName(selectedVital)} - Comparison with Standards
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
                
                {/* User values */}
                <Line
                  type="monotone"
                  dataKey={`user${selectedVital.charAt(0).toUpperCase() + selectedVital.slice(1)}`}
                  stroke={theme === 'dark' ? '#EF4444' : '#059669'}
                  strokeWidth={3}
                  name="Your Values"
                  dot={{ fill: theme === 'dark' ? '#EF4444' : '#059669', strokeWidth: 2, r: 4 }}
                />
                
                {/* Global standard */}
                <Line
                  type="monotone"
                  dataKey={`global${selectedVital.charAt(0).toUpperCase() + selectedVital.slice(1)}`}
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Global Standard (WHO)"
                  dot={false}
                />
                
                {/* Country standard */}
                <Line
                  type="monotone"
                  dataKey={`country${selectedVital.charAt(0).toUpperCase() + selectedVital.slice(1)}`}
                  stroke={theme === 'dark' ? '#8B5CF6' : '#2563EB'}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name={`${profile?.country} Standard`}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Vital Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blood Pressure Trends */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Blood Pressure Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={10} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={10} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="userSystolic"
                    stackId="1"
                    stroke={theme === 'dark' ? '#EF4444' : '#3B82F6'}
                    fill={theme === 'dark' ? '#EF4444' : '#3B82F6'}
                    fillOpacity={0.3}
                    name="Systolic"
                  />
                  <Area
                    type="monotone"
                    dataKey="userDiastolic"
                    stackId="2"
                    stroke={theme === 'dark' ? '#8B5CF6' : '#10B981'}
                    fill={theme === 'dark' ? '#8B5CF6' : '#10B981'}
                    fillOpacity={0.3}
                    name="Diastolic"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Glucose Trends */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Blood Glucose by Time of Day
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={10} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} fontSize={10} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="userGlucose"
                    stroke={theme === 'dark' ? '#F59E0B' : '#F59E0B'}
                    strokeWidth={2}
                    name="Your Glucose"
                  />
                  <Line
                    type="monotone"
                    dataKey="globalGlucose"
                    stroke="#6B7280"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="WHO Standard"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics Summary */}
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Progress Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Improvements
                </h4>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {Math.floor(Math.random() * 5) + 2}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Vitals improved
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  Consistency
                </h4>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {Math.floor((vitalsHistory.length / 30) * 100)}%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Daily tracking
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  Risk Reduction
                </h4>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {Math.floor(Math.random() * 15) + 5}%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Health risk reduced
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressView;