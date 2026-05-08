import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TopNav } from '@/components/smart-campus/TopNav';
import { useRole } from '@/hooks/useRole';
import { useReservations, ReservationStatus } from '@/hooks/useReservations';

interface RequestCardProps {
  reservation: any;
  onApprove: () => void;
  onReject: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ reservation, onApprove, onReject }) => {
  const { spaceTitle, userName, date, time, status, priority, message } = reservation;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText style={[styles.locationLabel, { color: colors.primary }]}>{spaceTitle}</ThemedText>
          <ThemedText style={styles.requesterName}>{userName}</ThemedText>
        </View>
        {priority === 'ALTA' && (
          <View style={[styles.badge, { backgroundColor: `${colors.success}15` }]}>
            <ThemedText style={[styles.badgeText, { color: colors.success }]}>PRIORIDAD ALTA</ThemedText>
          </View>
        )}
      </View>

      {message ? (
        <View style={[styles.messageBox, { borderLeftColor: colors.primary }]}>
          <ThemedText style={styles.messageText}>"{message}"</ThemedText>
        </View>
      ) : (
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <ThemedText style={styles.detailText}>{date}</ThemedText>
          </View>
          {time && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <ThemedText style={styles.detailText}>{time}</ThemedText>
            </View>
          )}
        </View>
      )}

      {status === 'REVISIÓN' && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onApprove}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
            <ThemedText style={[styles.actionBtnText, { color: '#FFF' }]}>Aprobar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={onReject}>
            <Ionicons name="close-circle-outline" size={18} color="#FFF" />
            <ThemedText style={[styles.actionBtnText, { color: '#FFF' }]}>Rechazar</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {status !== 'REVISIÓN' && (
        <View style={[styles.statusIndicator, { backgroundColor: status === 'CONFIRMADA' ? `${colors.success}15` : `${colors.error}15` }]}>
          <ThemedText style={{ color: status === 'CONFIRMADA' ? colors.success : colors.error, fontWeight: '900', fontSize: 12 }}>
            {status}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default function RequestsScreen() {
  const { reservations, updateStatus, refreshReservations } = useReservations();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const [activeFilter, setActiveFilter] = useState('Pendientes');

  const pendingCount = reservations.filter(r => r.status === 'REVISIÓN').length;

  const filteredReservations = reservations.filter(r => {
    if (activeFilter === 'Pendientes') return r.status === 'REVISIÓN';
    if (activeFilter === 'Aprobadas') return r.status === 'CONFIRMADA';
    if (activeFilter === 'Rechazadas') return r.status === 'CANCELADA'; // 'CANCELADA' se usa como rechazo
    return true;
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Solicitudes de Reserva</ThemedText>
          <ThemedText style={styles.subtitle}>Gestiona el flujo del campus y la asignación de recursos.</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filterContent}>
          {[`Pendientes (${pendingCount})`, 'Aprobadas', 'Rechazadas'].map((filterLabel) => {
            const filterValue = filterLabel.includes('Pendientes') ? 'Pendientes' : filterLabel;
            return (
              <TouchableOpacity
                key={filterLabel}
                onPress={() => setActiveFilter(filterValue)}
                style={[
                  styles.filterTab,
                  activeFilter === filterValue && { backgroundColor: isLight ? colors.primary : colors.accent }
                ]}
              >
                <ThemedText style={[
                  styles.filterTabText,
                  activeFilter === filterValue ? { color: isLight ? '#FFF' : '#000' } : { color: '#8E8E93' }
                ]}>
                  {filterLabel}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listContainer}>
          {filteredReservations.map(res => (
            <RequestCard
              key={res.id}
              reservation={res}
              onApprove={() => updateStatus(res.id, 'CONFIRMADA')}
              onReject={() => updateStatus(res.id, 'CANCELADA')}
            />
          ))}
          {filteredReservations.length === 0 && (
            <ThemedText style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No hay solicitudes en esta categoría.</ThemedText>
          )}
        </View>

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
    paddingTop: 130,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
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
  filtersRow: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listContainer: {
    gap: 20,
  },
  card: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  requesterName: {
    fontSize: 20,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageBox: {
    backgroundColor: 'rgba(150,150,150,0.1)',
    padding: 20,
    borderRadius: 24,
    borderLeftWidth: 3,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#007B3E',
  },
  rejectBtn: {
    backgroundColor: '#FF453A',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusIndicator: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
