import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, TextInput, Image, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '@/hooks/useRole';
import { useAppTheme } from '@/hooks/use-theme';
import { TopNav } from '@/components/smart-campus/TopNav';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications, Notification } from '@/hooks/useNotifications';

// --- SHARED COMPONENTS ---

const NotificationCard = ({ title, message, time, icon, color, isPast }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.notiCard, { backgroundColor: colors.card, borderColor: colors.border }, isPast && { opacity: 0.6 }]}>
      <View style={[styles.notiIconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.notiContent}>
        <ThemedText style={styles.notiTitle} numberOfLines={1}>{title}</ThemedText>
        <ThemedText style={styles.notiMessage} numberOfLines={2}>{message}</ThemedText>
        <ThemedText style={[styles.notiTime, { color: isDark ? '#8E8E93' : '#444' }]}>{time}</ThemedText>
      </View>
    </View>
  );
};

const MenuItem = ({ icon, label, onPress }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  return (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }]}>
           <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
    </TouchableOpacity>
  );
};

// --- MAIN SCREEN ---

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { userName, role, logout, userMajor, userStatus, studentId } = useRole();
  const { isDark, toggleTheme, theme } = useAppTheme();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const [selectedNoti, setSelectedNoti] = React.useState<Notification | null>(null);

  const userNotifications = notifications.filter(n => n.userName.toUpperCase() === (userName || '').toUpperCase());

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient 
          colors={isDark ? ['rgba(0,123,62,0.15)', colors.card] : ['rgba(0,123,62,0.05)', colors.card]} 
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={[styles.profileCard, { borderColor: colors.border }]}
        >
          <View style={styles.profileHeader}>
            <View>
              <ThemedText style={[styles.profileLabel, { color: colors.primary }]}>PERFIL DEL {role === 'student' ? 'ESTUDIANTE' : 'DOCENTE'}</ThemedText>
              <ThemedText style={styles.profileName}>{userName}</ThemedText>
              <ThemedText style={styles.profileSub} numberOfLines={1}>{userMajor}</ThemedText>
            </View>
          </View>

          <View style={styles.profileBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}15` }]}>
              <View style={[styles.miniDot, { backgroundColor: colors.primary }]} />
              <ThemedText style={[styles.statusBadgeText, { color: colors.primary }]}>ESTADO {userStatus}</ThemedText>
            </View>
            <View style={[styles.idBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <ThemedText style={styles.idBadgeText}>ID: {studentId}</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Alertas Recientes */}
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={styles.sectionTitle}>Alertas{'\n'}Recientes</ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile/notifications')}>
            <ThemedText style={[styles.markReadText, { color: colors.primary }]}>VER TODAS</ThemedText>
          </TouchableOpacity>
        </View>

        {userNotifications.slice(0, 3).map(noti => (
          <TouchableOpacity key={noti.id} onPress={() => setSelectedNoti(noti)}>
            <NotificationCard 
              icon={noti.type === 'success' ? 'checkmark-circle-outline' : noti.type === 'alert' ? 'warning-outline' : 'information-circle-outline'} 
              color={noti.type === 'success' ? '#32D74B' : noti.type === 'alert' ? '#FFD60A' : '#0A84FF'}
              title={noti.title} 
              message={noti.description} 
              time={noti.time} 
            />
          </TouchableOpacity>
        ))}

        {userNotifications.length === 0 && (
          <ThemedText style={{ color: colors.muted, textAlign: 'center', marginVertical: 20 }}>No tienes alertas recientes.</ThemedText>
        )}

        {/* Apariencia */}
        <ThemedText style={styles.sectionTitleSimple}>Apariencia</ThemedText>
        <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.menuItem, { borderBottomColor: 'transparent' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              </View>
              <View>
                <ThemedText style={styles.menuLabel}>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</ThemedText>
                <ThemedText style={{ fontSize: 11, color: colors.muted, fontWeight: '600' }}>Cambiar apariencia de la app</ThemedText>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'#FFF'}
            />
          </View>
        </View>

        {/* Cuenta y Gobernanza */}
        <ThemedText style={styles.sectionTitleSimple}>Cuenta y Gobernanza</ThemedText>
        
        <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="calendar-outline" label="Mis Reservas" onPress={() => router.push('/profile/reservations')} />
          <MenuItem icon="document-text-outline" label="Mis reportes" onPress={() => router.push('/profile/reports')} />
          <MenuItem icon="help-circle-outline" label="Ayuda y Soporte" onPress={() => {}} />
          <MenuItem icon="options-outline" label="Gestión de Notificaciones" onPress={() => router.push('/profile/notification-settings')} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: `${colors.error}22`, backgroundColor: `${colors.error}11` }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <ThemedText style={[styles.logoutText, { color: colors.error }]}>CERRAR SESIÓN</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Notification Detail Modal */}
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
                      <ThemedText style={styles.modalBtnText}>Marcar como leída</ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: '#FF453A' }]}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 130 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statsMini: { alignItems: 'flex-end' },
  statsValue: { fontSize: 24, fontWeight: '900' },
  statsLabel: { fontSize: 8, fontWeight: '900', color: '#8E8E93', letterSpacing: 0.5 },
  profileCard: { padding: 32, borderRadius: 40, borderWidth: 1, marginBottom: 40 },
  profileLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  profileName: { fontSize: 28, fontWeight: '900', lineHeight: 36, paddingBottom: 4, marginBottom: 4 },
  profileSub: { fontSize: 16, color: '#8E8E93', fontWeight: '600' },
  notiCard: { flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 12, gap: 16 },
  notiIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  notiContent: { flex: 1 },
  notiTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  notiMessage: { fontSize: 13, color: '#8E8E93', lineHeight: 18, marginBottom: 8, fontWeight: '500' },
  notiTime: { fontSize: 10, fontWeight: '900' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '700' },
  profileBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  idBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  idBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: '#8E8E93' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '900', lineHeight: 28 },
  markReadText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textAlign: 'right' },
  sectionTitleSimple: { fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 16 },
  menuContainer: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12, borderRadius: 24, borderWidth: 1, marginTop: 40 },
  logoutText: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', padding: 24, borderRadius: 32, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '900', flex: 1 },
  modalTime: { fontSize: 12, color: '#8E8E93', fontWeight: '700', marginBottom: 20 },
  modalDesc: { fontSize: 15, lineHeight: 22, marginBottom: 32, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
});
