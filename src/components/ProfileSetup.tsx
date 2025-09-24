import React, { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { UserProfile } from '../contexts/ProfileContext';
import { User, MapPin, AlertTriangle, Dna, Key } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil'
];

const INDIAN_CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish',
  'Sesame', 'Dust mites', 'Pollen', 'Pet dander'
];

const GENETIC_MARKERS = [
  'Diabetes (Type 2)', 'Heart Disease', 'High Blood Pressure', 'High Cholesterol',
  'Obesity', 'Cancer', 'Alzheimer\'s', 'Osteoporosis'
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    allergies: [],
    geneticMarkers: [],
    healthNotes: ''
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const profile: UserProfile = {
        age: formData.age!,
        gender: formData.gender!,
        height: formData.height!,
        weight: formData.weight!,
        country: formData.country!,
        city: formData.city!,
        allergies: formData.allergies!,
        geneticMarkers: formData.geneticMarkers!,
        healthNotes: formData.healthNotes!
      };
      updateProfile(profile);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age && formData.gender && formData.height && formData.weight;
      case 2:
        return formData.country && formData.city;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/app-icon.png" alt="AI Agentic" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-white">AI Agentic</h1>
          </div>
          <p className="text-gray-300">Personalized Health Tracker</p>
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i <= step ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center text-white mb-4">
              <User className="mr-2" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="170"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="70"
                />
              </div>
            </div>

            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
              <p className="text-blue-200 text-sm">
                🔒 Your data is stored only on your device and never sent to our servers.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center text-white mb-4">
              <MapPin className="mr-2" />
              <h2 className="text-xl font-semibold">Location</h2>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Country</label>
              <select
                value={formData.country || ''}
                onChange={(e) => setFormData({...formData, country: e.target.value, city: ''})}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">City</label>
              {formData.country === 'India' ? (
                <select
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
                  placeholder="Enter your city"
                />
              )}
            </div>

            <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30">
              <p className="text-green-200 text-sm">
                🌍 Location helps us provide region-specific dietary recommendations and environmental health insights.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center text-white mb-4">
              <AlertTriangle className="mr-2" />
              <h2 className="text-xl font-semibold">Allergies & Health Notes</h2>
              <span className="ml-2 text-sm text-gray-400">(Optional)</span>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Known Allergies</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {COMMON_ALLERGIES.map(allergy => (
                  <label key={allergy} className="flex items-center text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allergies?.includes(allergy) || false}
                      onChange={() => setFormData({
                        ...formData,
                        allergies: toggleArrayItem(formData.allergies || [], allergy)
                      })}
                      className="mr-2 rounded"
                    />
                    {allergy}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Additional Health Notes</label>
              <textarea
                value={formData.healthNotes || ''}
                onChange={(e) => setFormData({...formData, healthNotes: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 h-24"
                placeholder="Any medications, conditions, or health concerns..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;