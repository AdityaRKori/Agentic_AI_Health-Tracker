import React, { useState, useCallback } from 'react';
import { Upload, FileImage, AlertTriangle, CheckCircle, Eye, Plus } from 'lucide-react';
import { getAIProvider } from '../services/aiService';
import { UserProfile } from '../types';

interface ImageAnalysisProps {
  userProfile: UserProfile;
  onAddToRecord?: (analysis: any) => void;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ userProfile, onAddToRecord }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [imageType, setImageType] = useState<string>('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Determine image type
      const fileName = file.name.toLowerCase();
      if (fileName.includes('chest') || fileName.includes('lung')) {
        setImageType('chest-xray');
      } else if (fileName.includes('skin') || fileName.includes('lesion')) {
        setImageType('skin-lesion');
      } else if (fileName.includes('mri')) {
        setImageType('mri');
      } else if (fileName.includes('knee') || fileName.includes('joint')) {
        setImageType('joint');
      } else {
        setImageType('general');
      }
    }
  }, []);

  const analyzeImage = async () => {
    if (!selectedFile || !imagePreview) return;
    
    setLoading(true);
    try {
      // Simulate ML model analysis
      const mockFindings = {
        'chest-xray': [
          { condition: 'Normal', probability: 0.65 },
          { condition: 'Pneumonia', probability: 0.25 },
          { condition: 'Tuberculosis', probability: 0.10 }
        ],
        'skin-lesion': [
          { condition: 'Benign Nevus', probability: 0.70 },
          { condition: 'Seborrheic Keratosis', probability: 0.20 },
          { condition: 'Melanoma', probability: 0.10 }
        ],
        'mri': [
          { condition: 'Normal', probability: 0.60 },
          { condition: 'Mild Degeneration', probability: 0.30 },
          { condition: 'Herniation', probability: 0.10 }
        ],
        'joint': [
          { condition: 'Normal', probability: 0.55 },
          { condition: 'Osteoarthritis', probability: 0.35 },
          { condition: 'Fracture', probability: 0.10 }
        ],
        'general': [
          { condition: 'Normal', probability: 0.80 },
          { condition: 'Abnormality Detected', probability: 0.20 }
        ]
      };

      const findings = mockFindings[imageType as keyof typeof mockFindings] || mockFindings.general;
      const topFinding = findings[0];
      
      const aiProvider = getAIProvider(userProfile.apiProvider);
      const prompt = `You are an expert AI medical imaging assistant. Analyze this ${imageType} image.

**CRITICAL SAFETY NOTICE**: This is an AI-powered analysis and NOT a medical diagnosis. Always consult qualified healthcare professionals.

Based on the preliminary ML model finding of "${topFinding.condition}" with ${(topFinding.probability * 100).toFixed(1)}% confidence:

1. **Visual Analysis**: Describe what visual indicators in a ${imageType} image might suggest ${topFinding.condition}
2. **Medical Context**: Explain what ${topFinding.condition} means in simple terms
3. **Causes & Risk Factors**: What typically causes this condition
4. **Prevention**: WHO-recommended prevention strategies
5. **Next Steps**: Clear, safe recommendations including consulting healthcare professionals

Age factor: ${userProfile.age} years old
Location: ${userProfile.city}, ${userProfile.country}

Format your response with clear sections and emphasize the importance of professional medical consultation.`;

      const analysisResult = await aiProvider.generateHealthReport(prompt, userProfile.apiKey);
      setAnalysis(analysisResult);
      
    } catch (error) {
      setAnalysis('Analysis failed. Please check your API configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToHealthRecord = () => {
    if (onAddToRecord && analysis) {
      onAddToRecord({
        type: imageType,
        analysis,
        date: new Date().toISOString(),
        filename: selectedFile?.name
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 rounded-2xl overflow-hidden h-48 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/background.jpg)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-primary)/30, var(--accent-secondary)/30)' }} />
        <div className="relative z-10 p-8 h-full flex items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Medical Image Analysis</h1>
            <p className="text-white/90">AI-powered analysis of X-rays, MRI scans, and medical images</p>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6 max-w-md w-full border" 
               style={{ borderColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Medical Files Only
              </h2>
            </div>
            
            <div className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              <p className="mb-4">
                Please only upload legitimate medical images such as:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>X-ray images (chest, bone, dental)</li>
                <li>MRI and CT scans</li>
                <li>Skin lesion photographs</li>
                <li>DICOM medical files</li>
                <li>Medical reports in PDF format</li>
              </ul>
              <p className="mt-4 text-yellow-400 text-sm">
                ⚠️ This tool is for educational purposes only and does not provide medical diagnosis.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-3 px-4 rounded-lg font-semibold transition-colors"
                style={{ 
                  background: 'var(--accent-gradient)',
                  color: 'white'
                }}
              >
                I Understand - Proceed
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="px-4 py-3 border rounded-lg transition-colors"
                style={{ 
                  borderColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* File Upload */}
          <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Upload Medical Image
            </h3>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-purple-500"
                 style={{ borderColor: 'var(--bg-tertiary)' }}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.dcm,.dicom"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Click to upload medical image
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Supports: JPEG, PNG, PDF, DICOM files
                </p>
              </label>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-center">
                  <FileImage className="w-5 h-5 mr-2" style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedFile.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {imageType}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Image Preview
              </h3>
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Medical image preview"
                  className="w-full h-64 object-contain rounded-lg"
                  style={{ background: 'var(--bg-tertiary)' }}
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs"
                     style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                  {imageType.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              
              <button
                onClick={analyzeImage}
                disabled={loading}
                className="w-full mt-4 py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50"
                style={{ 
                  background: 'var(--accent-gradient)',
                  color: 'white'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Analyzing Image...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Analyze Image
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analysis ? (
            <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Analysis Results
                </h3>
                {onAddToRecord && (
                  <button
                    onClick={addToHealthRecord}
                    className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                    style={{ 
                      background: 'var(--accent-gradient)',
                      color: 'white'
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Health Record
                  </button>
                )}
              </div>
              
              <div className="prose max-w-none">
                <div 
                  className="leading-relaxed space-y-4"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {analysis.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h4 key={index} className="text-lg font-semibold mt-4 mb-2" 
                            style={{ color: 'var(--text-primary)' }}>
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    if (line.includes('CRITICAL SAFETY NOTICE') || line.includes('NOT a medical diagnosis')) {
                      return (
                        <div key={index} className="bg-red-900/30 border-l-4 border-red-500 p-3 my-2">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-red-200">{line}</span>
                          </div>
                        </div>
                      );
                    }
                    return line.trim() ? (
                      <p key={index} className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {line}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-secondary)' }} className="rounded-lg p-6">
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No Analysis Yet
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Upload a medical image to get started with AI-powered analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;