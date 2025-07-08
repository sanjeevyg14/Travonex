'use client';

import type { City } from '@/lib/types';
import { cities as mockCities } from '@/lib/mock-data';
import React, { createContext, useContext, useState, useMemo } from 'react';

type CityContextType = {
  cities: City[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  // In a real app, this would be fetched from an API
  const cities = useMemo(() => ([{ id: 'all', name: 'All Cities', enabled: true }, ...mockCities.filter(c => c.enabled)]), []);

  const value = useMemo(() => ({
    cities,
    selectedCity,
    setSelectedCity,
  }), [cities, selectedCity]);

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
