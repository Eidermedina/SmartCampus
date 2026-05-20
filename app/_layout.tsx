import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { RoleProvider, useRole } from '@/hooks/useRole';
import { ReportProvider } from '@/hooks/useReports';
import { ReservationProvider } from '@/hooks/useReservations';
import { NotificationProvider } from '@/hooks/useNotifications';
import { ThemeProvider as AppThemeProvider } from '@/hooks/use-theme';
import { CampusProvider } from '@/hooks/useCampus';
import { Splash } from '@/components/Splash';
import { Intro } from '@/components/smart-campus/Intro';
import { Auth } from '@/components/smart-campus/Auth';
import { useAuthStore } from '@/store/useAuthStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootContent() {
  const colorScheme = useColorScheme();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [isCheckingIntro, setIsCheckingIntro] = useState(true);
  const [isCheckingTimeout, setIsCheckingTimeout] = useState(true);
  const { isAuthenticated } = useRole();
  const _hasHydrated = useAuthStore(state => state._hasHydrated);
  const isReady = isSplashFinished && _hasHydrated && !isCheckingIntro && !isCheckingTimeout;
  const router = useRouter();

  // Recover from Android OOM camera kill
  useEffect(() => {
    if (isReady && isAuthenticated) {
      const checkPendingCamera = async () => {
        try {
          if (Platform.OS === 'android') {
            const pending = await ImagePicker.getPendingResultAsync();
            if (pending && Array.isArray(pending) && pending.length > 0) {
              const first = pending[0];
              if (!first.canceled && first.assets && first.assets.length > 0) {
                // Hay una imagen pendiente, veamos si estábamos haciendo un reporte
                const savedData = await AsyncStorage.getItem('pending_report');
                if (savedData) {
                  console.log("DEBUG: Auto-recuperando reporte tras reinicio de cámara...");
                  // Redirigir de vuelta a la pestaña de reportes para que la UI de reportes
                  // maneje la foto pendiente
                  router.replace('/reports');
                }
              }
            }
          }
        } catch (e) {
          console.warn('Error checking pending camera result:', e);
        }
      };
      checkPendingCamera();
    }
  }, [isReady, isAuthenticated]);

  useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
        if (hasSeenIntro === 'true') {
          setIsIntroFinished(true);
        }
      } catch (error) {
        console.error('Error checking intro status', error);
      } finally {
        setIsCheckingIntro(false);
      }
    };
    checkIntroStatus();
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;

    let appState = AppState.currentState;

    const checkBackgroundTime = async (isStartup: boolean) => {
      try {
        const lastBackgroundStr = await AsyncStorage.getItem('lastBackgroundTime');
        if (lastBackgroundStr) {
          const lastBackground = parseInt(lastBackgroundStr, 10);
          const timePassed = Date.now() - lastBackground;
          
          if (timePassed > 15 * 60 * 1000) { // 15 minutes
            useAuthStore.getState().logout();
          }
        }
        
        if (appState === 'active') {
          await AsyncStorage.removeItem('lastBackgroundTime');
        }
      } catch (error) {
        console.error('Error checking background time:', error);
      } finally {
        if (isStartup) {
          setIsCheckingTimeout(false);
        }
      }
    };

    // Check immediately on mount in case app was killed
    checkBackgroundTime(true);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        await checkBackgroundTime(false);
      } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background
        await AsyncStorage.setItem('lastBackgroundTime', Date.now().toString());
      }
      appState = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [_hasHydrated]);

  const handleIntroFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
    } catch (error) {
      console.error('Error saving intro status', error);
    }
    setIsIntroFinished(true);
  };

  if (!isReady) return <Splash onFinish={() => setIsSplashFinished(true)} />;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Main conditional flow */}
      {!isAuthenticated ? (
        // Not authenticated flow
        !isIntroFinished ? (
          <Intro onFinish={handleIntroFinish} />
        ) : (
          <Auth />
        )
      ) : (
        // Authenticated flow: Go straight to main app
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="spaces/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      )}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RoleProvider>
        <CampusProvider>
          <ReservationProvider>
            <NotificationProvider>
              <ReportProvider>
                <RootContent />
              </ReportProvider>
            </NotificationProvider>
          </ReservationProvider>
        </CampusProvider>
      </RoleProvider>
    </AppThemeProvider>
  );
}
