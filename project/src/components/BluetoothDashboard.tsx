import React, { useState, useEffect } from 'react';
import { Bluetooth, Battery, Wifi, Activity, Heart, Droplets, Thermometer } from 'lucide-react';
import { BluetoothDevice } from '../types';

interface BluetoothDashboardProps {
  device: BluetoothDevice | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const BluetoothDashboard: React.FC<BluetoothDashboardProps> = ({ 
  device, 
  onConnect, 
  onDisconnect 
}) => {
  const [liveVitals, setLiveVitals] = useState(device?.vitals || {});
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (device?.connected) {
      const interval = setInterval(() => {
        setIsReading(true);
        setTimeout(() => {
          const newVitals = {
            systolicBP: Math.floor(Math.random() * 40) + 110,
            diastolicBP: Math.floor(Math.random() * 20) + 70,
            heartRate: Math.floor(Math.random() * 40) + 60,
            bloodGlucose: Math.floor(Math.random() * 50) + 80,
            bodyTemp: Math.random() * 2 + 36.5
          };
          setLiveVitals(newVitals);
          setIsReading(false);
        }, 2000);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [device?.connected]);

  const getVitalStatus = (value: number, type: string) => {
    switch (type) {
      case 'bp':
        if (value < 120) return { color: 'bg-green-500', status: 'Normal' };
        if (value < 140) return { color: 'bg-yellow-500', status: 'Elevated' };
        return { color: 'bg-red-500', status: 'High' };
      case 'hr':
        if (value >= 60 && value <= 100) return { color: 'bg-green-500', status: 'Normal' };
        return { color: 'bg-yellow-500', status: 'Monitor' };
      case 'glucose':
        if (value < 100) return { color: 'bg-green-500', status: 'Normal' };
        if (value < 125) return { color: 'bg-yellow-500', status: 'Elevated' };
        return { color: 'bg-red-500', status: 'High' };
      case 'temp':
        if (value >= 36.1 && value <= 37.2) return { color: 'bg-green-500', status: 'Normal' };
        return { color: 'bg-yellow-500', status: 'Monitor' };
      default:
        return { color: 'bg-gray-500', status: 'Unknown' };
    }
  };

  if (!device) {
    return (
      <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bluetooth className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Bluetooth Devices
            </h3>
          </div>
          <button
            onClick={onConnect}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              background: 'var(--accent-gradient)',
              color: 'white'
            }}
          >
            Connect Device
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-center py-8">
          No devices connected
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
      {/* Device Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bluetooth className="w-5 h-5 mr-2 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {device.name}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                <span className="text-green-500 text-sm">Connected</span>
              </div>
              <div className="flex items-center">
                <Battery className="w-4 h-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  {device.batteryLevel}%
                </span>
              </div>
              <div className="flex items-center">
                <Wifi className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-blue-500 text-sm">Synced</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="px-3 py-1 border rounded-lg text-sm transition-colors"
          style={{ 
            borderColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)'
          }}
        >
          Disconnect
        </button>
      </div>

      {/* Live Vitals Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Blood Pressure */}
        <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Blood Pressure</span>
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isReading ? '---' : `${liveVitals.systolicBP}/${liveVitals.diastolicBP}`}
          </div>
          {!isReading && liveVitals.systolicBP && (
            <div className="text-xs mt-1" style={{ 
              color: getVitalStatus(liveVitals.systolicBP, 'bp').color.replace('bg-', 'text-')
            }}>
              {getVitalStatus(liveVitals.systolicBP, 'bp').status}
            </div>
          )}
        </div>

        {/* Heart Rate */}
        <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Activity className="w-4 h-4 mr-2 text-red-500" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Heart Rate</span>
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isReading ? '---' : liveVitals.heartRate} 
            {!isReading && <span className="text-sm font-normal">bpm</span>}
          </div>
          {!isReading && liveVitals.heartRate && (
            <div className="text-xs mt-1" style={{ 
              color: getVitalStatus(liveVitals.heartRate, 'hr').color.replace('bg-', 'text-')
            }}>
              {getVitalStatus(liveVitals.heartRate, 'hr').status}
            </div>
          )}
        </div>

        {/* Blood Glucose */}
        <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Droplets className="w-4 h-4 mr-2 text-blue-500" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Blood Glucose</span>
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isReading ? '---' : liveVitals.bloodGlucose}
            {!isReading && <span className="text-sm font-normal">mg/dL</span>}
          </div>
          {!isReading && liveVitals.bloodGlucose && (
            <div className="text-xs mt-1" style={{ 
              color: getVitalStatus(liveVitals.bloodGlucose, 'glucose').color.replace('bg-', 'text-')
            }}>
              {getVitalStatus(liveVitals.bloodGlucose, 'glucose').status}
            </div>
          )}
        </div>

        {/* Body Temperature */}
        <div style={{ background: 'var(--bg-tertiary)' }} className="rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Thermometer className="w-4 h-4 mr-2 text-yellow-500" />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Temperature</span>
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isReading ? '---' : liveVitals.bodyTemp?.toFixed(1)}
            {!isReading && <span className="text-sm font-normal">°C</span>}
          </div>
          {!isReading && liveVitals.bodyTemp && (
            <div className="text-xs mt-1" style={{ 
              color: getVitalStatus(liveVitals.bodyTemp, 'temp').color.replace('bg-', 'text-')
            }}>
              {getVitalStatus(liveVitals.bodyTemp, 'temp').status}
            </div>
          )}
        </div>
      </div>

      {/* Health Meters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          WHO Health Standards Comparison
        </h4>
        
        {liveVitals.systolicBP && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Blood Pressure</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {liveVitals.systolicBP}/{liveVitals.diastolicBP} mmHg
              </span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)' }} className="w-full rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getVitalStatus(liveVitals.systolicBP, 'bp').color}`}
                style={{ width: `${Math.min((liveVitals.systolicBP / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {liveVitals.heartRate && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Heart Rate</span>
              <span style={{ color: 'var(--text-primary)' }}>{liveVitals.heartRate} bpm</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)' }} className="w-full rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getVitalStatus(liveVitals.heartRate, 'hr').color}`}
                style={{ width: `${Math.min((liveVitals.heartRate / 150) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {liveVitals.bloodGlucose && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Blood Glucose</span>
              <span style={{ color: 'var(--text-primary)' }}>{liveVitals.bloodGlucose} mg/dL</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)' }} className="w-full rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getVitalStatus(liveVitals.bloodGlucose, 'glucose').color}`}
                style={{ width: `${Math.min((liveVitals.bloodGlucose / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isReading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm" 
               style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            <div className="w-3 h-3 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2" />
            Reading vitals...
          </div>
        </div>
      )}
    </div>
  );
};

export default BluetoothDashboard;