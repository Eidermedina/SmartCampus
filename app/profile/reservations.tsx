import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

import { useReservations, ReservationStatus } from '@/hooks/useReservations';
import { useRole } from '@/hooks/useRole';
import { TopNav } from '@/components/smart-campus/TopNav';

const ReservationCard = ({ id, title, type, date, time, status, userName, role, creatorId, currentUserId, onApprove, onReject, onDelete }: { id: string, title: string, type: string, date: string, time: string, status: ReservationStatus, userName?: string, role: string, creatorId?: string, currentUserId?: string, onApprove?: () => void, onReject?: () => void, onDelete?: () => void }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const getStatusStyle = (s: ReservationStatus) => {
    const isLight = colorScheme === 'light';
    switch (s) {
      case 'PENDIENTE': return { bg: isLight ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 214, 10, 0.1)', text: isLight ? '#FF9500' : '#FFD60A', border: isLight ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 214, 10, 0.2)' };
      case 'CONFIRMADA': return { bg: isLight ? 'rgba(52, 199, 89, 0.1)' : 'rgba(0, 255, 0, 0.1)', text: isLight ? '#34C759' : '#00FF00', border: isLight ? 'rgba(52, 199, 89, 0.2)' : 'rgba(0, 255, 0, 0.2)' };
      case 'EN ESPERA': return { bg: isLight ? 'rgba(0, 122, 255, 0.1)' : 'rgba(10, 132, 255, 0.1)', text: isLight ? '#007AFF' : '#0A84FF', border: isLight ? 'rgba(0, 122, 255, 0.2)' : 'rgba(10, 132, 255, 0.2)' };
      case 'CANCELADA': return { bg: isLight ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 69, 58, 0.1)', text: isLight ? '#FF3B30' : '#FF453A', border: isLight ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 69, 58, 0.2)' };
      default: return { bg: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)', text: colors.text, border: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)' };
    }
  };

  const statusStyle = getStatusStyle(status);

  const isCreator = currentUserId === creatorId;

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: '/spaces/details/[id]',
          params: { id: id }
        });
      }}
      style={[styles.resCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.resHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.resType}>{type}</ThemedText>
          <ThemedText style={[styles.resTitle, { color: colors.text }]}>{title}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>{status}</ThemedText>
        </View>
      </View>
      
      <View style={styles.resInfoRow}>
        <View style={styles.infoCol}>
          <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
          <ThemedText style={styles.infoText}>{date}</ThemedText>
        </View>
        <View style={styles.infoCol}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <ThemedText style={styles.infoText}>{time}</ThemedText>
        </View>
      </View>

      <View style={styles.resActions}>
        {role === 'admin' ? (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.manageBtn]} onPress={onApprove}>
              <ThemedText style={styles.manageBtnText}>APROBAR</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn, { borderColor: '#FF453A' }]} onPress={onReject}>
              <ThemedText style={[styles.cancelBtnText, { color: '#FF453A' }]}>RECHAZAR</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {isCreator ? (
              status === 'CANCELADA' ? (
                <TouchableOpacity 
                  style={[styles.actionBtn, { flex: 1, backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', borderColor: colors.border, borderWidth: 1 }]} 
                  onPress={onDelete}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
                  <ThemedText style={{ color: colors.text, fontWeight: '800', fontSize: 13 }}>ELIMINAR REGISTRO</ThemedText>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.manageBtn]}
                    onPress={() => router.push({ pathname: '/spaces/details/[id]', params: { id: id } })}
                  >
                    <ThemedText style={styles.manageBtnText}>GESTIONAR</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.cancelBtn, { borderColor: colorScheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)', backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }]}
                    onPress={() => router.push({ pathname: '/spaces/cancel/[id]', params: { id: id } })}
                  >
                    <ThemedText style={[styles.cancelBtnText, { color: colors.text }]}>CANCELAR</ThemedText>
                  </TouchableOpacity>
                </>
              )
            ) : (
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }]}
                onPress={() => router.push({ pathname: '/spaces/details/[id]', params: { id: id } })}
              >
                <ThemedText style={[styles.manageBtnText, { color: colors.primary }]}>VER DETALLES</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ReservationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { reservations, updateStatus, deleteReservation } = useReservations();
  const { userId, role } = useRole();

  const displayReservations = role === 'admin' 
    ? reservations.filter((r: any) => r.status === 'PENDIENTE') 
    : reservations;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Nav (Unified Design) - Fixed Outside ScrollView */}
      <TopNav />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{role === 'admin' ? 'Solicitudes' : 'Mis Reservas'}</ThemedText>
          <ThemedText style={styles.subtitle}>{role === 'admin' ? 'Aprueba o rechaza las reservas pendientes.' : 'Gestiona tus espacios de estudio y laboratorios.'}</ThemedText>
        </View>

        {/* List */}
        {displayReservations.length > 0 ? (
          displayReservations.map((res) => (
            <ReservationCard 
              key={res.id}
              id={res.id}
              title={res.spaceTitle}
              type={res.type}
              date={res.date}
              time={res.time}
              status={res.status}
              userName={res.userName}
              role={role || 'student'}
              creatorId={res.creatorId}
              currentUserId={userId}
              onApprove={() => updateStatus(res.id, 'CONFIRMADA')}
              onReject={() => updateStatus(res.id, 'CANCELADA')}
              onDelete={() => deleteReservation(res.id)}
            />
          ))
        ) : (
          <View style={[styles.emptyContainer, { borderColor: colorScheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)', backgroundColor: colorScheme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }]}>
            <Ionicons name="calendar-clear-outline" size={48} color={colors.muted || '#8E8E93'} />
            <ThemedText style={styles.emptyText}>No tienes reservas activas.</ThemedText>
          </View>
        )}

        {/* New Reservation CTA */}
        <TouchableOpacity style={styles.newResCard} onPress={() => router.push('/(tabs)/spaces')}>
          <View style={styles.newResIcon}>
            <Ionicons name="add" size={32} color={colors.primary} />
          </View>
          <ThemedText style={styles.newResTitle}>¿Necesitas otro espacio?</ThemedText>
          <ThemedText style={styles.newResSubtitle}>Explora las salas disponibles en el campus ahora mismo.</ThemedText>
          <TouchableOpacity style={styles.newResBtn} onPress={() => router.push('/(tabs)/spaces')}>
            <ThemedText style={styles.newResBtnText}>Nueva Reserva</ThemedText>
          </TouchableOpacity>
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
    paddingTop: 120,
  },
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  navAvatarMini: {
    marginRight: -4,
  },
  miniAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    lineHeight: 20,
  },
  resCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 20,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resType: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  resTitle: {
    fontSize: 20,
    fontWeight: '800',
    paddingRight: 10,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00FF00',
  },
  resInfoRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  infoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  resActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageBtn: {
    backgroundColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '600',
  },
  newResCard: {
    backgroundColor: '#006B3E',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  newResIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  newResTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 10,
  },
  newResSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  newResBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  newResBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
});
