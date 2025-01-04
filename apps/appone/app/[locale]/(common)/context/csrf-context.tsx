'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Define the type for the CSRF token
type CSRFContextType = string | null;

// Create the CSRF context with a default value of null
const CSRFContext = createContext<CSRFContextType>(null);

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
  value: CSRFContextType;
  children: ReactNode;
}

export function CSRFProvider({ value, children }: CSRFProviderProps) {
  return <CSRFContext.Provider value={value}>{children}</CSRFContext.Provider>;
}
