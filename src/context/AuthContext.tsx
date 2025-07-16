
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserSession } from '@/lib/types';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ redirectPath: string }>; 
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // On initial load, try to rehydrate the session from localStorage.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userSession');
      const storedToken = localStorage.getItem('authToken');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
        console.error("Failed to parse session from localStorage", error);
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
    } finally {
        setLoading(false);
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok && result.user && result.token) {
        // Save session and token to localStorage and update state
        localStorage.setItem('userSession', JSON.stringify(result.user));
        localStorage.setItem('authToken', result.token);
        setUser(result.user);
        setToken(result.token);
        return { redirectPath: result.redirectPath };
    } else {
        throw new Error(result.message || 'An unknown error occurred during login.');
    }
  };

  const logout = async () => {
    // Clear state and localStorage
    setUser(null);
    setToken(null);
    localStorage.removeItem('userSession');
    localStorage.removeItem('authToken');
    
    // Also call the server endpoint to clear any server-side session/cookie
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Failed to call logout API:", error);
    }

    // Use full page reload on logout to ensure all state is cleared and any sensitive data is removed.
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
