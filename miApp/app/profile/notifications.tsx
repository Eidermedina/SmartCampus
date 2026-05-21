import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useRole } from '@/hooks/useRole';
import { Modal, Pressable, Alert } from 'react-native';
import { TopNav } from '@/components/smart-campus/TopNav';
import { API_URL } from '@/constants/Config';

const NotificationCard = ({ title, message, time, category, icon, color, isPast }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.notiCard, { backgroundColor: colors.card, borderColor: colors.border }, isPast && { opacity: 0.6 }]}>
      <View style={styles.notiHeader}>
        <View style={[styles.notiIconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.notiMain}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.notiTitle} numberOfLines={1}>{title}</ThemedText>
            <ThemedText style={styles.notiTime}>{time}</ThemedText>
          </View>
          <ThemedText style={styles.notiMessage} numberOfLines={2}>{message}</ThemedText>
          <View style={styles.categoryRow}>
             <View style={[styles.categoryDot, { backgroundColor: color }]} />
             <ThemedText style={[styles.categoryText, { color }]}>{category}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { userName, userId } = useRole();
  const { notifications, markAsRead, deleteNotification, declineInvitation, acceptInvitation } = useNotifications();
  const [selectedNoti, setSelectedNoti] = React.useState<Notification | null>(null);

  const recent = notifications.filter(n => !n.isRead);
  const past = notifications.filter(n => n.isRead);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Notificaciones</ThemedText>
        <ThemedText style={styles.subtitle}>Mantente al día con lo que sucede en tu campus.</ThemedText>

        {recent.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
               <ThemedText style={styles.sectionTitle}>RECIENTES</ThemedText>
               <View style={styles.newBadge}>
                  <ThemedText style={styles.newBadgeText}>{recent.length} NUEVAS</ThemedText>
               </View>
            </View>

            {recent.map(noti => (
              <TouchableOpacity key={noti.id} onPress={() => setSelectedNoti(noti)}>
                <NotificationCard 
                  title={noti.title} 
                  message={noti.description}
                  time={noti.time}
                  category={noti.type?.startsWith('invite_group') ? 'INVITACIÓN' : noti.type?.toUpperCase() || 'INFO'}
                  icon={noti.type === 'success' ? 'checkmark-circle' : noti.type === 'alert' ? 'warning' : noti.type?.startsWith('invite_group') ? 'people-circle' : 'information-circle'}
                  color={noti.type === 'success' ? '#32D74B' : noti.type === 'alert' ? '#FFD60A' : noti.type?.startsWith('invite_group') ? '#BF5AF2' : '#0A84FF'}
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <ThemedText style={[styles.sectionTitle, { marginTop: 40, marginBottom: 20 }]}>PASADAS</ThemedText>
            {past.map(noti => (
              <TouchableOpacity key={noti.id} onPress={() => setSelectedNoti(noti)}>
                <NotificationCard 
                  title={noti.title} 
                  message={noti.description}
                  time={noti.time}
                  category={noti.type?.startsWith('invite_group') ? 'INVITACIÓN' : noti.type?.toUpperCase() || 'INFO'}
                  icon={noti.type === 'success' ? 'checkmark-circle' : noti.type === 'alert' ? 'warning' : noti.type?.startsWith('invite_group') ? 'people-circle' : 'information-circle'}
                  color="#8E8E93"
                  isPast
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
             <Ionicons name="time-outline" size={40} color={colors.text} />
             <ThemedText style={[styles.emptyText, { color: colors.muted }]}>No hay más notificaciones por el momento. Te avisaremos cuando ocurra algo importante.</ThemedText>
          </View>
        )}

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
                  {selectedNoti.type?.startsWith('invite_group:') ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#32D74B' }]}
                        onPress={async () => {
                          const groupId = selectedNoti.type?.split(':')[1] || '';
                          setSelectedNoti(null); // Close modal instantly so they can't click again
                          const ok = await acceptInvitation(selectedNoti.id, groupId);
                          if (ok) {
                            Alert.alert('¡Aceptado!', 'Te has unido al grupo de estudio.');
                          } else {
                            Alert.alert('Error', 'No se pudo aceptar la invitación.');
                          }
                        }}
                      >
                        <ThemedText style={styles.modalBtnText}>Aceptar</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#FF453A' }]}
                        onPress={async () => {
                          const groupId = selectedNoti.type?.split(':')[1] || '';
                          await declineInvitation(selectedNoti.id, groupId);
                          setSelectedNoti(null);
                        }}
                      >
                        <ThemedText style={styles.modalBtnText}>Rechazar</ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  topNavCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarMini: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E1E1E' },
  topNavTitle: { fontSize: 16, fontWeight: '800', color: '#00FF00' },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#8E8E93', lineHeight: 22, fontWeight: '600', marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#8E8E93', letterSpacing: 1 },
  newBadge: { backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  newBadgeText: { fontSize: 9, fontWeight: '900', color: '#00FF00' },
  notiCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  notiHeader: { flexDirection: 'row', gap: 16 },
  notiIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  notiMain: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notiTitle: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  notiTime: { fontSize: 9, fontWeight: '900', color: '#8E8E93' },
  notiMessage: { fontSize: 13, color: '#8E8E93', lineHeight: 18, fontWeight: '500', marginBottom: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { fontSize: 9, fontWeight: '900' },
  emptyContainer: { marginTop: 40, alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', fontSize: 13, marginTop: 16, lineHeight: 18, fontWeight: '600' },
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
});
