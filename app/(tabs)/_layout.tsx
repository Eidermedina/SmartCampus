import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useRole } from '@/hooks/useRole';

import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const isLight = colorScheme === 'light';

  const { role } = useRole();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isLight ? '#FFF' : Colors[colorScheme].tint,
        tabBarInactiveTintColor: isLight ? 'rgba(255,255,255,0.6)' : Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => isLight ? (
          <LinearGradient
            colors={['#00482B', '#007B3E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null,
        tabBarStyle: {
          backgroundColor: isLight ? 'transparent' : Colors[colorScheme].background,
          borderTopColor: isLight ? 'transparent' : Colors[colorScheme].border,
          height: 70,
          paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="grid-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          href: role === 'admin' ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="checkmark-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="spaces"
        options={{
          title: 'Espacios',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="business-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          href: role === 'admin' ? null : undefined,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="map-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="stats-chart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          href: role === 'admin' ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons size={24} name="people-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
