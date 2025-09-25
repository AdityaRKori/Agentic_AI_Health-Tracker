import React, { useState, useEffect } from 'react';
import { UserProfile, Vitals, HealthHistory } from '../types';
import { Activity, Heart, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface HealthReportProps {
  userProfile: UserProfile;
  vitals: Vitals;
  healthHistory: HealthHistory[];
}

export const HealthReport: React.FC<HealthReportProps> = ({ userProfile, vitals, healthHistory }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateBMI = () => {
    const heightInM = userProfile.height / 100;
    return userProfile.weight / (heightInM * heightInM);
  };

  const getRiskLevel = (vital: string, value: number) => {
    switch (vital) {
      case 'systolicBP':
        if (value < 120) return { level: 'Low', color: 'text-green-500' };
        if (value < 140) return { level: 'Medium', color: 'text-yellow-500' };
        return { level: 'High', color: 'text-red-500' };
      case 'diastolicBP':
        if (value < 80) return { level: 'Low', color: 'text-green-500' };
        if (value < 90) return { level: 'Medium', color: 'text-yellow-500' };
        return { level: 'High', color: 'text-red-500' };
      case 'bloodGlucose':
        if (value < 100) return { level: 'Low', color: 'text-green-500' };
        if (value < 126) return { level: 'Medium', color: 'text-yellow-500' };
        return { level: 'High', color: 'text-red-500' };
      case 'cholesterol':
        if (value < 200) return { level: 'Low', color: 'text-green-500' };
        if (value < 240) return { level: 'Medium', color: 'text-yellow-500' };
        return { level: 'High', color: 'text-red-500' };
      default:
        return { level: 'Unknown', color: 'text-gray-500' };
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate AI report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bmi = calculateBMI();
      const mockReport = `
# Health Analysis Report

## Current Health Status
Based on your vitals and profile information, here's your comprehensive health assessment:

**BMI**: ${bmi.toFixed(1)} - ${bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}

## Risk Assessment
- **Hypertension Risk**: ${getRiskLevel('systolicBP', vitals.systolicBP).level}
- **Diabetes Risk**: ${getRiskLevel('bloodGlucose', vitals.bloodGlucose).level}
- **Cardiovascular Risk**: ${getRiskLevel('cholesterol', vitals.cholesterol).level}

## Recommendations

### Dietary Plan
Based on your location (${userProfile.city}, ${userProfile.country}), here are culturally appropriate meal suggestions:

**Day 1:**
- Breakfast: Oatmeal with local fruits
- Lunch: Grilled chicken with vegetables
- Dinner: Fish with quinoa and steamed broccoli

**Day 2:**
- Breakfast: Greek yogurt with nuts
- Lunch: Lentil soup with whole grain bread
- Dinner: Tofu stir-fry with brown rice

### Exercise Regimen
- **Cardio**: 30 minutes, 3 times per week
- **Strength Training**: 20 minutes, 2 times per week
- **Flexibility**: Daily stretching routine

## Next Steps
1. Monitor your vitals regularly
2. Follow the dietary recommendations
3. Maintain consistent exercise routine
4. Consult with healthcare provider for personalized advice
      `;
      
      setReport(mockReport);
    } catch (err) {
      setError('Failed to generate health report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [userProfile, vitals]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary text-text-primary p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            <span className="ml-4 text-lg">Generating your personalized health report...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-text-primary p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-500 mr-3" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={generateReport}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-text-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">Health Analysis Report</h1>
          <p className="text-text-secondary">
            Generated on {new Date().toLocaleDateString()} for {userProfile.name}
          </p>
        </div>

        {/* Current Vitals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Blood Pressure</p>
                <p className="text-xl font-semibold">{vitals.systolicBP}/{vitals.diastolicBP}</p>
              </div>
              <Heart className={`h-6 w-6 ${getRiskLevel('systolicBP', vitals.systolicBP).color}`} />
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Blood Glucose</p>
                <p className="text-xl font-semibold">{vitals.bloodGlucose} mg/dL</p>
              </div>
              <Activity className={`h-6 w-6 ${getRiskLevel('bloodGlucose', vitals.bloodGlucose).color}`} />
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Cholesterol</p>
                <p className="text-xl font-semibold">{vitals.cholesterol} mg/dL</p>
              </div>
              <TrendingUp className={`h-6 w-6 ${getRiskLevel('cholesterol', vitals.cholesterol).color}`} />
            </div>
          </div>
          
          <div className="bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">BMI</p>
                <p className="text-xl font-semibold">{calculateBMI().toFixed(1)}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Health Risk Assessment Table */}
        <div className="bg-secondary rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4">Health Risk Assessment</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-primary">Condition</th>
                  <th className="text-left py-2 text-text-primary">Current Reading</th>
                  <th className="text-left py-2 text-text-primary">Risk Level</th>
                  <th className="text-left py-2 text-text-primary">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-text-primary">Hypertension</td>
                  <td className="py-3 text-text-secondary">{vitals.systolicBP}/{vitals.diastolicBP} mmHg</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${getRiskLevel('systolicBP', vitals.systolicBP).color}`}>
                      {getRiskLevel('systolicBP', vitals.systolicBP).level}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">Monitor regularly, reduce sodium</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-text-primary">Diabetes</td>
                  <td className="py-3 text-text-secondary">{vitals.bloodGlucose} mg/dL</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${getRiskLevel('bloodGlucose', vitals.bloodGlucose).color}`}>
                      {getRiskLevel('bloodGlucose', vitals.bloodGlucose).level}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">Control carb intake, exercise regularly</td>
                </tr>
                <tr>
                  <td className="py-3 text-text-primary">Cardiovascular Disease</td>
                  <td className="py-3 text-text-secondary">{vitals.cholesterol} mg/dL</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${getRiskLevel('cholesterol', vitals.cholesterol).color}`}>
                      {getRiskLevel('cholesterol', vitals.cholesterol).level}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">Heart-healthy diet, regular cardio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="bg-secondary rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-accent mb-4">Detailed Analysis & Recommendations</h2>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
              {report}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={generateReport}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            Regenerate Report
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-secondary border border-border text-text-primary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;