import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredProfile, saveProfile } from '../services/storageService';

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  country: string;
  city: string;
  allergies: string[];
  geneticMarkers: string[];
  healthNotes: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (profile: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedProfile = getStoredProfile();
    if (storedProfile) {
      setProfile(storedProfile);
    }
  }, []);

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};