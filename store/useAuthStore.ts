import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';

export type UserRole = 'student' | 'teacher' | 'admin';

interface AuthState {
  token: string | null;
  userId: string | null;
  userName: string;
  userMajor: string;
  userRole: UserRole;
  userStatus: string;
  studentId: string;
  isAuthenticated: boolean;
  login: (userId: string, token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      userName: 'Usuario',
      userMajor: '',
      userRole: 'student',
      userStatus: 'ACTIVO',
      studentId: 'N/A',
      isAuthenticated: false,

      login: (userId: string, token: string) => {
        set({ userId, token, isAuthenticated: true });
        get().fetchProfile();
      },

      logout: () => {
        set({
          token: null,
          userId: null,
          isAuthenticated: false,
          userName: 'Usuario',
          userMajor: '',
          userRole: 'student',
          userStatus: 'ACTIVO',
          studentId: 'N/A',
        });
      },

      updateToken: (token: string | null) => {
        set({ token });
      },

      fetchProfile: async () => {
        const { userId, token } = get();
        if (!userId) return;

        try {
          const res = await fetch(`${API_URL}/profiles/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();

          if (!res.ok) {
            console.error("Profile fetch error:", data);
            if (res.status === 401 || res.status === 403) {
                // Token is invalid or expired
                get().logout();
            }
            return;
          }

          set({
            userName: data.full_name || 'Usuario Desconocido',
            userMajor: data.major || 'Sin información',
            userStatus: data.status ? data.status.toUpperCase() : 'DESCONOCIDO',
            studentId: data.student_id || 'N/A',
            userRole: (data.role ? data.role.toLowerCase() : 'student') as UserRole,
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
