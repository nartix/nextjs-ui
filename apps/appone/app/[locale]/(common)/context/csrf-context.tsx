'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { API_CSRF_TOKEN_URL } from '@/config/global-config';

type CSRFContextType = {
  CSRFToken: string | null;
  setCSRFToken: (token: string | null) => void;
};

const CSRFContext = createContext<CSRFContextType | null>(null);

export function useCSRFToken(): CSRFContextType {
  const context = useContext(CSRFContext);
  if (context === null) {
    throw new Error('useCSRFToken must be used within a CSRFProvider');
  }
  return context;
}

interface CSRFProviderProps {
  initialCSRFToken: string | null;
  children: ReactNode;
}

export function CSRFProvider({ initialCSRFToken, children }: CSRFProviderProps) {
  const [CSRFToken, setCSRFToken] = useState(initialCSRFToken || null);

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch(API_CSRF_TOKEN_URL);
        if (!response.ok) console.error('Failed to fetch CSRF token');

        const { token } = await response.json();
        setCSRFToken(token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    if (!CSRFToken) {
      fetchCSRFToken();
    }
  }, [CSRFToken]);

  return <CSRFContext.Provider value={{ CSRFToken, setCSRFToken }}>{children}</CSRFContext.Provider>;
}
