import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';

export type UserRole = 'student' | 'teacher' | 'admin';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string;
  userMajor: string;
  userRole: UserRole;
  userStatus: string;
  studentId: string;
  isAuthenticated: boolean;
  login: (userId: string, token: string, refreshToken?: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateToken: (token: string | null) => void;
  refreshSession: () => Promise<boolean>;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  isRefreshingPromise: Promise<boolean> | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      userId: null,
      userName: 'Usuario',
      userMajor: '',
      userRole: 'student',
      userStatus: 'ACTIVO',
      studentId: 'N/A',
      isAuthenticated: false,
      isRefreshingPromise: null,

      login: (userId: string, token: string, refreshToken?: string) => {
        set({ userId, token, refreshToken: refreshToken || null, isAuthenticated: true });
        get().fetchProfile();
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
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
          let data: any = {};
          try {
            const text = await res.text();
            console.log(`DEBUG: Fetch ${res.url} returned status ${res.status}. Body: ${text.substring(0, 100)}`);
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            console.error("Non-JSON response from server", e);
          }

          if (!res.ok) {
            if (res.status === 401) {
                console.log("DEBUG: Token expirado, iniciando refresh...");
                // Token is invalid or expired, try to refresh
                const refreshed = await get().refreshSession();
                if (refreshed) {
                    console.log("DEBUG: Refresh exitoso, reintentando fetchProfile");
                    return get().fetchProfile(); // Retry profile fetch
                } else {
                    console.warn("DEBUG: La sesión ha expirado y no se pudo renovar. Cerrando sesión...");
                    get().logout();
                }
            } else if (res.status === 403) {
                console.warn("Profile fetch error (Forbidden, Logging out):", data);
                get().logout();
            } else {
                console.error("Profile fetch error:", data);
            }
            return;
          }

          let displayMajor = data.major || 'Sin información';
          
          // Force proper labels for Admin and Teacher if they don't have a specific major/department
          // Or if the server is still returning the old 'Estudiante' default for them
          if (data.role?.toLowerCase() === 'admin') {
            displayMajor = 'Administrador';
          } else if (data.role?.toLowerCase() === 'teacher' && (!data.major || data.major.toLowerCase() === 'estudiante' || data.major.toLowerCase() === 'teacher')) {
            displayMajor = 'Docente';
          }

          set({
            userName: data.full_name || 'Usuario Desconocido',
            userMajor: displayMajor,
            userStatus: data.status ? data.status.toUpperCase() : 'DESCONOCIDO',
            studentId: data.student_id || 'N/A',
            userRole: (data.role ? data.role.toLowerCase() : 'student') as UserRole,
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      refreshSession: async () => {
        const { refreshToken, isRefreshingPromise } = get();
        
        if (!refreshToken) {
            console.error('DEBUG: No hay refresh token disponible');
            return false;
        }

        // Si ya hay un refresh en curso, esperamos a que termine
        if (isRefreshingPromise) {
            console.log("DEBUG: Refresh ya en curso, esperando...");
            return await isRefreshingPromise;
        }

        const refreshPromise = (async () => {
            try {
                const formData = new FormData();
                formData.append('refresh_token', refreshToken);

                console.log(`DEBUG: Enviando peticion a ${API_URL}/auth/refresh`);
                const res = await fetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    body: formData,
                });

                console.log(`DEBUG: Refresh status code: ${res.status}`);
                
                let data: any = {};
                try {
                  const text = await res.text();
                  console.log(`DEBUG: Refresh response text: ${text.substring(0, 200)}`);
                  data = text ? JSON.parse(text) : {};
                } catch (e) {
                  console.error("Non-JSON response in refresh", e);
                }

                if (res.ok && data.token) {
                    console.log("DEBUG: Refresh token exitoso, guardando nuevo token");
                    set({ token: data.token, isRefreshingPromise: null });
                    return true;
                } else {
                    console.warn('DEBUG: Refresh token inactivo o expirado en el servidor:', data);
                    set({ isRefreshingPromise: null });
                    return false;
                }
            } catch (error) {
                console.warn('Error refreshing session:', error);
                set({ isRefreshingPromise: null });
                return false;
            }
        })();

        set({ isRefreshingPromise: refreshPromise });
        return await refreshPromise;
      },
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
