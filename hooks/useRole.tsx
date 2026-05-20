import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
export type { UserRole };

interface RoleContextType {
  role: UserRole;
  userName: string;
  userMajor: string;
  userId: string;
  userStatus: string;
  studentId: string;
  setRole: (role: UserRole) => void;
  setUserName: (name: string) => void;
  setUserMajor: (major: string) => void;
  isAuthenticated: boolean;
  login: (id: string, token: string, refreshToken?: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const role = useAuthStore(state => state.userRole);
  const userName = useAuthStore(state => state.userName);
  const userMajor = useAuthStore(state => state.userMajor);
  const userId = useAuthStore(state => state.userId) || '';
  const userStatus = useAuthStore(state => state.userStatus);
  const studentId = useAuthStore(state => state.studentId);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const fetchProfile = useAuthStore(state => state.fetchProfile);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProfile();
    }
  }, [isAuthenticated, userId]);

  const contextValue: RoleContextType = {
    role,
    userName,
    userMajor,
    userId,
    userStatus,
    studentId,
    setRole: (r) => useAuthStore.setState({ userRole: r }),
    setUserName: (n) => useAuthStore.setState({ userName: n }),
    setUserMajor: (m) => useAuthStore.setState({ userMajor: m }),
    isAuthenticated,
    login,
    logout
  };

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
