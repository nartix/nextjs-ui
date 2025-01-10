'use client';

import React, { createContext, useContext } from 'react';
import { SessionObj } from '@nartix/next-security';

const SessionContext = createContext<SessionObj | null>(null);

// Custom hook for consuming the context
export function useSession() {
  return useContext(SessionContext);
}

// Provider component
export function SessionProvider({ value, children }: { value: SessionObj | null; children: React.ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
