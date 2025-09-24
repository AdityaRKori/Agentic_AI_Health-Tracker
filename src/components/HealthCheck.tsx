import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Activity, Heart, Droplets, Thermometer, Bluetooth, Battery, Wifi, AlertTriangle, Phone, CheckCircle } from 'lucide-react';
import { calculateBMI, calculateRiskPredictions } from '../services/mlService';
import { saveVitals } from '../services/storageService';

interface VitalRanges {
  systolic: { min: number; max: number; unit: string };
  diastolic: { min: number; max: number; unit: string };
  glucose: { min: number; max: number; unit: string };
  cholesterol: { min: number; max: number; unit: string };
  heartRate: { min: number; max: number; unit: string };
  temperature: { min: number; max: number; unit: string };
}

interface BluetoothDevice {
  id: string;
  name: string;
  type: string;
  battery: number;
  connected: boolean;
}

const HealthCheck: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [vitals, setVitals] = useState({
    systolicBP: '',
    diastolicBP: '',
    bloodGlucose: '',
    cholesterol: '',
    heartRate: '',
    temperature: '',
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening'
  });

  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [scanning, setScanning] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string>('');

  const [nearbyDevices] = useState<BluetoothDevice[]>([
    { id: '1', name: 'HealthWatch Pro', type: 'Smartwatch', battery: 85, connected: false },
    { id: '2', name: 'BP Monitor X1', type: 'Blood Pressure', battery: 92, connected: false },
    { id: '3', name: 'Glucose Meter Plus', type: 'Glucose Monitor', battery: 67, connected: false },
    { id: '4', name: 'Smart Thermometer', type: 'Temperature', battery: 78, connected: false }
  ]);

  // Normal ranges based on WHO standards
  const normalRanges: VitalRanges = {
    systolic: { min: 90, max: 120, unit: 'mmHg' },
    diastolic: { min: 60, max: 80, unit: 'mmHg' },
    glucose: { min: 70, max: 100, unit: 'mg/dL' },
    cholesterol: { min: 125, max: 200, unit: 'mg/dL' },
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    temperature: { min: 36.1, max: 37.2, unit: '°C' }
  };

  // Emergency numbers by country
  const emergencyNumbers: Record<string, string> = {
    'India': '108',
    'United States': '911',
    'United Kingdom': '999',
    'Canada': '911',
    'Australia': '000',
    'Germany': '112',
    'France': '15',
    'Japan': '119',
    'China': '120',
    'Brazil': '192'
  };

  const validateVital = (value: string, type: keyof VitalRanges): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;

    // Extreme value checks
    if (type === 'systolicBP' && (num < 50 || num > 300)) return false;
    if (type === 'diastolicBP' && (num < 30 || num > 200)) return false;
    if (type === 'bloodGlucose' && (num < 20 || num > 800)) return false;
    if (type === 'cholesterol' && (num < 50 || num > 500)) return false;
    if (type === 'heartRate' && (num < 30 || num > 220)) return false;
    if (type === 'temperature' && (num < 30 || num > 45)) return false;

    return true;
  };

  const getHealthStatus = (value: string, type: keyof VitalRanges): 'normal' | 'warning' | 'critical' => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'normal';

    const range = normalRanges[type];
    
    if (type === 'systolicBP') {
      if (num >= 180) return 'critical';
      if (num >= 140 || num < 90) return 'warning';
    } else if (type === 'diastolicBP') {
      if (num >= 110) return 'critical';
      if (num >= 90 || num < 60) return 'warning';
    } else if (type === 'bloodGlucose') {
      if (num >= 250) return 'critical';
      if (num >= 126 || num < 70) return 'warning';
    } else if (type === 'heartRate') {
      if (num >= 150 || num < 50) return 'critical';
      if (num >= 100 || num < 60) return 'warning';
    } else if (type === 'temperature') {
      if (num >= 39.5 || num < 35) return 'critical';
      if (num >= 38 || num < 36) return 'warning';
    }

    if (num >= range.min && num <= range.max) return 'normal';
    return 'warning';
  };

  const getHealthBarWidth = (value: string, type: keyof VitalRanges): number => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;

    const range = normalRanges[type];
    const percentage = Math.min(100, Math.max(0, ((num - range.min) / (range.max - range.min)) * 100));
    return percentage;
  };

  const getHealthBarColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
    
    // Check for emergency conditions
    if (field === 'systolicBP' && parseFloat(value) >= 180) {
      setEmergencyAlert('Critical blood pressure detected! Please seek immediate medical attention.');
    } else if (field === 'bloodGlucose' && parseFloat(value) >= 250) {
      setEmergencyAlert('Critical blood glucose detected! Please seek immediate medical attention.');
    } else if (field === 'heartRate' && (parseFloat(value) >= 150 || parseFloat(value) < 50)) {
      setEmergencyAlert('Critical heart rate detected! Please seek immediate medical attention.');
    } else {
      setEmergencyAlert('');
    }
  };

  const connectToDevice = (device: BluetoothDevice) => {
    setScanning(true);
    setTimeout(() => {
      setConnectedDevice({ ...device, connected: true });
      setBluetoothConnected(true);
      setShowDevices(false);
      setScanning(false);
      
      // Simulate reading vitals from device
      setTimeout(() => {
        setVitals({
          systolicBP: '118',
          diastolicBP: '78',
          bloodGlucose: '95',
          cholesterol: '180',
          heartRate: '72',
          temperature: '36.8',
          timeOfDay: 'morning'
        });
      }, 2000);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!profile) return;

    // Validate all vitals
    const requiredFields = ['systolicBP', 'diastolicBP', 'bloodGlucose', 'cholesterol'];
    const missingFields = requiredFields.filter(field => !vitals[field as keyof typeof vitals]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required vital signs.');
      return;
    }

    // Validate ranges
    for (const [field, value] of Object.entries(vitals)) {
      if (field !== 'timeOfDay' && value && !validateVital(value, field as keyof VitalRanges)) {
        alert(`Please enter a valid ${field} value.`);
        return;
      }
    }

    const bmi = calculateBMI(profile.height, profile.weight);
    const vitalRecord = {
      systolicBP: parseInt(vitals.systolicBP),
      diastolicBP: parseInt(vitals.diastolicBP),
      bloodGlucose: parseInt(vitals.bloodGlucose),
      cholesterol: parseInt(vitals.cholesterol),
      heartRate: parseInt(vitals.heartRate || '70'),
      temperature: parseFloat(vitals.temperature || '36.5'),
      timeOfDay: vitals.timeOfDay,
      timestamp: new Date().toISOString(),
      bmi
    };

    saveVitals(vitalRecord);
    alert('Vitals saved successfully!');
  };

  const emergencyNumber = emergencyNumbers[profile?.country || 'India'] || '108';

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Background */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/background.png)' }}
        />
        <div className={`relative ${theme === 'dark' ? 'bg-black/80' : 'bg-white/90'} p-8`}>
          <div className="flex items-center space-x-4">
            <img src="/app-icon.png" alt="AI Agentic" className="w-16 h-16" />
            <div>
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-violet-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600'}`}>
                AI Agentic
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Personalized Health Tracker
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6" />
          <div className="flex-1">
            <p className="font-semibold">{emergencyAlert}</p>
            <p className="text-sm">Emergency Number: {emergencyNumber}</p>
          </div>
          <button
            onClick={() => window.open(`tel:${emergencyNumber}`)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now</span>
          </button>
        </div>
      )}

      {/* Bluetooth Device Connection */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Health Device Connection
          </h2>
          <button
            onClick={() => setShowDevices(!showDevices)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              bluetoothConnected
                ? 'bg-green-600 text-white'
                : theme === 'dark'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>{bluetoothConnected ? 'Connected' : 'Connect Device'}</span>
          </button>
        </div>

        {/* Connected Device Dashboard */}
        {connectedDevice && (
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Wifi className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {connectedDevice.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {connectedDevice.battery}%
                </span>
              </div>
            </div>
            
            {/* Live Vitals from Device */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>BP</span>
                </div>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vitals.systolicBP}/{vitals.diastolicBP}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Heart Rate</span>
                </div>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vitals.heartRate || '72'} bpm
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Droplets className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Glucose</span>
                </div>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vitals.bloodGlucose} mg/dL
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Temp</span>
                </div>
                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vitals.temperature || '36.8'}°C
                </p>
              </div>
            </div>

            {/* Health Meter */}
            <div className="mt-4">
              <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Health Status (WHO Standards)
              </h4>
              <div className="space-y-2">
                {Object.entries(vitals).map(([key, value]) => {
                  if (key === 'timeOfDay' || !value) return null;
                  const status = getHealthStatus(value, key as keyof VitalRanges);
                  const width = getHealthBarWidth(value, key as keyof VitalRanges);
                  
                  return (
                    <div key={key} className="flex items-center space-x-3">
                      <span className={`text-xs w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(status)}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className={`text-xs ${
                        status === 'normal' ? 'text-green-600' :
                        status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Device List */}
        {showDevices && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Nearby Devices
            </h3>
            {scanning && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Scanning for devices...
                </p>
              </div>
            )}
            <div className="space-y-2">
              {nearbyDevices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} cursor-pointer transition-colors`}
                  onClick={() => connectToDevice(device)}
                >
                  <div className="flex items-center space-x-3">
                    <Bluetooth className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {device.name}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {device.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-green-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {device.battery}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Vitals Input */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Manual Vitals Entry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Pressure */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Systolic BP (Normal: 90-120 mmHg)
            </label>
            <input
              type="number"
              value={vitals.systolicBP}
              onChange={(e) => handleVitalChange('systolicBP', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="120"
            />
            {vitals.systolicBP && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.systolicBP, 'systolicBP') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.systolicBP, 'systolicBP') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.systolicBP, 'systolicBP').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.systolicBP, 'systolicBP'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.systolicBP, 'systolicBP')}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Diastolic BP (Normal: 60-80 mmHg)
            </label>
            <input
              type="number"
              value={vitals.diastolicBP}
              onChange={(e) => handleVitalChange('diastolicBP', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="80"
            />
            {vitals.diastolicBP && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.diastolicBP, 'diastolicBP') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.diastolicBP, 'diastolicBP') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.diastolicBP, 'diastolicBP').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.diastolicBP, 'diastolicBP'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.diastolicBP, 'diastolicBP')}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Blood Glucose */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Blood Glucose (Normal: 70-100 mg/dL)
            </label>
            <input
              type="number"
              value={vitals.bloodGlucose}
              onChange={(e) => handleVitalChange('bloodGlucose', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="90"
            />
            {vitals.bloodGlucose && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.bloodGlucose, 'glucose') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.bloodGlucose, 'glucose') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.bloodGlucose, 'glucose').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.bloodGlucose, 'glucose'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.bloodGlucose, 'glucose')}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cholesterol */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Cholesterol (Normal: 125-200 mg/dL)
            </label>
            <input
              type="number"
              value={vitals.cholesterol}
              onChange={(e) => handleVitalChange('cholesterol', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="180"
            />
            {vitals.cholesterol && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.cholesterol, 'cholesterol') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.cholesterol, 'cholesterol') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.cholesterol, 'cholesterol').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.cholesterol, 'cholesterol'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.cholesterol, 'cholesterol')}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Heart Rate */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Heart Rate (Normal: 60-100 bpm)
            </label>
            <input
              type="number"
              value={vitals.heartRate}
              onChange={(e) => handleVitalChange('heartRate', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="72"
            />
            {vitals.heartRate && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.heartRate, 'heartRate') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.heartRate, 'heartRate') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.heartRate, 'heartRate').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.heartRate, 'heartRate'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.heartRate, 'heartRate')}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Temperature */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Temperature (Normal: 36.1-37.2°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={vitals.temperature}
              onChange={(e) => handleVitalChange('temperature', e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="36.8"
            />
            {vitals.temperature && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Health Status</span>
                  <span className={`font-medium ${
                    getHealthStatus(vitals.temperature, 'temperature') === 'normal' ? 'text-green-600' :
                    getHealthStatus(vitals.temperature, 'temperature') === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getHealthStatus(vitals.temperature, 'temperature').toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthBarColor(getHealthStatus(vitals.temperature, 'temperature'))}`}
                    style={{ width: `${getHealthBarWidth(vitals.temperature, 'temperature')}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time of Day */}
        <div className="mt-6">
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Time of Day
          </label>
          <select
            value={vitals.timeOfDay}
            onChange={(e) => setVitals(prev => ({ ...prev, timeOfDay: e.target.value as any }))}
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className={`mt-6 w-full py-3 rounded-lg font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-red-600 to-violet-600 text-white hover:from-red-700 hover:to-violet-700'
              : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
          }`}
        >
          Save Vitals
        </button>
      </div>
    </div>
  );
};

export default HealthCheck;