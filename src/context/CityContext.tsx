'use client';

import type { City } from '@/lib/types';
import { fetchData } from '@/lib/api';
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type CityContextType = {
  cities: City[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetchData<City[]>('/api/admin/cities')
      .then(data => {
        setCities([{ id: 'all', name: 'All Cities', enabled: true }, ...data.filter(c => c.enabled)]);
      })
      .catch(() => {
        setCities([{ id: 'all', name: 'All Cities', enabled: true }]);
      });

  const [cities, setCities] = useState<City[]>([{ id: 'all', name: 'All Cities', enabled: true }]);

  useEffect(() => {
    async function fetchCities() {
      try {
        const response = await fetch('/api/reference/cities');
        const data: City[] = await response.json();
        setCities([{ id: 'all', name: 'All Cities', enabled: true }, ...(data || []).filter(c => c.enabled)]);
      } catch (err) {
        console.error('Failed to fetch cities', err);
      }
    }
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
