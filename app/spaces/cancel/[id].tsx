import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useCampus } from '@/hooks/useCampus';
import { useReservations } from '@/hooks/useReservations';
import { useAuthStore } from '@/store/useAuthStore';
import { API_URL } from '@/constants/Config';
import { TopNav } from '@/components/smart-campus/TopNav';

export default function CancellationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { reservations, refreshReservations } = useReservations();
  const { spaces, refreshData } = useCampus();
  const token = useAuthStore(state => state.token);

  const reservation = reservations.find(r => r.id === id);
  const space = reservation ? spaces.find(s => s.id === reservation.spaceId) : null;

  const handleCancel = async () => {
    try {
      const res = await fetch(`${API_URL}/reservations/${id}?status=CANCELADA`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Error al cancelar:', err.detail);
        return;
      }
      await refreshData();
      await refreshReservations();
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  if (!reservation) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Reserva no encontrada.</ThemedText>
        <TouchableOpacity style={styles.keepBtn} onPress={() => router.back()}>
          <ThemedText style={styles.keepBtnText}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>


        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.attention}>ATENCIÓN REQUERIDA</ThemedText>
          <ThemedText style={styles.title}>Cancelación de Reserva</ThemedText>
          <ThemedText style={styles.subtitle}>
            Estás a punto de liberar un espacio académico. Revisa los detalles antes de proceder.
          </ThemedText>
        </View>

        {/* Space Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.iconBox}>
             <Ionicons name={reservation.type?.includes('LABORATORIO') ? 'flask-outline' : 'business-outline'} size={24} color={colors.primary} />
          </View>
          <View>
            <ThemedText style={styles.infoTitle}>{reservation.spaceTitle}</ThemedText>
            <ThemedText style={styles.infoSub}>{space ? space.block.toUpperCase() : 'CAMPUS PRINCIPAL'}</ThemedText>
          </View>
        </View>

        {/* Schedule Card */}
        <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: colors.primary }]}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <View style={styles.statusBadge}>
              <ThemedText style={styles.statusText}>{reservation.status}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.dateText}>{reservation.date}</ThemedText>
          <ThemedText style={[styles.timeText, { color: colors.primary }]}>{reservation.time}</ThemedText>
        </View>

        {/* Capacity Info */}
        {space && (
          <View style={styles.capacityRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.capacityText, { color: colors.text }]}>Capacidad: {space.capacity} Personas</ThemedText>
          </View>
        )}

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning-outline" size={20} color="#FF453A" />
            <ThemedText style={[styles.warningTitle, { color: colors.text }]}>Información Importante</ThemedText>
          </View>
          <ThemedText style={[styles.warningBody, { color: colors.muted }]}>
            Esta acción es **permanente**. Al cancelar, el espacio quedará disponible inmediatamente para otros estudiantes y no podrá ser recuperado sin una nueva reserva.
          </ThemedText>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleCancel}>
          <ThemedText style={styles.confirmBtnText}>Confirmar Cancelación</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.keepBtn, { borderColor: colors.border }]} onPress={() => router.back()}>
          <ThemedText style={[styles.keepBtnText, { color: colors.text }]}>Mantener Reserva</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/(tabs)')}>
          <ThemedText style={styles.footerLinkText}>VOLVER AL PANEL PRINCIPAL</ThemedText>
        </TouchableOpacity>

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
    paddingTop: 150,
  },
  header: {
    marginBottom: 32,
  },
  attention: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF453A',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  scheduleCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: '#006B3E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '900',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'center',
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 69, 58, 0.05)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.1)',
    marginBottom: 40,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  warningBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  confirmBtn: {
    height: 60,
    backgroundColor: '#FF453A',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  keepBtn: {
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  keepBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  footerLink: {
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
  },
});
