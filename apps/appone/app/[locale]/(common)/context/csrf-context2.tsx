'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Helper function to parse cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // For SSR safety
  const cookies = document.cookie.split(';');
  console.log('test ========================', cookies);
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
};

type CSRFContextType = {
  getCSRFToken: () => string;
  //   setCSRFToken: (token: string) => void;
};

const CSRFContext = createContext<CSRFContextType | null>(null);

export function useCSRF(): CSRFContextType {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

interface CSRFProviderProps {
  children: ReactNode;
  cookieName: string;
}

export function CSRFProvider({ children, cookieName }: CSRFProviderProps) {
  const getCSRFToken = () => {
    const token = getCookie(cookieName); // Or 'SESSION' if that's your cookie name
    if (!token) {
      console.error('CSRF token not found in cookies');
      return '';
    }
    return token;
  };

  return <CSRFContext.Provider value={{ getCSRFToken }}>{children}</CSRFContext.Provider>;
}
