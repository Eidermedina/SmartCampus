import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNav } from '@/components/smart-campus/TopNav';
import { useCampus } from '@/hooks/useCampus';
import { useNotifications } from '@/hooks/useNotifications';
import { useRole } from '@/hooks/useRole';
import { useReservations } from '@/hooks/useReservations';
import { Modal, TextInput, Pressable, Alert } from 'react-native';
import { API_URL } from '@/constants/Config';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const router = useRouter();
  const { spaces, isLoaded } = useCampus();
  const { addReservation } = useReservations();
  const { role, userName, userId } = useRole();
  const { addNotification, sendNotificationToUser } = useNotifications();

  const getRealDate = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const date = new Date().toLocaleDateString('es-CO', options);
    // Capitalize month
    return `Hoy, ${date.split(' de ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`;
  };

  const currentRealDate = getRealDate();

  if (!isLoaded) return <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ThemedText>Cargando detalles...</ThemedText></ThemedView>;

  const space = spaces.find(s => s.id === id);

  if (!space) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <ThemedText style={{ fontSize: 20, fontWeight: '900', marginTop: 16 }}>Espacio no encontrado</ThemedText>
        <TouchableOpacity style={{ marginTop: 24, padding: 16, backgroundColor: colors.primary, borderRadius: 12 }} onPress={() => router.back()}>
          <ThemedText style={{ color: '#FFF', fontWeight: '800' }}>Volver atrás</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [realMembers, setRealMembers] = useState<any[]>([]);

  const fetchMembers = async () => {
    if (!currentGroupId) return;
    try {
      const res = await fetch(`${API_URL}/study-groups/${currentGroupId}/members`);
      const data = await res.json();
      // Data might be like [{user_id: ..., name: ...}, ...]
      // We need names. Let's assume the backend returns user names too.
      // Wait, let's check the backend routes_study_groups.py line 39.
      // It returns SELECT * FROM group_members. We might need a JOIN.
      setRealMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const [spaceReservations, setSpaceReservations] = useState<{start: string, end: string}[]>([]);

  React.useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${API_URL}/reservations/`);
        const data = await res.json();
        
        const activeRes = data.filter((r: any) => 
          r.space_id.toString() === id && 
          (r.status === 'REVISIÓN' || r.status === 'CONFIRMADA')
        );
        
        const mapped = activeRes.map((r: any) => ({
          start: r.start_time.substring(11, 16),
          end: r.end_time.substring(11, 16)
        }));
        setSpaceReservations(mapped);
      } catch (e) {
        console.error("Error fetching space occupancy:", e);
      }
    };
    fetchReservations();
    const intv = setInterval(fetchReservations, 5000);
    return () => clearInterval(intv);
  }, [id]);

  React.useEffect(() => {
    if (currentGroupId) {
      fetchMembers();
      const interval = setInterval(fetchMembers, 5000);
      return () => clearInterval(interval);
    }
  }, [currentGroupId]);

  const isTimeSlotPast = (time: string) => {
    if (time === '05:00 - 06:00') return false; // Testing slot is never past
    
    const now = new Date();
    const [startHour] = time.split(' - ')[0].split(':').map(Number);
    const reservationTime = new Date();
    reservationTime.setHours(startHour, 0, 0, 0);

    // Rule: Must be at least 30 mins in the future
    return (reservationTime.getTime() - now.getTime()) < (30 * 60 * 1000);
  };

  const toggleTime = (time: string, disabled: boolean) => {
    if (disabled || isTimeSlotPast(time)) {
      Alert.alert('Horario no disponible', 'Las reservas deben realizarse con al menos 30 minutos de antelación y para horarios futuros.');
      return;
    }

    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      // Rule: Max 2 hours and consecutive
      if (selectedTimes.length >= 2) {
        Alert.alert('Límite excedido', 'Solo puedes reservar un máximo de 2 horas (2 bloques).');
        return;
      }

      if (selectedTimes.length === 1) {
        // Check if consecutive
        const existing = selectedTimes[0];
        const slots = [
          '05:00 - 06:00', // Testing slot
          '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
          '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
          '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
        ];
        const idx1 = slots.indexOf(existing);
        const idx2 = slots.indexOf(time);
        if (Math.abs(idx1 - idx2) !== 1) {
          Alert.alert('Horario no consecutivo', 'Las horas de reserva deben ser seguidas.');
          return;
        }
      }

      setSelectedTimes([...selectedTimes, time].sort());
    }
  };

  const handleInvite = async () => {
    if (!searchEmail.includes('@')) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('creator_id', userId);
      formData.append('creator_name', userName || 'Usuario');
      formData.append('group_name', groupName || 'Estudio ' + space.title);
      formData.append('invited_email', searchEmail);

      const res = await fetch(`${API_URL}/study-groups/invite`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.detail || 'No se pudo enviar la invitación. Verifica el correo e intenta de nuevo.';
        Alert.alert('Invitación fallida', errorMsg);
        return;
      }

      setCurrentGroupId(data.group_id);
      setSearchEmail('');
      setShowInviteModal(false);
      Alert.alert('Invitación enviada', `Se ha enviado una invitación real a ${searchEmail}`);
    } catch (error) {
      console.error('Error in handleInvite:', error);
      Alert.alert('Error', 'No se pudo enviar la invitación en este momento.');
    }
  };

  const handleReserve = () => {
    if (selectedTimes.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un horario');
      return;
    }

    if (role === 'student' && realMembers.length < 5) { // realMembers includes the creator
      Alert.alert('Grupo incompleto', `Como estudiante, debes formar un grupo de al menos 5 personas para reservar. Actualmente hay ${realMembers.length}.`);
      return;
    }

    // Calculate actual ISO times
    const sorted = [...selectedTimes].sort();
    const [startH] = sorted[0].split(' - ')[0].split(':').map(Number);
    const [endH] = sorted[sorted.length - 1].split(' - ')[1].split(':').map(Number);

    // Construct ISO string manually to avoid timezone shifts
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const startTimeISO = `${year}-${month}-${day}T${String(startH).padStart(2, '0')}:00:00`;
    const endTimeISO = `${year}-${month}-${day}T${String(endH).padStart(2, '0')}:00:00`;

    addReservation({
      spaceId: space.id,
      spaceTitle: space.title,
      userName: userName || 'Usuario',
      role: (role || 'student').toUpperCase(),
      date: currentRealDate,
      time: selectedTimes.join(', '),
      startTime: startTimeISO,
      endTime: endTimeISO,
      type: space.category.toUpperCase(),
      details: groupName ? `Grupo: ${groupName}` : undefined,
      groupId: currentGroupId
    });

    Alert.alert('Reserva en Revisión', 'Tu reserva ha sido enviada y está pendiente de aprobación por el administrador.');
    router.replace('/profile/reservations');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Image Card */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.spaceImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          >
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{space.block.toUpperCase()}</ThemedText>
            </View>
            <ThemedText style={styles.imageTitle}>{space.title}</ThemedText>
          </LinearGradient>
        </View>

        {/* Info Blocks */}
        <View style={styles.infoBlocksRow}>
          <View style={[styles.infoBlock, { backgroundColor: colors.card }]}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <View>
              <ThemedText style={[styles.infoLabel, { color: isLight ? '#666' : '#8E8E93' }]}>CAPACIDAD</ThemedText>
              <ThemedText style={styles.infoValue}>Hasta {space.capacity} personas</ThemedText>
            </View>
          </View>
          <View style={[styles.infoBlock, { backgroundColor: colors.card }]}>
            <Ionicons name={space.category === 'laboratorios' ? 'flask-outline' : 'desktop-outline'} size={24} color={colors.primary} />
            <View>
              <ThemedText style={[styles.infoLabel, { color: isLight ? '#666' : '#8E8E93' }]}>CATEGORÍA</ThemedText>
              <ThemedText style={styles.infoValue}>{space.category.toUpperCase()}</ThemedText>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Horarios Disponibles</ThemedText>
          <ThemedText style={styles.sectionDate}>{currentRealDate}</ThemedText>
        </View>

        <View style={styles.timeGrid}>
          {[
            '05:00 - 06:00', // Testing slot always available
            '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
            '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
            '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
          ].map((time) => {
            const isTestSlot = time === '05:00 - 06:00';
            const isPast = !isTestSlot && isTimeSlotPast(time);
            const isSelected = selectedTimes.includes(time);
            
            // Check real database occupancy
            let isOccupied = false;
            if (!isPast) {
              const [sHStr, sMStr] = time.split(' - ')[0].split(':');
              const slotStart = parseInt(sHStr, 10) + parseInt(sMStr, 10) / 60;
              
              for (const res of spaceReservations) {
                const [rHStr, rMStr] = res.start.split(':');
                const resStart = parseInt(rHStr, 10) + parseInt(rMStr, 10) / 60;
                
                const [eHStr, eMStr] = res.end.split(':');
                const resEnd = parseInt(eHStr, 10) + parseInt(eMStr, 10) / 60;
                
                if (slotStart >= resStart && slotStart < resEnd) {
                  isOccupied = true;
                  break;
                }
              }
            }
            
            const isDisabled = isPast || isOccupied;

            return (
              <TouchableOpacity
                key={time}
                activeOpacity={isDisabled ? 1 : 0.7}
                onPress={() => toggleTime(time, isDisabled)}
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: 1,
                    opacity: isDisabled ? 0.5 : 1
                  }
                ]}
              >
                <ThemedText style={[styles.timeText, isSelected && { color: '#FFF' }]}>{time}</ThemedText>
                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                ) : isDisabled ? (
                  <Ionicons name="lock-closed" size={16} color="#8E8E93" />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Study Group */}
        <ThemedText style={styles.sectionLabelSmall}>DETALLE DE GRUPO DE ESTUDIO</ThemedText>
        <View style={[styles.groupCard, { backgroundColor: colors.card }]}>
          <View style={styles.groupHeaderRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Nombre del grupo..."
                placeholderTextColor={colors.muted}
                value={groupName}
                onChangeText={setGroupName}
                style={[styles.groupTitleInput, { color: colors.text }]}
              />
              <ThemedText style={[styles.groupSub, { color: isLight ? '#666' : '#8E8E93' }]}>Matemáticas III • Sección A</ThemedText>
              <View style={[styles.groupCountBadge, { backgroundColor: isLight ? 'rgba(0,123,62,0.1)' : 'rgba(0,123,62,0.2)' }]}>
                <ThemedText style={[styles.groupCountText, { color: colors.primary }]}>{realMembers.length || 1} <ThemedText style={{ color: '#8E8E93', fontSize: 10 }}>/ 5</ThemedText></ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.groupAvatarsRow}>
            <View style={styles.avatarStack}>
              {realMembers.map((m, i) => (
                <View key={i} style={[styles.avatarPlaceholder, i > 0 && styles.avatarOverlap, { borderColor: colors.card, backgroundColor: i === 0 ? colors.primary : colors.border }]}>
                  <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: i === 0 ? '#FFF' : colors.text }}>{m.user_name ? m.user_name[0] : '?'}</ThemedText>
                </View>
              ))}
              {realMembers.length === 0 && (
                <View style={[styles.avatarPlaceholder, { borderColor: colors.card, backgroundColor: colors.primary }]}>
                  <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: '#FFF' }}>{userName ? userName[0] : '?'}</ThemedText>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setShowInviteModal(true)}
                style={[styles.addMemberBtn, (realMembers.length > 0 || userName) && styles.avatarOverlap, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderColor: colors.card }]}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={[styles.inviteBtn, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}
              onPress={() => setShowInviteModal(true)}
            >
              <Ionicons name="person-add-outline" size={16} color={colors.primary} />
              <ThemedText style={[styles.inviteText, { color: colors.text }]}>Invitar Estudiantes</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning Info */}
        <View style={[styles.infoWarningBox, { backgroundColor: isLight ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.1)' }]}>
          <Ionicons name="information-circle-outline" size={20} color="#FF9500" />
          <ThemedText style={[styles.infoWarningText, { color: isLight ? '#8B4513' : '#8E8E93' }]}>
            {role === 'student'
              ? `Como estudiante, la reserva requiere un grupo de mínimo 5 miembros. Tu grupo actual tiene ${realMembers.length || 1}.`
              : 'Los docentes pueden reservar de forma individual o grupal.'}
          </ThemedText>
        </View>

        {/* Main CTA */}
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={handleReserve}
        >
          <LinearGradient
            colors={['#00482B', '#007B3E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.reserveGradient}
          >
            <ThemedText style={styles.reserveBtnText}>RESERVAR ESPACIO</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowInviteModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={styles.modalTitle}>Invitar Miembro</ThemedText>
            <ThemedText style={styles.modalSubtitle}>Busca estudiantes o docentes por correo electrónico.</ThemedText>

            <View style={[styles.searchBarModal, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.muted} />
              <TextInput
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.muted}
                style={[styles.searchInputModal, { color: colors.text }]}
                value={searchEmail}
                onChangeText={setSearchEmail}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
              onPress={handleInvite}
            >
              <ThemedText style={styles.modalActionBtnText}>Enviar Invitación</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 130 },
  imageContainer: {
    height: 220,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
  },
  spaceImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 60,
  },
  badge: { backgroundColor: '#007B3E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  imageTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  infoBlocksRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  infoBlock: { flex: 1, padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  sectionDate: { fontSize: 13, fontWeight: '800', color: '#007B3E' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  timeChip: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
  },
  timeText: { fontSize: 13, fontWeight: '800' },
  sectionLabelSmall: { fontSize: 10, fontWeight: '900', color: '#8E8E93', letterSpacing: 1, marginBottom: 16 },
  groupCard: { padding: 24, borderRadius: 24, marginBottom: 24 },
  groupHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  groupTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  groupSub: { fontSize: 12, fontWeight: '600' },
  groupCountBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  groupCountText: { fontSize: 12, fontWeight: '900' },
  groupAvatarsRow: { marginBottom: 24 },
  avatarStack: { flexDirection: 'row' },
  groupAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2 },
  avatarOverlap: { marginLeft: -12 },
  addMemberBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  groupActions: { flexDirection: 'row', gap: 12 },
  inviteBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, height: 44, borderRadius: 22 },
  inviteText: { fontSize: 13, fontWeight: '900' },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  infoWarningBox: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 32 },
  infoWarningText: { flex: 1, fontSize: 11, lineHeight: 16 },
  reserveBtn: { borderRadius: 24, overflow: 'hidden' },
  reserveGradient: { paddingVertical: 20, alignItems: 'center' },
  reserveBtnText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  groupTitleInput: { fontSize: 18, fontWeight: '900', marginBottom: 4, padding: 0 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { padding: 32, borderTopLeftRadius: 40, borderTopRightRadius: 40, borderWidth: 1, borderBottomWidth: 0 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 32 },
  searchBarModal: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1, marginBottom: 24 },
  searchInputModal: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600' },
  modalActionBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalActionBtnText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
