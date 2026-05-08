import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/constants/Config';
import { useReservations } from '@/hooks/useReservations';
import { TopNav } from '@/components/smart-campus/TopNav';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { updateStatus } = useReservations();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/reservations/${id}`);
      const data = await res.json();
      setReservation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAction = async (status: 'CONFIRMADA' | 'CANCELADA') => {
    await updateStatus(id as string, status as any);
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!reservation) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Solicitud no encontrada.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText style={[styles.statusTag, { color: colors.primary, backgroundColor: `${colors.primary}15` }]}>
            SOLICITUD EN {reservation.status}
          </ThemedText>
          <ThemedText style={styles.title}>{reservation.space_title}</ThemedText>
          <ThemedText style={styles.subtitle}>{reservation.building_name} • Nivel {reservation.floor || '1'}</ThemedText>
        </View>

        {/* User Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
            <ThemedText style={styles.sectionTitle}>Solicitante</ThemedText>
          </View>
          <View style={styles.userRow}>
             <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>{reservation.user_name}</ThemedText>
                <ThemedText style={styles.userMajor}>{reservation.user_major}</ThemedText>
                <ThemedText style={styles.userEmail}>{reservation.user_email}</ThemedText>
             </View>
          </View>
        </View>

        {/* Group Info (If applicable) */}
        {reservation.group_name && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Grupo: {reservation.group_name}</ThemedText>
            </View>
            <View style={styles.membersList}>
              {reservation.members?.map((member: any, idx: number) => (
                <View key={idx} style={styles.memberRow}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText style={styles.memberMajor}> - {member.major}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reservation Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <ThemedText style={styles.sectionTitle}>Detalles de Reserva</ThemedText>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>FECHA</ThemedText>
              <ThemedText style={styles.detailValue}>{new Date(reservation.start_time).toLocaleDateString()}</ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>HORARIO</ThemedText>
              <ThemedText style={styles.detailValue}>
                {reservation.start_time.substring(11, 16)} - 
                {reservation.end_time.substring(11, 16)}
              </ThemedText>
            </View>
          </View>
          {reservation.details && (
             <View style={styles.detailNotes}>
                <ThemedText style={styles.detailLabel}>NOTAS ADICIONALES</ThemedText>
                <ThemedText style={styles.notesText}>{reservation.details}</ThemedText>
             </View>
          )}
        </View>

        {/* Admin Actions */}
        {reservation.status === 'REVISIÓN' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#34C759' }]} 
              onPress={() => handleAction('CONFIRMADA')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <ThemedText style={styles.actionBtnText}>APROBAR SOLICITUD</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#FF3B30' }]} 
              onPress={() => handleAction('CANCELADA')}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <ThemedText style={styles.actionBtnText}>RECHAZAR SOLICITUD</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 140 },
  header: { marginBottom: 32 },
  statusTag: { 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '600' },
  sectionCard: { padding: 24, borderRadius: 28, borderWidth: 1, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userMajor: { fontSize: 14, color: '#8E8E93', fontWeight: '600', marginBottom: 2 },
  userEmail: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  membersList: { gap: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  memberName: { fontSize: 14, fontWeight: '700' },
  memberMajor: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  detailGrid: { flexDirection: 'row', gap: 40 },
  detailItem: { gap: 4 },
  detailLabel: { fontSize: 10, fontWeight: '900', color: '#8E8E93', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontWeight: '700' },
  detailNotes: { marginTop: 24, gap: 8 },
  notesText: { fontSize: 14, color: '#8E8E93', lineHeight: 20, fontWeight: '500' },
  actionsContainer: { marginTop: 16, gap: 12 },
  actionBtn: { 
    flexDirection: 'row', 
    height: 64, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12 
  },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
});
