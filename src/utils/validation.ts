import { Vitals } from '../types';
import { WHO_STANDARDS, EMERGENCY_NUMBERS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  emergencyAlert?: {
    title: string;
    message: string;
    instructions: string[];
    emergencyNumber: string;
  };
}

export const validateVitals = (vitals: Partial<Vitals>, country: string): ValidationResult => {
  const warnings: string[] = [];
  let emergencyAlert;

  // Basic sanity checks
  if (vitals.systolicBP && vitals.systolicBP > 300) {
    warnings.push('Blood pressure reading seems unusually high. Please verify.');
  }
  
  if (vitals.bloodGlucose && vitals.bloodGlucose > 500) {
    warnings.push('Blood glucose reading seems unusually high. Please verify.');
  }

  if (vitals.heartRate && vitals.heartRate > 200) {
    warnings.push('Heart rate reading seems unusually high. Please verify.');
  }

  // Critical thresholds
  if (vitals.systolicBP && vitals.diastolicBP) {
    if (vitals.systolicBP > WHO_STANDARDS.bloodPressure.crisis.systolic || 
        vitals.diastolicBP > WHO_STANDARDS.bloodPressure.crisis.diastolic) {
      emergencyAlert = {
        title: 'Hypertensive Crisis Detected',
        message: 'Your blood pressure is in a dangerous range that requires immediate medical attention.',
        instructions: [
          'Sit down and remain calm',
          'Take deep, slow breaths',
          'Do not take additional blood pressure medication',
          'Call emergency services immediately'
        ],
        emergencyNumber: EMERGENCY_NUMBERS[country] || '112'
      };
    }
  }

  if (vitals.bloodGlucose) {
    if (vitals.bloodGlucose < WHO_STANDARDS.bloodGlucose.critical.low) {
      emergencyAlert = {
        title: 'Severe Hypoglycemia Detected',
        message: 'Your blood sugar is dangerously low.',
        instructions: [
          'Consume 15g of fast-acting carbohydrates immediately',
          'Examples: glucose tablets, fruit juice, or candy',
          'Wait 15 minutes and recheck blood sugar',
          'Call emergency services if symptoms persist'
        ],
        emergencyNumber: EMERGENCY_NUMBERS[country] || '112'
      };
    } else if (vitals.bloodGlucose > WHO_STANDARDS.bloodGlucose.critical.high) {
      emergencyAlert = {
        title: 'Severe Hyperglycemia Detected',
        message: 'Your blood sugar is dangerously high.',
        instructions: [
          'Check for ketones if possible',
          'Drink water to prevent dehydration',
          'Do not exercise',
          'Seek immediate medical attention'
        ],
        emergencyNumber: EMERGENCY_NUMBERS[country] || '112'
      };
    }
  }

  return {
    isValid: warnings.length === 0 && !emergencyAlert,
    warnings,
    emergencyAlert
  };
};

export const validateWeight = (weight: number): { isValid: boolean; warning?: string } => {
  if (weight > 500) {
    return { isValid: false, warning: 'Please enter a valid weight (maximum 500kg)' };
  }
  if (weight > 300) {
    return { isValid: false, warning: 'Weight seems unusually high. Please confirm and proceed.' };
  }
  return { isValid: true };
};

export const validateHeight = (height: number): { isValid: boolean; warning?: string } => {
  if (height > 300) {
    return { isValid: false, warning: 'Please enter a valid height (maximum 300cm)' };
  }
  if (height < 50) {
    return { isValid: false, warning: 'Please enter a valid height (minimum 50cm)' };
  }
  return { isValid: true };
};