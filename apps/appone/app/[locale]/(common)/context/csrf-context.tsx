'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

// Define the type for the CSRF token
type CSRFContextType = {
  CSRFToken: string | null;
  setCSRFToken: (token: string | null) => void;
};

// Create the CSRF context with a default value of null
const CSRFContext = createContext<CSRFContextType | null>(null);

// Custom hook for consuming the CSRF context
export function useCSRFToken(): CSRFContextType {
  const context = useContext(CSRFContext);
  if (context === null) {
    throw new Error('useCSRFToken must be used within a CSRFProvider');
  }
  return context;
}

// Provider component for the CSRF context
interface CSRFProviderProps {
  initialCSRFToken: string | null;
  children: ReactNode;
}

export function CSRFProvider({ initialCSRFToken, children }: CSRFProviderProps) {
  const [CSRFToken, setCSRFToken] = useState(initialCSRFToken || null);
  return <CSRFContext.Provider value={{ CSRFToken, setCSRFToken }}>{children}</CSRFContext.Provider>;
}
