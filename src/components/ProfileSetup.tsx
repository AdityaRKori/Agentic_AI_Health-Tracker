import React, { useState } from 'react';
import { User, MapPin, Heart, Key, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { COUNTRIES, INDIAN_CITIES } from '../utils/constants';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    allergies: [],
    geneticMarkers: [],
    apiProvider: 'openai'
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    if (profile.name && profile.age && profile.gender && profile.country && 
        profile.city && profile.height && profile.weight) {
      onComplete(profile as UserProfile);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ 
           background: 'var(--bg-primary)',
           color: 'var(--text-primary)'
         }}>
      <div className="w-full max-w-md">
        {/* App Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-purple-600 p-1">
            <img 
              src="/Gemini_Generated_Image_e74og5e74og5e74o.png" 
              alt="AI Agentic Health Tracker"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzFfMSkiLz4KPGC0ZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xXzEiIHgxPSIwIiB5MT0iMCIgeDI9IjgwIiB5Mj0iODAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0U3NEMzQyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM5QjU5QjYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            AI Agentic
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Personalized Health Tracker
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-red-500 to-purple-600"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          {step === 1 && (
            <div>
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-red-500" />
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profile.name || ''}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Age"
                    value={profile.age || ''}
                    onChange={(e) => updateProfile({ age: Number(e.target.value) })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                  <select
                    value={profile.gender || ''}
                    onChange={(e) => updateProfile({ gender: e.target.value as 'male' | 'female' })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="" className="bg-gray-800">Select Gender</option>
                    <option value="male" className="bg-gray-800">Male</option>
                    <option value="female" className="bg-gray-800">Female</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={profile.height || ''}
                    onChange={(e) => updateProfile({ height: Number(e.target.value) })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={profile.weight || ''}
                    onChange={(e) => updateProfile({ weight: Number(e.target.value) })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Waist (cm)"
                    value={profile.waist || ''}
                    onChange={(e) => updateProfile({ waist: Number(e.target.value) })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Hip (cm)"
                    value={profile.hip || ''}
                    onChange={(e) => updateProfile({ hip: Number(e.target.value) })}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                <h2 className="text-lg font-semibold">Location</h2>
              </div>
              
              <div className="space-y-4">
                <select
                  value={profile.country || ''}
                  onChange={(e) => updateProfile({ country: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="" className="bg-gray-800">Select Country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country} className="bg-gray-800">{country}</option>
                  ))}
                </select>

                {profile.country === 'India' ? (
                  <select
                    value={profile.city || ''}
                    onChange={(e) => updateProfile({ city: e.target.value, state: e.target.value.includes('Bangalore') ? 'Karnataka' : e.target.value.includes('Mumbai') ? 'Maharashtra' : 'Unknown' })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="" className="bg-gray-800">Select City</option>
                    {INDIAN_CITIES.map(city => (
                      <option key={city} value={city} className="bg-gray-800">{city}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="City"
                    value={profile.city || ''}
                    onChange={(e) => updateProfile({ city: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                )}

                <input
                  type="text"
                  placeholder="State/Province"
                  value={profile.state || ''}
                  onChange={(e) => updateProfile({ state: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center mb-4">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                <h2 className="text-lg font-semibold">Health Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Allergies (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Milk', 'Eggs',
                      'Soy', 'Wheat/Gluten', 'Sesame', 'Sulphites', 'Latex', 'Dust Mites',
                      'Pollen', 'Pet Dander', 'Mold', 'Penicillin', 'Aspirin', 'Iodine'
                    ].map(allergy => (
                      <label key={allergy} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={profile.allergies?.includes(allergy) || false}
                          onChange={(e) => {
                            const currentAllergies = profile.allergies || [];
                            if (e.target.checked) {
                              updateProfile({ allergies: [...currentAllergies, allergy] });
                            } else {
                              updateProfile({ allergies: currentAllergies.filter(a => a !== allergy) });
                            }
                          }}
                          className="mr-2 rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-gray-300">{allergy}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Other allergies (separate with commas)"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        const otherAllergies = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                        const currentAllergies = profile.allergies || [];
                        updateProfile({ allergies: [...currentAllergies, ...otherAllergies] });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Genetic Markers (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Family history of diabetes, hypertension"
                    value={profile.geneticMarkers?.join(', ') || ''}
                    onChange={(e) => updateProfile({ 
                      geneticMarkers: e.target.value.split(',').map(g => g.trim()).filter(g => g) 
                    })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  💡 All data is stored securely on your device and never shared.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && (!profile.name || !profile.age || !profile.gender || !profile.height || !profile.weight)}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;