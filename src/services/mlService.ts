import { UserProfile } from '../contexts/ProfileContext';

export interface RiskPrediction {
  disease: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  score: number;
  factors: string[];
}

export interface ImageAnalysisResult {
  type: 'chest-xray' | 'skin-lesion' | 'mri' | 'ct-scan';
  predictions: Array<{
    condition: string;
    confidence: number;
  }>;
  topPrediction: {
    condition: string;
    confidence: number;
  };
  visualIndicators: string[];
}

// BMI Calculation
export const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Risk Prediction Models (Rule-based simulation)
export const calculateRiskPredictions = (
  vitals: any,
  profile: UserProfile,
  bmi: number
): RiskPrediction[] => {
  const predictions: RiskPrediction[] = [];

  // Diabetes Risk
  let diabetesScore = 0;
  const diabetesFactors: string[] = [];
  
  if (vitals.bloodGlucose > 125) {
    diabetesScore += 40;
    diabetesFactors.push('Elevated fasting glucose');
  }
  if (bmi > 25) {
    diabetesScore += 25;
    diabetesFactors.push('Overweight BMI');
  }
  if (profile.age > 45) {
    diabetesScore += 20;
    diabetesFactors.push('Age over 45');
  }
  if (profile.geneticMarkers?.includes('Diabetes (Type 2)')) {
    diabetesScore += 30;
    diabetesFactors.push('Family history');
  }

  predictions.push({
    disease: 'Type 2 Diabetes',
    riskLevel: diabetesScore > 60 ? 'High' : diabetesScore > 30 ? 'Medium' : 'Low',
    score: Math.min(diabetesScore, 95),
    factors: diabetesFactors
  });

  // Cardiovascular Disease Risk
  let cvdScore = 0;
  const cvdFactors: string[] = [];

  if (vitals.systolicBP > 130) {
    cvdScore += 30;
    cvdFactors.push('Elevated blood pressure');
  }
  if (vitals.cholesterol > 200) {
    cvdScore += 25;
    cvdFactors.push('High cholesterol');
  }
  if (profile.age > 50) {
    cvdScore += 20;
    cvdFactors.push('Age factor');
  }
  if (bmi > 30) {
    cvdScore += 20;
    cvdFactors.push('Obesity');
  }
  if (profile.geneticMarkers?.includes('Heart Disease')) {
    cvdScore += 35;
    cvdFactors.push('Family history');
  }

  predictions.push({
    disease: 'Cardiovascular Disease',
    riskLevel: cvdScore > 65 ? 'High' : cvdScore > 35 ? 'Medium' : 'Low',
    score: Math.min(cvdScore, 95),
    factors: cvdFactors
  });

  // Hypertension Risk
  let htnScore = 0;
  const htnFactors: string[] = [];

  if (vitals.systolicBP > 120 || vitals.diastolicBP > 80) {
    htnScore += 40;
    htnFactors.push('Elevated blood pressure readings');
  }
  if (bmi > 25) {
    htnScore += 20;
    htnFactors.push('Excess weight');
  }
  if (profile.age > 40) {
    htnScore += 15;
    htnFactors.push('Age factor');
  }
  if (profile.geneticMarkers?.includes('High Blood Pressure')) {
    htnScore += 30;
    htnFactors.push('Genetic predisposition');
  }

  predictions.push({
    disease: 'Hypertension',
    riskLevel: htnScore > 60 ? 'High' : htnScore > 30 ? 'Medium' : 'Low',
    score: Math.min(htnScore, 95),
    factors: htnFactors
  });

  return predictions;
};

// Image Analysis Simulation
export const analyzeImage = async (
  file: File,
  analysisType: 'chest-xray' | 'skin-lesion' | 'mri' | 'ct-scan'
): Promise<ImageAnalysisResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const results: Record<string, any> = {
    'chest-xray': {
      predictions: [
        { condition: 'Normal', confidence: 0.65 },
        { condition: 'Pneumonia', confidence: 0.20 },
        { condition: 'Tuberculosis', confidence: 0.10 },
        { condition: 'Lung Cancer', confidence: 0.05 }
      ],
      visualIndicators: [
        'Clear lung fields visible',
        'Normal heart size and position',
        'No obvious consolidation patterns'
      ]
    },
    'skin-lesion': {
      predictions: [
        { condition: 'Benign Nevus', confidence: 0.70 },
        { condition: 'Melanoma', confidence: 0.15 },
        { condition: 'Basal Cell Carcinoma', confidence: 0.10 },
        { condition: 'Seborrheic Keratosis', confidence: 0.05 }
      ],
      visualIndicators: [
        'Regular borders observed',
        'Uniform coloration',
        'Symmetrical appearance'
      ]
    },
    'mri': {
      predictions: [
        { condition: 'Normal', confidence: 0.60 },
        { condition: 'Herniated Disc', confidence: 0.25 },
        { condition: 'Arthritis', confidence: 0.10 },
        { condition: 'Tumor', confidence: 0.05 }
      ],
      visualIndicators: [
        'Normal tissue contrast',
        'No obvious abnormalities',
        'Proper alignment visible'
      ]
    },
    'ct-scan': {
      predictions: [
        { condition: 'Normal', confidence: 0.55 },
        { condition: 'Fracture', confidence: 0.30 },
        { condition: 'Inflammation', confidence: 0.10 },
        { condition: 'Mass', confidence: 0.05 }
      ],
      visualIndicators: [
        'Bone density appears normal',
        'No obvious fracture lines',
        'Soft tissue appears intact'
      ]
    }
  };

  const result = results[analysisType];
  const topPrediction = result.predictions[0];

  return {
    type: analysisType,
    predictions: result.predictions,
    topPrediction,
    visualIndicators: result.visualIndicators
  };
};

// Validate if uploaded file is a medical image
export const validateMedicalImage = async (file: File): Promise<{
  isValid: boolean;
  detectedType: 'chest-xray' | 'skin-lesion' | 'mri' | 'ct-scan' | 'unknown';
  confidence: number;
}> => {
  // Simulate AI validation
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple simulation based on filename and size
  const filename = file.name.toLowerCase();
  let detectedType: any = 'unknown';
  let confidence = 0.5;

  if (filename.includes('xray') || filename.includes('chest')) {
    detectedType = 'chest-xray';
    confidence = 0.85;
  } else if (filename.includes('skin') || filename.includes('lesion')) {
    detectedType = 'skin-lesion';
    confidence = 0.80;
  } else if (filename.includes('mri')) {
    detectedType = 'mri';
    confidence = 0.90;
  } else if (filename.includes('ct') || filename.includes('scan')) {
    detectedType = 'ct-scan';
    confidence = 0.85;
  } else {
    // Random assignment for demo
    const types = ['chest-xray', 'skin-lesion', 'mri', 'ct-scan'];
    detectedType = types[Math.floor(Math.random() * types.length)];
    confidence = 0.60 + Math.random() * 0.25;
  }

  return {
    isValid: confidence > 0.6,
    detectedType,
    confidence
  };
};