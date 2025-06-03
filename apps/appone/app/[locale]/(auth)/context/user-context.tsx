'use client';

import { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  username: string;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ initialUser, children }: { initialUser: User | null; children: React.ReactNode }) => {
  const [user, setUser] = useState(initialUser || null);

  // will be called on every page change on client side
  // useEffect(() => {
  //   refreshSession();
  // }, [pathname, searchParams, refreshSession]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
