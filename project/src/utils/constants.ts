export const COUNTRIES = [
  'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil'
];

export const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'
];

export const EMERGENCY_NUMBERS = {
  'United States': '911',
  'India': '112',
  'United Kingdom': '999',
  'Canada': '911',
  'Australia': '000',
  'Germany': '112',
  'France': '112',
  'Japan': '119',
  'China': '120',
  'Brazil': '192'
};

export const WHO_STANDARDS = {
  bloodPressure: {
    normal: { systolic: [90, 120], diastolic: [60, 80] },
    elevated: { systolic: [120, 129], diastolic: [60, 80] },
    stage1: { systolic: [130, 139], diastolic: [80, 89] },
    stage2: { systolic: [140, 180], diastolic: [90, 120] },
    crisis: { systolic: 180, diastolic: 120 }
  },
  bloodGlucose: {
    normal: [70, 100],
    prediabetes: [100, 125],
    diabetes: 125,
    critical: { low: 60, high: 300 }
  },
  bmi: {
    underweight: 18.5,
    normal: [18.5, 24.9],
    overweight: [25, 29.9],
    obese: 30
  },
  heartRate: {
    normal: [60, 100],
    low: 60,
    high: 100
  }
};

export const DISEASES = {
  communicable: [
    'COVID-19', 'Tuberculosis', 'Malaria', 'HIV/AIDS', 'Influenza', 
    'Hepatitis B', 'Dengue', 'Chikungunya', 'Zika', 'Cholera'
  ],
  nonCommunicable: [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Stroke', 'Cancer',
    'COPD', 'Asthma', 'Kidney Disease', 'Obesity', 'Depression'
  ]
};