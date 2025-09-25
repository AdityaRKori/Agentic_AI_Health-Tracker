import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Filter, BarChart3, Activity, 
  Heart, Droplets, Thermometer, Target, Zap
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { UserProfile, Vitals, HealthRecord } from '../types';

interface ProgressTrackingProps {
  userProfile: UserProfile;
  healthRecords: HealthRecord[];
}

interface ProgressData {
  date: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodGlucose: number;
  cholesterol: number;
  bodyTemp: number;
  bmi: number;
  timeOfDay: string;
}

interface PredictionData {
  date: string;
  current: number;
  predicted: number;
  target: number;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ userProfile, healthRecords }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedVital, setSelectedVital] = useState<string>('systolicBP');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [overallTrend, setOverallTrend] = useState<'improving' | 'stable' | 'declining'>('stable');

  const vitalsConfig = {
    systolicBP: { 
      name: 'Systolic Blood Pressure', 
      unit: 'mmHg', 
      color: '#e74c3c', 
      target: 120, 
      icon: Heart,
      healthyRange: [90, 120]
    },
    diastolicBP: { 
      name: 'Diastolic Blood Pressure', 
      unit: 'mmHg', 
      color: '#c0392b', 
      target: 80, 
      icon: Heart,
      healthyRange: [60, 80]
    },
    heartRate: { 
      name: 'Heart Rate', 
      unit: 'bpm', 
      color: '#e67e22', 
      target: 70, 
      icon: Activity,
      healthyRange: [60, 100]
    },
    bloodGlucose: { 
      name: 'Blood Glucose', 
      unit: 'mg/dL', 
      color: '#3498db', 
      target: 90, 
      icon: Droplets,
      healthyRange: [70, 100]
    },
    cholesterol: { 
      name: 'Cholesterol', 
      unit: 'mg/dL', 
      color: '#9b59b6', 
      target: 180, 
      icon: Activity,
      healthyRange: [150, 200]
    },
    bodyTemp: { 
      name: 'Body Temperature', 
      unit: '°C', 
      color: '#f39c12', 
      target: 37.0, 
      icon: Thermometer,
      healthyRange: [36.1, 37.2]
    },
    bmi: { 
      name: 'BMI', 
      unit: '', 
      color: '#27ae60', 
      target: 22.5, 
      icon: Target,
      healthyRange: [18.5, 24.9]
    }
  };

  useEffect(() => {
    generateProgressData();
    generatePredictions();
    calculateOverallTrend();
  }, [healthRecords, timeRange, userProfile]);

  const generateProgressData = () => {
    // Generate mock historical data based on time range
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data: ProgressData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation to the data
      const baseValues = {
        systolicBP: 120 + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 20,
        diastolicBP: 80 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 10,
        heartRate: 70 + Math.sin(i * 0.2) * 15 + (Math.random() - 0.5) * 20,
        bloodGlucose: 90 + Math.sin(i * 0.15) * 20 + (Math.random() - 0.5) * 30,
        cholesterol: 180 + Math.sin(i * 0.05) * 30 + (Math.random() - 0.5) * 40,
        bodyTemp: 37.0 + (Math.random() - 0.5) * 1.5,
        bmi: userProfile.weight / Math.pow(userProfile.height / 100, 2) + (Math.random() - 0.5) * 2
      };

      data.push({
        date: date.toISOString().split('T')[0],
        ...baseValues,
        timeOfDay: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)]
      });
    }
    
    setProgressData(data);
  };

  const generatePredictions = () => {
    // Generate prediction data for the next 30 days
    const predictions: PredictionData[] = [];
    const currentValue = progressData.length > 0 ? 
      progressData[progressData.length - 1][selectedVital as keyof ProgressData] as number : 
      vitalsConfig[selectedVital as keyof typeof vitalsConfig].target;
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simulate improvement trend
      const improvement = i * 0.5; // Gradual improvement
      const predicted = currentValue - improvement + (Math.random() - 0.5) * 5;
      const target = vitalsConfig[selectedVital as keyof typeof vitalsConfig].target;
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        current: currentValue,
        predicted: Math.max(predicted, target * 0.8), // Don't go too low
        target
      });
    }
    
    setPredictionData(predictions);
  };

  const calculateOverallTrend = () => {
    if (progressData.length < 2) return;
    
    const recent = progressData.slice(-7); // Last 7 days
    const earlier = progressData.slice(-14, -7); // Previous 7 days
    
    const recentAvg = recent.reduce((sum, data) => sum + data.systolicBP, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, data) => sum + data.systolicBP, 0) / earlier.length;
    
    if (recentAvg < earlierAvg - 5) setOverallTrend('improving');
    else if (recentAvg > earlierAvg + 5) setOverallTrend('declining');
    else setOverallTrend('stable');
  };

  const getVitalIcon = (vitalKey: string) => {
    const IconComponent = vitalsConfig[vitalKey as keyof typeof vitalsConfig]?.icon || Activity;
    return <IconComponent className="w-5 h-5" />;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getCurrentVitalConfig = () => {
    return vitalsConfig[selectedVital as keyof typeof vitalsConfig];
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
            <h1 className="text-3xl font-bold text-white mb-2">Progress Tracking</h1>
            <p className="text-white/90">Monitor your health journey with detailed analytics</p>
            <div className={`flex items-center mt-2 ${getTrendColor(overallTrend)}`}>
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-sm">Overall trend: {overallTrend}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-sm">Total Records</div>
            <div className="text-2xl font-bold text-white">{progressData.length}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Time Range Selection */}
        <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Time Range
          </h3>
          <div className="flex space-x-3">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range ? 'text-white' : 'hover:bg-gray-700'
                }`}
                style={{
                  background: timeRange === range ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: timeRange === range ? 'white' : 'var(--text-primary)'
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vital Selection */}
        <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Select Vital
          </h3>
          <select
            value={selectedVital}
            onChange={(e) => setSelectedVital(e.target.value)}
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{ 
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
          >
            {Object.entries(vitalsConfig).map(([key, config]) => (
              <option key={key} value={key} style={{ background: 'var(--bg-tertiary)' }}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Chart */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {getVitalIcon(selectedVital)}
            <h3 className="text-xl font-semibold ml-2" style={{ color: 'var(--text-primary)' }}>
              {getCurrentVitalConfig().name} Trend
            </h3>
          </div>
          <div className="text-right">
            <div style={{ color: 'var(--text-secondary)' }} className="text-sm">Current Average</div>
            <div className="text-xl font-bold" style={{ color: getCurrentVitalConfig().color }}>
              {progressData.length > 0 ? 
                (progressData.slice(-7).reduce((sum, data) => 
                  sum + (data[selectedVital as keyof ProgressData] as number), 0) / 7
                ).toFixed(1) : '0'} {getCurrentVitalConfig().unit}
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              
              {/* Healthy Range Area */}
              <Area
                dataKey={() => getCurrentVitalConfig().healthyRange[1]}
                stackId="1"
                stroke="none"
                fill="#10B981"
                fillOpacity={0.1}
                name="Healthy Range"
              />
              <Area
                dataKey={() => getCurrentVitalConfig().healthyRange[0]}
                stackId="1"
                stroke="none"
                fill="#ffffff"
                fillOpacity={1}
                name=""
              />
              
              {/* Actual Data */}
              <Area
                dataKey={selectedVital}
                stroke={getCurrentVitalConfig().color}
                fill={getCurrentVitalConfig().color}
                fillOpacity={0.3}
                strokeWidth={2}
                name={getCurrentVitalConfig().name}
              />
              
              {/* Target Line */}
              <Line
                dataKey={() => getCurrentVitalConfig().target}
                stroke="#10B981"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Chart */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 mr-2" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            30-Day Prediction
          </h3>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              
              <Line
                dataKey="current"
                stroke="#6B7280"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Current Level"
              />
              <Line
                dataKey="predicted"
                stroke={getCurrentVitalConfig().color}
                strokeWidth={3}
                dot={false}
                name="Predicted"
              />
              <Line
                dataKey="target"
                stroke="#10B981"
                strokeDasharray="3 3"
                strokeWidth={2}
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overall Health Radar */}
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Overall Health Assessment
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                {
                  metric: 'Blood Pressure',
                  current: 75,
                  target: 100,
                  country: 70,
                  global: 65
                },
                {
                  metric: 'Heart Rate',
                  current: 85,
                  target: 100,
                  country: 75,
                  global: 70
                },
                {
                  metric: 'Blood Glucose',
                  current: 90,
                  target: 100,
                  country: 80,
                  global: 75
                },
                {
                  metric: 'Cholesterol',
                  current: 70,
                  target: 100,
                  country: 65,
                  global: 60
                },
                {
                  metric: 'BMI',
                  current: 80,
                  target: 100,
                  country: 70,
                  global: 65
                }
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} domain={[0, 100]} />
                <Radar
                  name="Your Health"
                  dataKey="current"
                  stroke="#e74c3c"
                  fill="#e74c3c"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#10B981"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Health Metrics Summary */}
          <div className="space-y-4">
            {Object.entries(vitalsConfig).slice(0, 5).map(([key, config]) => {
              const currentValue = progressData.length > 0 ? 
                progressData[progressData.length - 1][key as keyof ProgressData] as number : 
                config.target;
              const percentage = Math.min((currentValue / config.target) * 100, 100);
              
              return (
                <div key={key} style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getVitalIcon(key)}
                      <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {config.name}
                      </span>
                    </div>
                    <span style={{ color: config.color }} className="font-semibold">
                      {currentValue.toFixed(1)} {config.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>Target: {config.target} {config.unit}</span>
                    <span>{percentage.toFixed(0)}% of target</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;