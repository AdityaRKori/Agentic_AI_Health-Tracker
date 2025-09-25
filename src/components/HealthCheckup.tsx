import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, Droplets, Thermometer, Calendar, 
  AlertTriangle, Phone, CheckCircle, Bluetooth, Shield
} from 'lucide-react';
import BluetoothDashboard from './BluetoothDashboard';
import { Vitals, UserProfile, BluetoothDevice } from '../types';
import { validateVitals, ValidationResult } from '../utils/validation';
import { WHO_STANDARDS } from '../utils/constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface HealthCheckupProps {
  userProfile: UserProfile;
  onVitalsSubmit: (vitals: Vitals) => void;
  lastReport?: string;
}

const HealthCheckup: React.FC<HealthCheckupProps> = ({ 
  userProfile, 
  onVitalsSubmit,
  lastReport 
}) => {
  const [vitals, setVitals] = useState<Partial<Vitals>>({
    timeOfDay: 'morning'
  });
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, warnings: [] });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    const result = validateVitals(vitals, userProfile.country);
    setValidation(result);
    
    if (result.emergencyAlert) {
      setShowEmergencyModal(true);
    }
    
    updateRadarChart();
  }, [vitals, userProfile.country]);

  const updateRadarChart = () => {
    if (!vitals.systolicBP || !vitals.bloodGlucose || !vitals.heartRate) return;
    
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
    
    // Normalize values to 0-100 scale for radar chart
    const data = [
      {
        metric: 'Blood Pressure',
        user: Math.min((vitals.systolicBP / 200) * 100, 100),
        country: 75, // Mock country average
        global: 70   // Mock global average
      },
      {
        metric: 'Heart Rate',
        user: Math.min((vitals.heartRate / 150) * 100, 100),
        country: 65,
        global: 60
      },
      {
        metric: 'Blood Glucose',
        user: Math.min((vitals.bloodGlucose / 200) * 100, 100),
        country: 55,
        global: 50
      },
      {
        metric: 'BMI',
        user: Math.min((bmi / 35) * 100, 100),
        country: 68,
        global: 65
      },
      {
        metric: 'Cholesterol',
        user: vitals.cholesterol ? Math.min((vitals.cholesterol / 300) * 100, 100) : 0,
        country: 72,
        global: 68
      }
    ];
    
    setRadarData(data);
  };

  const getHealthMeterColor = (value: number, type: string) => {
    switch (type) {
      case 'bp':
        if (value < 120) return 'bg-green-500';
        if (value < 140) return 'bg-yellow-500';
        return 'bg-red-500';
      case 'glucose':
        if (value < 100) return 'bg-green-500';
        if (value < 125) return 'bg-yellow-500';
        return 'bg-red-500';
      case 'hr':
        if (value >= 60 && value <= 100) return 'bg-green-500';
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthMeterWidth = (value: number, type: string) => {
    let percentage = 0;
    switch (type) {
      case 'bp':
        percentage = Math.min((value / 200) * 100, 100);
        break;
      case 'glucose':
        percentage = Math.min((value / 200) * 100, 100);
        break;
      case 'hr':
        percentage = Math.min((value / 150) * 100, 100);
        break;
    }
    return `${percentage}%`;
  };

  const handleSubmit = async () => {
    if (validation.emergencyAlert) {
      setShowEmergencyModal(true);
      return;
    }

    if (vitals.systolicBP && vitals.diastolicBP && vitals.bloodGlucose && vitals.heartRate) {
      setIsAnalyzing(true);
      
      const completeVitals: Vitals = {
        systolicBP: vitals.systolicBP,
        diastolicBP: vitals.diastolicBP,
        heartRate: vitals.heartRate,
        bloodGlucose: vitals.bloodGlucose,
        cholesterol: vitals.cholesterol || 180,
        bodyTemp: vitals.bodyTemp || 37,
        timeOfDay: vitals.timeOfDay || 'morning',
        date: new Date().toISOString()
      };
      
      // Simulate analysis delay
      setTimeout(() => {
        onVitalsSubmit(completeVitals);
        setIsAnalyzing(false);
      }, 3000);
    }
  };

  const handleBluetoothConnect = () => {
    setShowBluetoothModal(true);
  };

  const simulateBluetoothReading = (deviceName: string) => {
    const mockDevice: BluetoothDevice = {
      id: 'bt-001',
      name: deviceName,
      connected: true,
      batteryLevel: Math.floor(Math.random() * 100) + 1,
      vitals: {
        systolicBP: Math.floor(Math.random() * 40) + 110,
        diastolicBP: Math.floor(Math.random() * 20) + 70,
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodGlucose: Math.floor(Math.random() * 50) + 80,
        bodyTemp: Math.random() * 2 + 36.5
      }
    };
    
    setBluetoothDevice(mockDevice);
    setVitals(prev => ({ ...prev, ...mockDevice.vitals }));
    setShowBluetoothModal(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Background Card */}
      <div className="relative mb-8 rounded-2xl overflow-hidden h-48">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/background.png)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-purple-600/30" />
        <div className="relative z-10 p-8 h-full flex items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Health Check-up</h1>
            <p className="text-white/90">Monitor your vitals and get AI-powered health insights</p>
            {lastReport && (
              <div className="mt-4 flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Last analysis completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Vitals Input */}
        <div className="space-y-6">
          {/* Bluetooth Device Dashboard */}
          <BluetoothDashboard
            device={bluetoothDevice}
            onConnect={handleBluetoothConnect}
            onDisconnect={() => setBluetoothDevice(null)}
          />

          {/* Time Selection */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Reading Time
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['morning', 'afternoon', 'evening'] as const).map(time => (
                <button
                  key={time}
                  onClick={() => setVitals(prev => ({ ...prev, timeOfDay: time }))}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    vitals.timeOfDay === time 
                      ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Vitals Input */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Enter Vitals</h3>
            
            <div className="space-y-4">
              {/* Blood Pressure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Heart className="w-4 h-4 inline mr-1 text-red-500" />
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.systolicBP || ''}
                    onChange={(e) => setVitals(prev => ({ ...prev, systolicBP: Number(e.target.value) }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                    placeholder="120"
                  />
                  {vitals.systolicBP && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getHealthMeterColor(vitals.systolicBP, 'bp')}`}
                          style={{ width: getHealthMeterWidth(vitals.systolicBP, 'bp') }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={vitals.diastolicBP || ''}
                    onChange={(e) => setVitals(prev => ({ ...prev, diastolicBP: Number(e.target.value) }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                    placeholder="80"
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Activity className="w-4 h-4 inline mr-1 text-red-500" />
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={vitals.heartRate || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, heartRate: Number(e.target.value) }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="72"
                />
                {vitals.heartRate && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getHealthMeterColor(vitals.heartRate, 'hr')}`}
                        style={{ width: getHealthMeterWidth(vitals.heartRate, 'hr') }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Blood Glucose */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Droplets className="w-4 h-4 inline mr-1 text-blue-500" />
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={vitals.bloodGlucose || ''}
                  onChange={(e) => setVitals(prev => ({ ...prev, bloodGlucose: Number(e.target.value) }))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="90"
                />
                {vitals.bloodGlucose && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getHealthMeterColor(vitals.bloodGlucose, 'glucose')}`}
                        style={{ width: getHealthMeterWidth(vitals.bloodGlucose, 'glucose') }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cholesterol (mg/dL) - Optional
                  </label>
                  <input
                    type="number"
                    value={vitals.cholesterol || ''}
                    onChange={(e) => setVitals(prev => ({ ...prev, cholesterol: Number(e.target.value) }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Thermometer className="w-4 h-4 inline mr-1 text-yellow-500" />
                    Body Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.bodyTemp || ''}
                    onChange={(e) => setVitals(prev => ({ ...prev, bodyTemp: Number(e.target.value) }))}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="37.0"
                  />
                </div>
              </div>
            </div>

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="mt-4 bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-500 font-medium">Warnings</span>
                </div>
                <ul className="text-yellow-300 text-sm space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!vitals.systolicBP || !vitals.diastolicBP || !vitals.bloodGlucose || !vitals.heartRate || isAnalyzing}
              className="w-full mt-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing Health Data...
                </div>
              ) : (
                'Analyze My Health'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Visualization & Guide */}
        <div className="space-y-6">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Health Metrics Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#ffffff', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: '#ffffff', fontSize: 10 }} domain={[0, 100]} />
                    <Radar
                      name="Your Values"
                      dataKey="user"
                      stroke="#e74c3c"
                      fill="#e74c3c"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Country Average"
                      dataKey="country"
                      stroke="#f39c12"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Radar
                      name="Global Average"
                      dataKey="global"
                      stroke="#3498db"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Vitals Reference Guide */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-500" />
              WHO Health Standards
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Male ({userProfile.age} years)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood Pressure:</span>
                      <span className="text-green-400">90-120/60-80</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood Sugar:</span>
                      <span className="text-green-400">70-100 mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heart Rate:</span>
                      <span className="text-green-400">60-100 bpm</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">BMI Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current BMI:</span>
                      <span className="text-white">
                        {(userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country Avg:</span>
                      <span className="text-yellow-400">24.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Global Avg:</span>
                      <span className="text-blue-400">23.8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/30 rounded-lg p-3 mt-4">
                <p className="text-blue-300 text-xs">
                  ℹ️ Values may vary based on ethnicity and regional factors. 
                  South Asian populations may have different optimal ranges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && validation.emergencyAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-red-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
              <h2 className="text-xl font-bold text-white">{validation.emergencyAlert.title}</h2>
            </div>
            
            <p className="text-red-100 mb-4">{validation.emergencyAlert.message}</p>
            
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-2">Immediate Actions:</h3>
              <ul className="text-red-100 space-y-1 text-sm">
                {validation.emergencyAlert.instructions.map((instruction, index) => (
                  <li key={index}>• {instruction}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <a
                href={`tel:${validation.emergencyAlert.emergencyNumber}`}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call {validation.emergencyAlert.emergencyNumber}
              </a>
              
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-3 border border-red-600 text-red-400 rounded-lg hover:bg-red-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bluetooth Modal */}
      {showBluetoothModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Available Bluetooth Devices</h2>
            
            <div className="space-y-3">
              {[
                'OMRON BP Monitor',
                'Accu-Chek Guide',
                'Fitbit Sense 2',
                'Apple Watch Series 9'
              ].map(device => (
                <button
                  key={device}
                  onClick={() => simulateBluetoothReading(device)}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{device}</div>
                      <div className="text-gray-400 text-sm">Available</div>
                    </div>
                    <Bluetooth className="w-5 h-5 text-blue-500" />
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowBluetoothModal(false)}
              className="w-full mt-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCheckup;