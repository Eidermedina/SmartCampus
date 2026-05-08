import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TopNav } from '@/components/smart-campus/TopNav';
import { LinearGradient } from 'expo-linear-gradient';

export default function CancelReservationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.attentionText}>ATENCIÓN REQUERIDA</ThemedText>
          <ThemedText style={styles.title}>Cancelación de Reserva</ThemedText>
          <ThemedText style={styles.subtitle}>Estás a punto de liberar un espacio académico. Revisa los detalles antes de proceder.</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="business-outline" size={24} color={colors.primary} style={{ marginBottom: 12 }} />
          <ThemedText style={styles.spaceTitle}>Salón 204-B</ThemedText>
          <ThemedText style={styles.spaceLocation}>EDIFICIO DE CIENCIAS</ThemedText>
        </View>

        <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dateHeader}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <View style={[styles.badge, { backgroundColor: isLight ? 'rgba(0,123,62,0.1)' : 'rgba(0,123,62,0.2)' }]}>
              <ThemedText style={[styles.badgeText, { color: colors.primary }]}>CONFIRMADA</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.dateText}>Hoy, 24 Mayo</ThemedText>
          <ThemedText style={styles.timeText}>08:00 — 09:30</ThemedText>
        </View>

        <View style={[styles.capacityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
           <ThemedText style={[styles.capacityText, { color: colors.text }]}>Capacidad: 15 Personas</ThemedText>
        </View>

        <View style={[styles.warningBox, { backgroundColor: 'rgba(255, 69, 58, 0.1)', borderColor: 'rgba(255, 69, 58, 0.3)' }]}>
           <View style={styles.warningHeader}>
             <Ionicons name="warning-outline" size={20} color="#FF453A" />
             <ThemedText style={styles.warningTitle}>Información Importante</ThemedText>
           </View>
           <ThemedText style={styles.warningText}>
             Esta acción es **permanente**. Al cancelar, el espacio quedará disponible inmediatamente para otros estudiantes y no podrá ser recuperado sin una nueva reserva.
           </ThemedText>
        </View>

        <LinearGradient 
          colors={['#FF6B6B', '#FF453A']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }} 
          style={styles.confirmBtnContainer}
        >
          <TouchableOpacity 
            style={styles.confirmBtn} 
            onPress={() => {
              alert('Reserva cancelada exitosamente.');
              router.back();
            }}
          >
            <ThemedText style={styles.confirmBtnText}>Confirmar Cancelación</ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity 
          style={[styles.keepBtn, { borderColor: colors.border, backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)' }]} 
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.keepBtnText, { color: colors.text }]}>Mantener Reserva</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <ThemedText style={styles.backLinkText}>VOLVER AL PANEL PRINCIPAL</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 130, paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  attentionText: { fontSize: 10, fontWeight: '900', color: '#FF453A', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#8E8E93', fontWeight: '600', lineHeight: 20 },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16 },
  spaceTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  spaceLocation: { fontSize: 11, color: '#8E8E93', fontWeight: '800', letterSpacing: 1 },
  dateCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#007B3E' },
  dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '900' },
  dateText: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  timeText: { fontSize: 28, fontWeight: '900', color: '#007B3E' },
  capacityCard: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  capacityText: { fontSize: 13, color: '#FFF', fontWeight: '600' },
  warningBox: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 40 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  warningTitle: { fontSize: 16, fontWeight: '900', color: '#FF453A' },
  warningText: { fontSize: 13, color: '#8E8E93', lineHeight: 20 },
  confirmBtnContainer: { borderRadius: 24, marginBottom: 16 },
  confirmBtn: { paddingVertical: 18, alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '900', color: '#550000' },
  keepBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 24, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 24 },
  keepBtnText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  backLinkText: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textAlign: 'center', color: '#8E8E93' }
});
