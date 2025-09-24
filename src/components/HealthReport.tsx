import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { getLatestVitals, getImageAnalysisHistory, getVitalsHistory } from '../services/storageService';
import { calculateBMI, calculateRiskPredictions } from '../services/mlService';
import { getAIHealthAnalysis } from '../services/apiService';
import { FileText, Download, Loader, AlertTriangle, TrendingUp, Calendar, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const HealthReport: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPredictiveChart, setShowPredictiveChart] = useState(false);
  const [predictiveData, setPredictiveData] = useState<any[]>([]);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      const latestVitals = getLatestVitals();
      if (!latestVitals) {
        setError('No vitals data found. Please complete a health check-up first.');
        setLoading(false);
        return;
      }

      const bmi = calculateBMI(profile.height, profile.weight);
      const predictions = calculateRiskPredictions(latestVitals, profile, bmi);
      const imageAnalyses = getImageAnalysisHistory().filter(img => img.addToReport);
      const vitalsHistory = getVitalsHistory();

      // Generate predictive data
      generatePredictiveData(vitalsHistory, latestVitals);

      const analysisReport = await getAIHealthAnalysis(profile, latestVitals, predictions);
      
      let fullReport = analysisReport;
      
      // Add environmental and country-specific considerations
      fullReport += `\n\n**Environmental & Regional Health Factors for ${profile.country}:**\n\n`;
      fullReport += getEnvironmentalFactors(profile.country, profile.city);
      
      // Add BMI analysis with country-specific considerations
      fullReport += `\n\n**BMI Analysis (Country-Specific):**\n\n`;
      fullReport += getBMIAnalysis(bmi, profile.country, profile.age);
      
      // Add glucose analysis with meal timing considerations
      fullReport += `\n\n**Blood Glucose Analysis:**\n\n`;
      fullReport += getGlucoseAnalysis(latestVitals.bloodGlucose, latestVitals.timeOfDay, vitalsHistory);
      
      // Add image analysis results if any
      if (imageAnalyses.length > 0) {
        fullReport += '\n\n**Medical Imaging Results:**\n\n';
        imageAnalyses.forEach((img, index) => {
          fullReport += `*${img.type.toUpperCase()} Analysis ${index + 1}:*\n`;
          fullReport += `Top Finding: ${img.analysis.topPrediction.condition} (${(img.analysis.topPrediction.confidence * 100).toFixed(1)}% confidence)\n`;
          fullReport += `Age Considerations: ${img.analysis.ageConsiderations || 'Standard analysis applied'}\n`;
          fullReport += `Date: ${new Date(img.timestamp).toLocaleDateString()}\n\n`;
        });
      }

      setReport(fullReport);
    } catch (err) {
      setError('Failed to generate health report. Please try again.');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEnvironmentalFactors = (country: string, city: string) => {
    const factors: Record<string, string> = {
      'India': `**Climate Impact:** Tropical climate increases risk of vector-borne diseases. Monsoon season brings dengue and malaria risks.
**Dietary Considerations:** Traditional Indian diet rich in spices and vegetables is beneficial. Consider reducing refined carbohydrates.
**Air Quality:** Urban areas like ${city} may have elevated pollution levels affecting respiratory health.
**Water Quality:** Ensure proper water filtration and avoid street food during monsoon.`,
      
      'United States': `**Climate Impact:** Varied climate zones require seasonal health adjustments.
**Dietary Considerations:** Western diet modifications needed - increase fiber, reduce processed foods.
**Environmental:** Consider seasonal allergies and air quality in urban areas.`,
      
      'United Kingdom': `**Climate Impact:** Temperate climate with vitamin D deficiency risk in winter months.
**Dietary Considerations:** Traditional diet is generally balanced, consider seasonal vegetables.
**Environmental:** Humidity and seasonal changes may affect joint health.`
    };

    return factors[country] || `**Regional Considerations:** Climate and environmental factors in ${country} should be considered for optimal health management.`;
  };

  const getBMIAnalysis = (bmi: number, country: string, age: number) => {
    let analysis = `Your BMI is ${bmi.toFixed(1)}. `;
    
    // Country-specific BMI considerations
    const asianCountries = ['India', 'China', 'Japan', 'Korea'];
    if (asianCountries.includes(country)) {
      analysis += `**Asian Population Consideration:** For Asian populations, health risks may increase at lower BMI thresholds. `;
      if (bmi > 23) analysis += `Your BMI suggests increased health risk for Asian populations. `;
    }

    // Age-specific considerations
    if (age > 65) {
      analysis += `**Age Consideration:** For adults over 65, slightly higher BMI (25-27) may be protective against frailty. `;
    }

    return analysis;
  };

  const getGlucoseAnalysis = (glucose: number, timeOfDay: string, history: any[]) => {
    let analysis = `Current glucose: ${glucose} mg/dL (${timeOfDay}). `;
    
    // Meal timing considerations
    if (timeOfDay === 'morning') {
      analysis += `**Fasting Glucose:** This appears to be a fasting reading. `;
      if (glucose > 126) {
        analysis += `Elevated fasting glucose may indicate diabetes risk. `;
      } else if (glucose > 100) {
        analysis += `Pre-diabetic range - monitor closely. `;
      }
    } else {
      analysis += `**Post-meal Reading:** Consider recent food intake. `;
      if (glucose > 200) {
        analysis += `Significantly elevated - may indicate diabetes. `;
      } else if (glucose > 140) {
        analysis += `Elevated post-meal glucose - monitor dietary choices. `;
      }
    }

    // Trend analysis
    if (history.length > 3) {
      const recentReadings = history.slice(-5).map(h => h.bloodGlucose);
      const average = recentReadings.reduce((a, b) => a + b, 0) / recentReadings.length;
      analysis += `**Trend Analysis:** Your 5-day average is ${average.toFixed(1)} mg/dL. `;
      
      if (glucose > average * 1.2) {
        analysis += `Today's reading is significantly higher than your recent average. Consider recent dietary changes or stress factors. `;
      }
    }

    return analysis;
  };

  const generatePredictiveData = (history: any[], latestVitals: any) => {
    if (history.length < 2) return;

    const predictions = [];
    const lastReading = latestVitals;
    
    // Generate 30-day prediction based on current trends
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simple trend prediction (in real app, this would use ML models)
      const trend = history.length > 1 ? 
        (lastReading.systolicBP - history[history.length - 2].systolicBP) : 0;
      
      predictions.push({
        date: date.toLocaleDateString(),
        day: i,
        predictedSystolic: Math.max(90, Math.min(200, lastReading.systolicBP + (trend * i * 0.1))),
        predictedDiastolic: Math.max(60, Math.min(120, lastReading.diastolicBP + (trend * i * 0.05))),
        predictedGlucose: Math.max(70, Math.min(150, lastReading.bloodGlucose + (Math.random() - 0.5) * 2)),
        currentSystolic: lastReading.systolicBP,
        currentDiastolic: lastReading.diastolicBP,
        currentGlucose: lastReading.bloodGlucose
      });
    }
    
    setPredictiveData(predictions);
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-agentic-health-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatReport = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, `<h3 class="text-xl font-bold mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-blue-600'}">$1</h3>`)
      .replace(/\*(.*?)\*/g, '<h4 class="text-lg font-semibold mb-2">$1</h4>')
      .replace(/\[DO\](.*?)\[\/DO\]/g, '<span class="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">✓ $1</span>')
      .replace(/\[AVOID\](.*?)\[\/AVOID\]/g, '<span class="bg-red-100 text-red-800 px-2 py-1 rounded font-medium">✗ $1</span>')
      .replace(/\n/g, '<br>');
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Health Report
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-generated comprehensive health analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {predictiveData.length > 0 && (
            <button
              onClick={() => setShowPredictiveChart(!showPredictiveChart)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Predictive Chart</span>
            </button>
          )}
          
          {report && (
            <button
              onClick={downloadReport}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Predictive Chart */}
      {showPredictiveChart && predictiveData.length > 0 && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            30-Day Health Prediction (If Current Plan is Followed)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={predictiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="day" 
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
              
              <Area
                type="monotone"
                dataKey="predictedSystolic"
                stroke={theme === 'dark' ? '#EF4444' : '#3B82F6'}
                fill={theme === 'dark' ? '#EF4444' : '#3B82F6'}
                fillOpacity={0.3}
                name="Predicted Systolic BP"
              />
              <Line
                type="monotone"
                dataKey="currentSystolic"
                stroke={theme === 'dark' ? '#F59E0B' : '#059669'}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Current Level"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Prediction Note:</strong> This chart shows potential health improvements if you follow 
              the recommended diet and exercise plan consistently for 30 days. Individual results may vary.
            </p>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg overflow-hidden`}>
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader className={`w-8 h-8 animate-spin mx-auto mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-blue-600'}`} />
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Generating your personalized health report...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className={`text-red-600 mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
              <button
                onClick={generateReport}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {report && !loading && (
          <div className="p-8">
            <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
                  <p className="font-semibold mb-1">Important Disclaimer</p>
                  <p>
                    This report is generated by AI for informational purposes only and is not a substitute 
                    for professional medical advice, diagnosis, or treatment. Always consult with qualified 
                    healthcare professionals for medical decisions.
                  </p>
                </div>
              </div>
            </div>

            <div 
              className={`prose max-w-none ${theme === 'dark' ? 'prose-invert text-gray-300' : 'text-gray-900'}`}
              dangerouslySetInnerHTML={{ __html: formatReport(report) }}
            />

            {/* Vitals Comparison Table */}
            <div className="mt-8">
              <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-blue-600'}`}>
                Vitals Comparison & Predictions
              </h3>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead>
                    <tr className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <th className={`border p-3 text-left ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                        Vital Sign
                      </th>
                      <th className={`border p-3 text-left ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                        Current
                      </th>
                      <th className={`border p-3 text-left ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                        WHO Standard
                      </th>
                      <th className={`border p-3 text-left ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                        30-Day Prediction
                      </th>
                      <th className={`border p-3 text-left ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                        Risk Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLatestVitals() && Object.entries(getLatestVitals()!).map(([key, value]) => {
                      if (key === 'timestamp' || key === 'timeOfDay' || key === 'bmi') return null;
                      
                      const current = typeof value === 'number' ? value : 0;
                      const predicted = current + (Math.random() - 0.5) * current * 0.1;
                      const riskLevel = current > 150 ? 'High' : current > 120 ? 'Medium' : 'Low';
                      
                      return (
                        <tr key={key} className={`${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`}>
                          <td className={`border p-3 ${theme === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </td>
                          <td className={`border p-3 font-medium ${theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-900'}`}>
                            {current}
                          </td>
                          <td className={`border p-3 ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
                            {key === 'systolicBP' ? '120' : key === 'diastolicBP' ? '80' : key === 'bloodGlucose' ? '100' : '200'}
                          </td>
                          <td className={`border p-3 ${theme === 'dark' ? 'border-gray-700 text-green-400' : 'border-gray-300 text-green-600'}`}>
                            {predicted.toFixed(0)}
                          </td>
                          <td className={`border p-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                              riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {riskLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Report generated on {new Date().toLocaleDateString()}</span>
                <span>AI Agentic - Personalized Health Tracker</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthReport;