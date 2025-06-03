'use client';

import { createContext, useContext, useState, useCallback } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';
import type { SessionObj } from '@nartix/next-security/src';

interface SessionContextValue {
  session: SessionObj | null;
  setSession: (session: SessionObj | null) => void;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({
  initialSession,
  children,
}: {
  initialSession: SessionObj | null;
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState(initialSession || null);
  const [loading, setLoading] = useState(false);
  // const pathname = usePathname();
  // const searchParams = useSearchParams();

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/auth/session?${new URLSearchParams({
          ts: Date.now().toString(),
        })}`
      );
      const data = await res.json();
      setSession(data?.user ? data : null);
    } finally {
      setLoading(false);
    }
  }, []);

  // will be called on every page change on client side
  // useEffect(() => {
  //   refreshSession();
  // }, [pathname, searchParams, refreshSession]);

  return <SessionContext.Provider value={{ session, setSession, loading, refreshSession }}>{children}</SessionContext.Provider>;
};
