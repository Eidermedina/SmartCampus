import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootContent() {
  const colorScheme = useColorScheme();
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isIntroFinished, setIsIntroFinished] = useState(false);
  const [isCheckingIntro, setIsCheckingIntro] = useState(true);
  const { isAuthenticated } = useRole();

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

  const handleIntroFinish = async () => {
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
    } catch (error) {
      console.error('Error saving intro status', error);
    }
    setIsIntroFinished(true);
  };

  if (!isSplashFinished || isCheckingIntro) return <Splash onFinish={() => setIsSplashFinished(true)} />;

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
