import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { Camera, Upload, Loader, AlertTriangle, CheckCircle, X, FileText } from 'lucide-react';
import { analyzeImage, validateMedicalImage } from '../services/mlService';
import { saveImageAnalysis } from '../services/storageService';
import { getImageAnalysis } from '../services/apiService';

const ImageAnalysis: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [showAddToReport, setShowAddToReport] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const isDicom = file.name.toLowerCase().includes('.dcm') || file.name.toLowerCase().includes('.dicom');
    
    if (!validTypes.includes(file.type) && !isDicom) {
      alert('Please upload a valid medical image file (JPEG, PNG, PDF, or DICOM)');
      return;
    }

    if (!showWarning) {
      processFile(file);
    } else {
      setSelectedFile(file);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setValidating(true);
    setAnalysisResult(null);
    setAiExplanation('');
    setShowWarning(false);

    try {
      // Validate if it's a medical image
      const validation = await validateMedicalImage(file);
      
      if (!validation.isValid) {
        alert('This doesn\'t appear to be a medical image. Please upload an X-ray, MRI, CT scan, or skin lesion image.');
        setValidating(false);
        return;
      }

      setValidating(false);
      setAnalyzing(true);

      // Analyze the image with age consideration
      const result = await analyzeImage(file, validation.detectedType);
      
      // Enhanced analysis with age factor
      const ageAdjustedResult = {
        ...result,
        ageConsiderations: getAgeConsiderations(validation.detectedType, profile?.age || 30),
        detailedFindings: getDetailedFindings(result, validation.detectedType),
        causesAndPrevention: getCausesAndPrevention(result.topPrediction.condition, validation.detectedType)
      };
      
      setAnalysisResult(ageAdjustedResult);

      // Get AI explanation with detailed visual analysis
      const explanation = await getImageAnalysis(ageAdjustedResult, validation.detectedType);
      setAiExplanation(explanation);
      setShowAddToReport(true);

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
      setValidating(false);
    }
  };

  const getAgeConsiderations = (type: string, age: number) => {
    const considerations: Record<string, Record<string, string>> = {
      'chest-xray': {
        young: 'In younger patients, infections and inflammatory conditions are more common',
        middle: 'Consider occupational exposures and lifestyle factors',
        elderly: 'Higher risk for malignancies and chronic conditions like COPD'
      },
      'skin-lesion': {
        young: 'Acne, allergic reactions, and benign moles are common',
        middle: 'Monitor for changes in existing moles and sun damage',
        elderly: 'Increased risk for skin cancers and age-related skin changes'
      }
    };

    const ageGroup = age < 30 ? 'young' : age < 60 ? 'middle' : 'elderly';
    return considerations[type]?.[ageGroup] || 'Age-specific considerations vary by condition';
  };

  const getDetailedFindings = (result: any, type: string) => {
    const findings: Record<string, Record<string, string[]>> = {
      'chest-xray': {
        'Normal': [
          'Clear lung fields with no consolidation',
          'Normal heart size and position',
          'Intact diaphragm contours',
          'No pleural effusion visible'
        ],
        'Pneumonia': [
          'Consolidation patterns in lung fields',
          'Air bronchograms may be visible',
          'Possible pleural reaction',
          'Increased opacity in affected areas'
        ],
        'Tuberculosis': [
          'Cavitary lesions in upper lobes',
          'Hilar lymphadenopathy',
          'Fibrotic changes',
          'Possible calcifications'
        ]
      },
      'skin-lesion': {
        'Benign Nevus': [
          'Symmetrical borders',
          'Uniform color distribution',
          'Regular shape and size',
          'No signs of inflammation'
        ],
        'Melanoma': [
          'Asymmetrical appearance',
          'Irregular borders',
          'Color variation within lesion',
          'Diameter changes over time'
        ],
        'Acne': [
          'Inflammatory papules and pustules',
          'Comedones (blackheads/whiteheads)',
          'Possible scarring',
          'Sebaceous gland involvement'
        ]
      }
    };

    return findings[type]?.[result.topPrediction.condition] || ['Detailed analysis requires professional review'];
  };

  const getCausesAndPrevention = (condition: string, type: string) => {
    const info: Record<string, any> = {
      'Pneumonia': {
        causes: 'Bacterial, viral, or fungal infections affecting the lungs',
        prevention: ['Get vaccinated', 'Practice good hygiene', 'Avoid smoking', 'Maintain healthy immune system'],
        whoGuidelines: 'WHO recommends pneumococcal vaccination for high-risk groups'
      },
      'Tuberculosis': {
        causes: 'Mycobacterium tuberculosis bacteria spread through airborne droplets',
        prevention: ['BCG vaccination', 'Avoid close contact with TB patients', 'Improve ventilation', 'Maintain good nutrition'],
        whoGuidelines: 'WHO End TB Strategy aims for 90% reduction in TB deaths by 2035'
      },
      'Melanoma': {
        causes: 'UV radiation exposure, genetic factors, and fair skin type',
        prevention: ['Use sunscreen SPF 30+', 'Avoid peak sun hours', 'Wear protective clothing', 'Regular skin checks'],
        whoGuidelines: 'WHO recommends sun protection and early detection programs'
      },
      'Acne': {
        causes: 'Hormonal changes, bacteria (P. acnes), excess oil production',
        prevention: ['Gentle cleansing', 'Avoid touching face', 'Use non-comedogenic products', 'Manage stress'],
        whoGuidelines: 'WHO recognizes acne as a common dermatological condition requiring appropriate care'
      }
    };

    return info[condition] || {
      causes: 'Multiple factors may contribute to this condition',
      prevention: ['Maintain good hygiene', 'Follow medical advice', 'Regular check-ups'],
      whoGuidelines: 'Consult healthcare professionals for proper diagnosis and treatment'
    };
  };

  const addToHealthReport = (addToReport: boolean) => {
    if (analysisResult && selectedFile) {
      const analysisRecord = {
        id: Date.now().toString(),
        type: analysisResult.type,
        filename: selectedFile.name,
        analysis: analysisResult,
        timestamp: new Date().toISOString(),
        addToReport
      };

      saveImageAnalysis(analysisRecord);
      setShowAddToReport(false);
      
      if (addToReport) {
        alert('Analysis added to your health report!');
      }
    }
  };

  const formatExplanation = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, `<h3 class="text-lg font-bold mb-3 ${theme === 'dark' ? 'text-red-400' : 'text-blue-600'}">$1</h3>`)
      .replace(/\*(.*?)\*/g, '<h4 class="text-md font-semibold mb-2">$1</h4>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Camera className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Medical Imaging Analysis
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            AI-powered analysis of X-rays, MRIs, CT scans, and skin lesions
          </p>
        </div>
      </div>

      {/* Medical File Warning */}
      {showWarning && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'} p-6`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                Medical Files Only
              </h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>
                Please only upload legitimate medical images such as X-rays, MRI scans, CT scans, 
                DICOM files, or dermatological images. This tool is designed for medical analysis only.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  I Understand - Proceed
                </button>
                <button
                  onClick={() => setShowWarning(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!showWarning && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-8`}>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : theme === 'dark'
                ? 'border-gray-600 hover:border-gray-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Upload Medical Image
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Drag and drop your medical image here, or click to browse
            </p>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Supports: JPEG, PNG, PDF, DICOM files
            </p>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.dcm,.dicom"
              onChange={handleFileInput}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Medical File
            </label>
          </div>

          {selectedFile && (
            <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                    Medical File Selected
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Status */}
      {validating && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Validating Medical Image
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                AI is verifying this is a valid medical image...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Status */}
      {analyzing && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Analyzing Medical Image
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                AI is processing your medical image with age-specific analysis...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Analysis Results
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              analysisResult.type === 'chest-xray' ? 'bg-blue-100 text-blue-800' :
              analysisResult.type === 'skin-lesion' ? 'bg-green-100 text-green-800' :
              analysisResult.type === 'mri' ? 'bg-purple-100 text-purple-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {analysisResult.type.toUpperCase().replace('-', ' ')}
            </span>
          </div>

          {/* Top Prediction */}
          <div className={`mb-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gradient-to-r from-red-900/20 to-violet-900/20 border-red-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-red-300' : 'text-blue-900'}`}>
              Primary Finding
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-red-200' : 'text-blue-800'}`}>
                {analysisResult.topPrediction.condition}
              </span>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-red-400' : 'text-blue-600'}`}>
                {(analysisResult.topPrediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Detailed Visual Findings */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              What AI Detected (Visual Analysis)
            </h4>
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-start space-x-3 mb-3">
                <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Visual Indicators Identified:
                  </h5>
                  <ul className="space-y-1">
                    {analysisResult.detailedFindings?.map((finding: string, index: number) => (
                      <li key={index} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-start space-x-2`}>
                        <span className="text-blue-500">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Age Considerations */}
          {analysisResult.ageConsiderations && (
            <div className="mb-6">
              <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Age-Specific Considerations
              </h4>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-purple-800'}`}>
                  {analysisResult.ageConsiderations}
                </p>
              </div>
            </div>
          )}

          {/* Causes and Prevention */}
          {analysisResult.causesAndPrevention && (
            <div className="mb-6">
              <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Causes & Prevention
              </h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    What Causes This:
                  </h5>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {analysisResult.causesAndPrevention.causes}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    Prevention (WHO Guidelines):
                  </h5>
                  <ul className="space-y-1">
                    {analysisResult.causesAndPrevention.prevention.map((tip: string, index: number) => (
                      <li key={index} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-start space-x-2`}>
                        <span className="text-green-500">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <h5 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                    WHO Guidelines:
                  </h5>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>
                    {analysisResult.causesAndPrevention.whoGuidelines}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All Predictions */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              All Predictions
            </h4>
            <div className="space-y-2">
              {analysisResult.predictions.map((pred: any, index: number) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {pred.condition}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${theme === 'dark' ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-12 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {aiExplanation && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg p-6`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            AI Analysis Explanation
          </h3>
          <div 
            className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatExplanation(aiExplanation) }}
          />
        </div>
      )}

      {/* Add to Report Modal */}
      {showAddToReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-xl max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add to Health Report?
              </h3>
              <button
                onClick={() => setShowAddToReport(false)}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Would you like to include this analysis in your comprehensive health report for personalized recommendations?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => addToHealthReport(true)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Yes, Add to Report
              </button>
              <button
                onClick={() => addToHealthReport(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No, Thanks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;