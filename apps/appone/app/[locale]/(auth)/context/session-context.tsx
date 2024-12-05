'use client';

import React, { createContext, useContext } from 'react';
import { SessionObj } from '@nartix/next-security';

const SessionContext = createContext<SessionObj | null>(null);

// Custom hook for consuming the context
export function useSession() {
  const context = useContext(SessionContext);
  // if (!context) {
  //   throw new Error('useSession must be used within a SessionProvider');
  // }
  return context;
}

// Provider component
export function SessionProvider({ value, children }: { value: SessionObj | null; children: React.ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
