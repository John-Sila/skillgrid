import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from './authService';
import { UserRole, TierLevel } from '../../shared/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userRole: UserRole;
  userInterests: string[];
  providerProfile: {
    tier: TierLevel;
    category: any;
    services: string[];
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsVerification: boolean;
  setUserRole: (role: UserRole) => void;
  setUserInterests: (interests: string[]) => void;
  setProviderProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        if (!firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === 'password') {
          setNeedsVerification(true);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setNeedsVerification(false);
        const userData = await authService.getUserProfile(firebaseUser.uid);
        
        if (userData) {
          setUserRole(userData.role);
          setUserInterests(userData.interests || []);
          if (userData.role === 'provider') {
            setProviderProfile({
              tier: userData.tier,
              category: userData.category,
              services: userData.services || []
            });
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setNeedsVerification(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      userInterests, 
      providerProfile, 
      isLoading, 
      isAuthenticated, 
      needsVerification,
      setUserRole,
      setUserInterests,
      setProviderProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
