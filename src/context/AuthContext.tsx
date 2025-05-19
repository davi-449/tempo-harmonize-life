
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth, UseAuthResult } from '@/hooks/useSupabaseAuth';

const AuthContext = createContext<UseAuthResult | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useSupabaseAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
