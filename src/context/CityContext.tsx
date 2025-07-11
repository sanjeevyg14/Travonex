'use client';

import type { City } from '@/lib/types';
import { fetchData } from '@/lib/api';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CityContextType = {
  cities: City[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<City[]>([{ id: 'all', name: 'All Cities', enabled: true }]);

  useEffect(() => {
    fetchData<City[]>('/api/reference/cities')
      .then(data => {
        setCities([{ id: 'all', name: 'All Cities', enabled: true }, ...(data || []).filter(c => c.enabled)]);
      })
      .catch(() => {
        setCities([{ id: 'all', name: 'All Cities', enabled: true }]);
      });
  }, []);

  const value = useMemo(
    () => ({
      cities,
      selectedCity,
      setSelectedCity,
    }),
    [cities, selectedCity]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
