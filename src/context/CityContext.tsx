'use client';

import type { City } from '@/lib/types';
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

type CityContextType = {
  cities: City[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<City[]>([{ id: 'all', name: 'All Cities', enabled: true }]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCities([{ id: 'all', name: 'All Cities', enabled: true }, ...data.filter((c: City) => c.enabled)]);
        }
      } catch (e) {
        console.error('Failed to load cities', e);
      }
    };
    fetchCities();
  }, []);

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
