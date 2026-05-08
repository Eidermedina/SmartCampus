import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRole } from '@/hooks/useRole';

import { Notification, useNotifications } from '@/hooks/useNotifications';
import { useReservations } from '@/hooks/useReservations';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { TopNav } from './TopNav';
import { API_URL } from '@/constants/Config';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <ThemedText style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</ThemedText>
      <ThemedText style={styles.statTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</ThemedText>
    </TouchableOpacity>
  );
};

interface OccupancyItemProps {
  label: string;
  percentage: number;
  color: string;
  onPress?: () => void;
}

const OccupancyItem: React.FC<OccupancyItemProps> = ({ label, percentage, color, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <TouchableOpacity
      style={styles.occupancyItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.occupancyHeader}>
        <ThemedText style={styles.occupancyLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</ThemedText>
        <ThemedText style={styles.occupancyPercentage} numberOfLines={1}>{percentage}%</ThemedText>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );
};

interface NotificationItemProps {
  title: string;
  description: string;
  type: 'success' | 'alert' | 'info';
  time: string;
  onPress?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, type, time, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const icon = type === 'success' ? 'checkmark-circle' : type === 'alert' ? 'warning' : 'information-circle';
  const color = type === 'success' ? colors.success : type === 'alert' ? colors.warning : colors.tint;

  return (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.notiIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.notiContent}>
        <ThemedText style={styles.notiTitle} numberOfLines={1}>{title}</ThemedText>
        <ThemedText style={styles.notiDesc} numberOfLines={2}>{description}</ThemedText>
      </View>
      <ThemedText style={styles.notiTime}>{time}</ThemedText>
    </TouchableOpacity>
  );
};

import { useCampus } from '@/hooks/useCampus';

const AdminDashboard: React.FC = () => {
  const { role, userName } = useRole();
  const { notifications, markAsRead, deleteNotification, acceptInvitation } = useNotifications();
  const [selectedNoti, setSelectedNoti] = React.useState<any>(null);
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const { spaces, reports, toggleSpaceStatus } = useCampus();
  const { reservations } = useReservations();
  const [users, setUsers] = React.useState<any[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const router = useRouter();

  const usersRef = React.useRef(users);
  React.useEffect(() => { usersRef.current = users; }, [users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      if (JSON.stringify(data) !== JSON.stringify(usersRef.current)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  React.useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // 10 seconds as requested
    return () => clearInterval(interval);
  }, []);

  const pendingRequests = reservations.filter(r => r.status === 'REVISIÓN');

  return (
    <View style={styles.adminContainer}>
      <TopNav />
      <ScrollView
        style={styles.adminContainer}
        contentContainerStyle={styles.adminScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.adminHeader}>
          <ThemedText style={[styles.dashboardSubtitle, { color: colors.primary }]}>GESTIÓN ADMINISTRATIVA</ThemedText>
          <ThemedText style={styles.greeting}>Hola, {userName ? userName.split(' ')[0] : 'Admin'}</ThemedText>
        </View>

        <View style={styles.adminContent}>
          {/* Stats Cards ... */}
          <View style={[styles.adminHeroCard, { backgroundColor: isLight ? colors.primary : colors.card, borderColor: colors.border, borderWidth: isLight ? 0 : 1 }]}>
            <View style={styles.heroInfo}>
              <ThemedText style={[styles.heroLabel, { color: isLight ? 'rgba(255,255,255,0.7)' : colors.muted }]}>USUARIOS TOTALES</ThemedText>
              <ThemedText style={[styles.heroValue, { color: isLight ? '#FFF' : colors.text }]}>{users.length}</ThemedText>
              <View style={styles.heroTrend}>
                <Ionicons name="people" size={14} color={isLight ? '#FFF' : colors.success} />
                <ThemedText style={[styles.trendText, { color: isLight ? '#FFF' : colors.success }]}>Registrados en el sistema</ThemedText>
              </View>
            </View>
            <View style={styles.heroIconContainer}>
              <Ionicons name="person-add" size={80} color={isLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} />
            </View>
          </View>

          {/* ... existing stats row ... */}
          <View style={styles.adminStatsRow}>
            <View style={[styles.adminStatItem, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={[styles.statIconCircle, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="calendar" size={20} color={colors.success} />
              </View>
              <ThemedText style={styles.adminStatValue} numberOfLines={1} adjustsFontSizeToFit>{reservations.filter(r => (r.status || '').toUpperCase() === 'CONFIRMADA').length}</ThemedText>
              <ThemedText style={styles.adminStatLabel} numberOfLines={1} adjustsFontSizeToFit>RESERVAS ACTIVAS</ThemedText>
            </View>
            <View style={[styles.adminStatItem, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={[styles.statIconCircle, { backgroundColor: `${colors.error}15` }]}>
                <Ionicons name="warning" size={20} color={colors.error} />
              </View>
              <ThemedText style={styles.adminStatValue} numberOfLines={1} adjustsFontSizeToFit>{reports.filter(r => r.status === 'PENDIENTE').length}</ThemedText>
              <ThemedText style={styles.adminStatLabel} numberOfLines={1} adjustsFontSizeToFit>INCIDENCIAS ABIERTAS</ThemedText>
            </View>
          </View>

          {/* ... action card ... */}
          <View style={[styles.adminActionCard, { backgroundColor: isLight ? colors.secondary : colors.primary }]}>
            <View style={styles.actionCardContent}>
              <View style={styles.actionTextCol}>
                <ThemedText style={[styles.actionTitle, { color: '#FFF' }]}>Reservas Pendientes</ThemedText>
                <ThemedText style={[styles.actionDesc, { color: 'rgba(255,255,255,0.7)' }]}>Esperando aprobación administrativa</ThemedText>
              </View>
              <View style={styles.actionCountContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={60} color="rgba(255,255,255,0.1)" style={styles.absIcon} />
                <ThemedText style={styles.actionCount} numberOfLines={1} adjustsFontSizeToFit>{pendingRequests.length}</ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: isLight ? colors.primary : '#FFF' }]}
              onPress={() => router.push('/profile/reservations')}
            >
              <ThemedText style={[styles.actionBtnText, { color: isLight ? '#FFF' : colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>REVISAR TODAS LAS SOLICITUDES</ThemedText>
            </TouchableOpacity>
          </View>

          {/* New Interactive Occupancy Section */}
          <View style={styles.adminSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.adminSectionLabel}>OCUPACIÓN (CLICK PARA CAMBIAR)</ThemedText>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveText}>EN VIVO</ThemedText>
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              {spaces.map(s => (
                <OccupancyItem
                  key={s.id}
                  label={s.title}
                  percentage={s.status === 'available' ? 0 : 100}
                  color={s.status === 'occupied' ? colors.error : s.status === 'maintenance' ? colors.muted : colors.primary}
                  onPress={() => toggleSpaceStatus(s.id, s.status)}
                />
              ))}
            </View>
          </View>

          {/* Incidents Section */}
          <View style={styles.adminSection}>
            <ThemedText style={styles.adminSectionLabel}>INCIDENCIAS Y REPORTES</ThemedText>
            {reports.map(report => (
              <TouchableOpacity 
                key={report.id} 
                onPress={() => setSelectedReport(report)}
                activeOpacity={0.7}
                style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              >
                <View style={styles.alertHeader}>
                  <View style={[styles.indicatorDot, { backgroundColor: report.priority === 'Alta' ? colors.error : colors.warning }]} />
                  <ThemedText style={styles.alertTitle}>{report.title}</ThemedText>
                </View>
                <ThemedText style={styles.alertDesc} numberOfLines={2}>{report.description}</ThemedText>
                {report.imageUri && (
                   <Image 
                     source={{ uri: report.imageUri }} 
                     style={{ width: '100%', height: 100, borderRadius: 12, marginVertical: 8 }}
                     contentFit="cover"
                     transition={300}
                   />
                )}
                <View style={styles.alertMeta}>
                  <ThemedText style={styles.metaText}>📍 {report.space}</ThemedText>
                  <ThemedText style={styles.metaText}>👤 {report.userName}</ThemedText>
                  <View style={styles.tag}>
                    <ThemedText style={styles.tagText}>{report.status}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {reports.length === 0 && <ThemedText style={{ textAlign: 'center', color: colors.muted }}>No hay incidencias reportadas</ThemedText>}
          </View>


          {/* Admin Notifications Section */}
          <View style={styles.adminSection}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.adminSectionLabel}>NOTIFICACIONES DEL SISTEMA</ThemedText>
              <TouchableOpacity onPress={() => router.push('/profile/notifications')}>
                <ThemedText style={[styles.viewAll, { color: colors.primary }]}>Ver todas</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              {notifications.slice(0, 3).map(noti => (
                <NotificationItem
                  key={noti.id}
                  title={noti.title}
                  description={noti.description}
                  type={noti.type}
                  time={noti.time}
                  onPress={() => setSelectedNoti(noti)}
                />
              ))}
              {notifications.length === 0 && <ThemedText style={{ textAlign: 'center', color: colors.muted }}>No hay notificaciones pendientes</ThemedText>}
            </View>
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Notification Detail Modal for Admin */}
      <Modal
        visible={!!selectedNoti}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNoti(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedNoti(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedNoti && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{selectedNoti.title}</ThemedText>
                  <TouchableOpacity onPress={() => setSelectedNoti(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.modalTime}>{selectedNoti.time}</ThemedText>
                <ThemedText style={styles.modalDesc}>{selectedNoti.description}</ThemedText>

                <View style={styles.modalActions}>
                  {!selectedNoti.isRead && (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        markAsRead(selectedNoti.id);
                        setSelectedNoti(null);
                      }}
                    >
                      <ThemedText style={styles.modalBtnText}>Marcar leída</ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: colors.error }]}
                    onPress={() => {
                      deleteNotification(selectedNoti.id);
                      setSelectedNoti(null);
                    }}
                  >
                    <ThemedText style={styles.modalBtnText}>Borrar</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Report Detail Modal for Admin */}
      <Modal
        visible={!!selectedReport}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedReport(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border, maxHeight: '85%' }]}>
            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{selectedReport.title}</ThemedText>
                  <TouchableOpacity onPress={() => setSelectedReport(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <View style={{ gap: 12, paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.indicatorDot, { backgroundColor: selectedReport.priority === 'Alta' ? colors.error : colors.warning }]} />
                    <ThemedText style={{ fontWeight: '800', color: selectedReport.priority === 'Alta' ? colors.error : colors.warning }}>
                      PRIORIDAD {selectedReport.priority.toUpperCase()}
                    </ThemedText>
                  </View>

                  <ThemedText style={[styles.modalTime, { marginBottom: 0 }]}>
                    Reportado por: {selectedReport.userName}
                  </ThemedText>
                  <ThemedText style={[styles.modalTime, { marginTop: 0 }]}>
                    Ubicación: {selectedReport.space} • {selectedReport.createdAt}
                  </ThemedText>

                  <ThemedText style={[styles.modalDesc, { fontSize: 16, lineHeight: 24, marginVertical: 10 }]}>
                    {selectedReport.description}
                  </ThemedText>

                  {selectedReport.imageUri && (
                    <>
                      {selectedReport.imageUri.startsWith('file://') ? (
                        <View style={{ width: '100%', height: 200, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                          <Ionicons name="cloud-offline-outline" size={40} color={colors.error} />
                          <ThemedText style={{ color: colors.error, textAlign: 'center', marginTop: 10 }}>
                            Esta imagen solo es visible en el dispositivo que creó el reporte (Ruta local).
                          </ThemedText>
                        </View>
                      ) : (
                        <Image 
                          source={{ uri: selectedReport.imageUri }} 
                          style={{ width: '100%', height: 300, borderRadius: 20, marginTop: 10 }}
                          contentFit="contain"
                          transition={300}
                          placeholder="|rF?hV%2WCj[ayj[a|j[ayjtOGV@ayofayofayofj[ayj[ayoFayofayofayofayofayofayofayofayofayofayofayof"
                        />
                      )}
                    </>
                  )}

                  <View style={[styles.tag, { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 16, paddingVertical: 8 }]}>
                    <ThemedText style={[styles.tagText, { fontSize: 14 }]}>{selectedReport.status}</ThemedText>
                  </View>
                </View>

                <View style={[styles.modalActions, { marginTop: 20 }]}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
                    onPress={() => setSelectedReport(null)}
                  >
                    <ThemedText style={[styles.modalBtnText, { color: isLight ? '#FFF' : '#000' }]}>Entendido</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>

    </View>
  );
};

export const Dashboard: React.FC = () => {
  const { role, userName } = useRole();
  const { spaces, reservations: allReservations, reports } = useCampus();
  const { notifications, markAsRead, deleteNotification, acceptInvitation } = useNotifications();
  const [selectedNoti, setSelectedNoti] = React.useState<Notification | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  // Use reservations directly from useCampus hook as they are already filtered by userId
  const reservations = allReservations;

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <ThemedText style={[styles.dashboardSubtitle, { color: colors.primary }]}>RESUMEN DEL DASHBOARD</ThemedText>
        <ThemedText style={styles.greeting}>Hola, {userName ? userName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : ''}</ThemedText>
      </View>
    );
  };

  const renderStats = () => {
    // Calcular horas de estudio reales basadas en reservas confirmadas
    const confirmedReservations = reservations.filter(r => (r.status || '').toUpperCase() === 'CONFIRMADA');
    let totalHours = 0;
    confirmedReservations.forEach(r => {
      // Intentar extraer duración si existe, o asumir 1.5 horas por defecto
      totalHours += 1.5; 
    });

    return (
      <View style={styles.statsContainer}>
        <StatCard title="Reservas" value={confirmedReservations.length.toString()} icon="calendar" color={colors.primary} onPress={() => router.push('/profile/reservations')} />
        <StatCard title="Horas de Estudio" value={totalHours.toFixed(1)} icon="time" color={colors.accent} onPress={() => router.push('/profile/reservations')} />
      </View>
    );
  };

  const renderOccupancy = () => {
    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Ocupación del Campus</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {spaces.slice(0, 4).map(s => (
            <OccupancyItem
              key={s.id}
              label={s.title}
              percentage={s.status === 'available' ? 0 : 100}
              color={s.status === 'occupied' ? colors.error : s.status === 'maintenance' ? colors.muted : colors.primary}
            />
          ))}
          {spaces.length > 3 && (
            <ThemedText style={{ fontSize: 10, color: colors.muted, marginTop: -12, fontWeight: '700' }}>
              * {spaces[3].title}: {spaces[3].status === 'maintenance' ? 'CERRADO' : 'EN FUNCIONAMIENTO'}
            </ThemedText>
          )}
        </View>
      </View>
    );
  };

  const renderNotifications = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Notificaciones Recientes</ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile/notifications')}>
            <ThemedText style={[styles.viewAll, { color: colors.primary }]}>Ver todas</ThemedText>
          </TouchableOpacity>
        </View>
        {notifications.slice(0, 2).map(noti => (
          <NotificationItem
            key={noti.id}
            title={noti.title}
            description={noti.description}
            type={noti.type}
            time={noti.time}
            onPress={() => setSelectedNoti(noti)}
          />
        ))}
        {notifications.length === 0 && (
          <ThemedText style={{ color: colors.muted, textAlign: 'center', marginTop: 10 }}>Sin notificaciones pendientes</ThemedText>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderStats()}
        {renderOccupancy()}
        {renderNotifications()}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedNoti}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedNoti(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedNoti(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedNoti && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{selectedNoti.title}</ThemedText>
                  <TouchableOpacity onPress={() => setSelectedNoti(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.modalTime}>{selectedNoti.time}</ThemedText>
                <ThemedText style={styles.modalDesc}>{selectedNoti.description}</ThemedText>

                <View style={styles.modalActions}>
                  {selectedNoti.type.startsWith('invite_group:') && (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: colors.success, flex: 2 }]}
                      onPress={async () => {
                        const groupId = selectedNoti.type.split(':')[1];
                        await acceptInvitation(selectedNoti.id, groupId);
                        setSelectedNoti(null);
                      }}
                    >
                      <ThemedText style={styles.modalBtnText}>Unirse al Grupo</ThemedText>
                    </TouchableOpacity>
                  )}
                  {!selectedNoti.isRead && !selectedNoti.type.startsWith('invite_group:') && (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        markAsRead(selectedNoti.id);
                        setSelectedNoti(null);
                      }}
                    >
                      <ThemedText style={styles.modalBtnText}>Marcar como leída</ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: colors.error, flex: 1 }]}
                    onPress={() => {
                      deleteNotification(selectedNoti.id);
                      setSelectedNoti(null);
                    }}
                  >
                    <ThemedText style={styles.modalBtnText}>Borrar</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 130,
  },
  header: {
    marginBottom: 32,
  },
  dashboardSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    paddingBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    paddingBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
  },
  occupancyItem: {
    marginBottom: 24,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  occupancyLabel: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  occupancyPercentage: {
    fontSize: 14,
    fontWeight: '900',
    minWidth: 40,
    textAlign: 'right',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  notiIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notiContent: {
    flex: 1,
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  notiDesc: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  notiTime: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  // Admin Dashboard Styles
  adminContainer: {
    flex: 1,
  },
  adminScrollContent: {
    paddingTop: 130,
    paddingHorizontal: 24,
  },
  adminHeader: {
    marginBottom: 32,
    marginTop: 20,
  },
  adminContent: {
    // Container for admin cards
  },
  adminSectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  adminHeroCard: {
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroInfo: {
    flex: 1,
    zIndex: 2,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8E8E93',
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '900',
    marginBottom: 20,
    lineHeight: 52,
    paddingVertical: 4,
  },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#32D74B',
  },
  heroIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
  adminStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  adminStatItem: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminStatValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    lineHeight: 34,
  },
  adminStatLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  adminActionCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 40,
  },
  actionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  actionCountContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absIcon: {
    position: 'absolute',
    opacity: 0.1,
  },
  actionCount: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 44,
  },
  actionBtn: {
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '900',
  },
  adminSection: {
    marginBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF453A',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FF453A',
  },
  alertCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  alertDesc: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 16,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FF453A',
  },
  activityList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 16,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
    marginTop: 4,
  },
  activityLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    bottom: -10,
    width: 1,
    backgroundColor: '#333',
    zIndex: 1,
  },
  activityInfo: {
    flex: 1,
    paddingBottom: 24,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    flex: 1,
  },
  modalTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
    marginBottom: 20,
  },
  modalDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
