import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [status, setStatus] = useState('Iniciando Nexus...');

  const scaleValue = new Animated.Value(0.8);
  const fadeValue = new Animated.Value(0);
  const progressValue = new Animated.Value(0);

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start();

    // Status sequence
    const timers = [
      setTimeout(() => setStatus('Sincronizando base de datos...'), 1000),
      setTimeout(() => setStatus('Cargando módulos de IA...'), 2000),
      setTimeout(() => setStatus('Listo'), 3000),
      setTimeout(() => onFinish(), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeValue }]}>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Image 
            source={require('@/assets/images/icon-v2.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
        </Animated.View>
        <ThemedText style={styles.title}>Smart Campus</ThemedText>
        <ThemedText style={styles.subtitle}>UdeC Seccional Girardot</ThemedText>
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText style={styles.status}>{status}</ThemedText>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: progressValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    width: '80%',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
