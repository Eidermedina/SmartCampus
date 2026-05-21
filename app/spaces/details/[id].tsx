import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/constants/Config';
import { useReservations } from '@/hooks/useReservations';
import { TopNav } from '@/components/smart-campus/TopNav';
import { useRole } from '@/hooks/useRole';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { updateStatus } = useReservations();
  const { userId, role } = useRole();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/reservations/${id}`);
      const data = await res.json();
      setReservation(data);
      if (data.group_name) setNewGroupName(data.group_name);
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

  const isCreator = userId === String(reservation?.user_id);

  const handleEditGroup = async () => {
    if (isEditingGroup) {
      if (!newGroupName.trim()) {
        Alert.alert('Error', 'El nombre del grupo no puede estar vacío');
        return;
      }
      try {
        const formData = new FormData();
        formData.append('name', newGroupName.trim());
        const res = await fetch(`${API_URL}/study-groups/${reservation.group_id}`, {
          method: 'PUT',
          body: formData,
        });
        if (res.ok) {
          setReservation({ ...reservation, group_name: newGroupName.trim() });
        }
      } catch (error) {
        console.error(error);
      }
    }
    setIsEditingGroup(!isEditingGroup);
  };

  const handleRemoveMember = async (memberUserId: string) => {
    Alert.alert('Confirmar', '¿Estás seguro de que deseas eliminar a este integrante del grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_URL}/study-groups/${reservation.group_id}/members/${memberUserId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            fetchDetails();
          }
        } catch (error) {
          console.error(error);
        }
      }}
    ]);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }
    if (!reservation?.group_id) {
      Alert.alert('Error', 'No se encontró un grupo activo para esta reserva.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('creator_id', userId!);
      formData.append('creator_name', reservation.user_name || '');
      formData.append('group_name', reservation.group_name || '');
      formData.append('group_id', String(reservation.group_id));
      formData.append('invited_email', inviteEmail.trim().toLowerCase());
      
      const res = await fetch(`${API_URL}/study-groups/invite`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error al invitar', data.detail || `Error ${res.status}: No se pudo enviar la invitación`);
      } else {
        Alert.alert('✅ Invitación enviada', 'El usuario recibirá una notificación para unirse al grupo.');
        setInviteModalVisible(false);
        setInviteEmail('');
      }
    } catch (error: any) {
      console.error('Invite error:', error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    }
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
            <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
                {isCreator && isEditingGroup ? (
                  <TextInput
                    style={[styles.editGroupInput, { color: colors.text, borderColor: colors.border }]}
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    autoFocus
                  />
                ) : (
                  <ThemedText style={[styles.sectionTitle, { flex: 1 }]} numberOfLines={1}>Grupo: {reservation.group_name}</ThemedText>
                )}
              </View>
              {isCreator && (
                <TouchableOpacity onPress={handleEditGroup} style={styles.editBtn}>
                  <Ionicons name={isEditingGroup ? "checkmark" : "pencil"} size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.membersList}>
              {reservation.members?.map((member: any, idx: number) => (
                <View key={idx} style={[styles.memberRow, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                    <ThemedText style={styles.memberMajor}> - {member.major || 'Invitado'}</ThemedText>
                  </View>
                  {isCreator && String(member.user_id) !== userId && (
                    <TouchableOpacity onPress={() => handleRemoveMember(member.user_id)} style={styles.removeBtn}>
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {isCreator && (
              <TouchableOpacity style={styles.addMemberBtn} onPress={() => setInviteModalVisible(true)}>
                <Ionicons name="person-add-outline" size={16} color={colors.primary} />
                <ThemedText style={[styles.addMemberText, { color: colors.primary }]}>Agregar integrante</ThemedText>
              </TouchableOpacity>
            )}
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
        {role === 'admin' && reservation.status === 'PENDIENTE' && (
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

      {/* Invite Modal */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Invitar Integrante</ThemedText>
              <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.modalSubtitle, { color: '#8E8E93' }]}>
              Ingresa el correo electrónico del usuario que deseas agregar al grupo de estudio.
            </ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#8E8E93"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary, height: 50, borderRadius: 12, marginTop: 16 }]} 
              onPress={handleInviteMember}
            >
              <ThemedText style={[styles.actionBtnText, { color: '#000', fontSize: 14 }]}>ENVIAR INVITACIÓN</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  editGroupInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  editBtn: {
    padding: 6,
  },
  removeBtn: {
    padding: 6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addMemberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 48,
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
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
