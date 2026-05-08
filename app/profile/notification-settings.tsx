import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TopNav } from '@/components/smart-campus/TopNav';

const PreferenceItem = ({ icon, title, description, value, onValueChange }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.prefCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.prefLeft}>
        <View style={styles.prefIconBox}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.prefInfo}>
          <ThemedText style={styles.prefTitle}>{title}</ThemedText>
          <ThemedText style={styles.prefDesc}>{description}</ThemedText>
        </View>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#333', true: '#00FF00' }}
        thumbColor="#FFF"
      />
    </View>
  );
};

const MethodItem = ({ icon, label, status }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isActive = status === 'ACTIVO';
  
  return (
    <View style={[styles.methodCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.methodLeft}>
        <Ionicons name={icon} size={20} color={isActive ? colors.primary : '#444'} />
        <ThemedText style={[styles.methodLabel, !isActive && { color: '#444' }]}>{label}</ThemedText>
      </View>
      <View style={[styles.statusTag, { backgroundColor: isActive ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
        <ThemedText style={[styles.statusTagText, { color: isActive ? '#00FF00' : '#444' }]}>{status}</ThemedText>
      </View>
    </View>
  );
};

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [prefs, setPrefs] = useState({
    spaces: true,
    academic: true,
    events: false,
    wellness: true,
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <ThemedText style={styles.title}>Gestión de Notificaciones</ThemedText>
        <ThemedText style={styles.subtitle}>Personaliza cómo y cuándo recibes actualizaciones del campus.</ThemedText>

        <ThemedText style={styles.sectionLabel}>PREFERENCIAS DE ALERTA</ThemedText>
        
        <PreferenceItem 
          icon="business-outline" 
          title="Notificaciones de Espacios" 
          description="Salones libres, cambios de aula" 
          value={prefs.spaces}
          onValueChange={(v: boolean) => setPrefs(p => ({ ...p, spaces: v }))}
        />

        <PreferenceItem 
          icon="school-outline" 
          title="Alertas Académicas" 
          description="Notas publicadas, tareas pendientes" 
          value={prefs.academic}
          onValueChange={(v: boolean) => setPrefs(p => ({ ...p, academic: v }))}
        />

        <PreferenceItem 
          icon="calendar-outline" 
          title="Eventos del Campus" 
          description="Feria de proyectos, conferencias" 
          value={prefs.events}
          onValueChange={(v: boolean) => setPrefs(p => ({ ...p, events: v }))}
        />

        <PreferenceItem 
          icon="shield-checkmark-outline" 
          title="Avisos de Bienestar" 
          description="Ocupación en salón de descanso" 
          value={prefs.wellness}
          onValueChange={(v: boolean) => setPrefs(p => ({ ...p, wellness: v }))}
        />

        <ThemedText style={[styles.sectionLabel, { marginTop: 32 }]}>MÉTODOS DE AVISO</ThemedText>
        
        <MethodItem icon="wifi-outline" label="Push Notifications" status="ACTIVO" />
        <MethodItem icon="at-outline" label="Correo Institucional" status="ACTIVO" />
        <MethodItem icon="chatbox-outline" label="Mensajes de Texto" status="INACTIVO" />

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 130,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00FF00',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#00FF00',
    letterSpacing: 1,
    marginBottom: 20,
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 12,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  prefIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefInfo: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  prefDesc: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
});
