import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '@/constants/Config';

export type UserRole = 'student' | 'teacher' | 'admin';

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
  login: (id: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('student');
  const [userName, setUserName] = useState('CARGANDO...');
  const [userMajor, setUserMajor] = useState('');
  const [userStatus, setUserStatus] = useState('ACTIVO');
  const [studentId, setStudentId] = useState('N/A');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profiles/${userId}`);
        const data = await res.json();

        if (!res.ok || data.error || data.detail) {
          console.error("Profile fetch error:", data);
          setUserName("Usuario");
          return;
        }

        setUserName(data.full_name || 'Usuario Desconocido');
        setUserMajor(data.major || 'Sin información');
        setUserStatus(data.status ? data.status.toUpperCase() : 'DESCONOCIDO');
        setStudentId(data.student_id || 'N/A');
        setRole(data.role ? data.role.toLowerCase() as UserRole : 'student');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserName('Usuario');
      }
    };
    fetchProfile();
  }, [isAuthenticated, userId]);

  const login = (id: string) => {
    setUserId(id);
    setIsAuthenticated(true);
  };
  const logout = () => {
    setIsAuthenticated(false);
    setUserId('');
  };

  return (
    <RoleContext.Provider value={{ 
      role, 
      userName, 
      userMajor, 
      userId, 
      userStatus,
      studentId,
      setRole, 
      setUserName,
      setUserMajor,
      isAuthenticated, 
      login, 
      logout 
    }}>
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
