import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch, Modal, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TopNav } from '@/components/smart-campus/TopNav';
import { API_URL } from '@/constants/Config';
import axios from 'axios';

const UserCard = ({ name, id, role, status, email, onToggleStatus, loading }: any) => {
  const isDocente = role?.toUpperCase() === 'TEACHER';
  const isAdmin = role?.toUpperCase() === 'ADMIN';
  const isActive = status === 'active';
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[
      styles.userCard,
      { backgroundColor: colors.card, borderColor: colors.border },
      !isActive && { borderColor: colors.error + '40' } // Borde rojo suave si bloqueado
    ]}>
      <View style={styles.userAvatarContainer}>
        <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', opacity: isActive ? 1 : 0.5 }]}>
          <ThemedText style={{ color: colors.primary, fontWeight: '900', fontSize: 24 }}>{name?.charAt(0)}</ThemedText>
        </View>
        <View style={[styles.userStatusDot, { backgroundColor: isActive ? colors.success : colors.error, borderColor: colors.card }]} />
      </View>
      {/* Solo la info se atenúa, el switch siempre al 100% */}
      <View style={[styles.userInfo, !isActive && { opacity: 0.6 }]}>
        <ThemedText style={styles.userNameText}>{name}</ThemedText>
        <ThemedText style={styles.userEmailText}>{email}</ThemedText>
        <View style={styles.userBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? `${colors.error}15` : isDocente ? `${colors.accent}15` : `${colors.primary}15` }]}>
            <ThemedText style={[styles.roleBadgeText, { color: isAdmin ? colors.error : isDocente ? colors.accent : colors.primary }]}>
              {role?.toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.miniDot, { backgroundColor: isActive ? colors.success : colors.error }]} />
            <ThemedText style={[styles.statusLabelText, !isActive && { color: colors.error, fontWeight: '900' }]}>{isActive ? 'ACTIVO' : 'BLOQUEADO'}</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        {!isAdmin && (
          <Switch
            trackColor={{ false: colors.error + '60', true: colors.success + '80' }}
            thumbColor={isActive ? colors.success : colors.error}
            ios_backgroundColor={colors.error + '40'}
            onValueChange={() => onToggleStatus(id, name, isActive)}
            value={isActive}
            disabled={loading}
          />
        )}
      </View>
    </View>
  );
};

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos los Usuarios');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  // Create account modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    identification_number: '',
    email: '',
    password: '',
    role: 'student',
    major: '',
  });

  const resetForm = () => setForm({ first_name: '', last_name: '', identification_number: '', email: '', password: '', role: 'student', major: '' });

  const handleCreateAccount = async () => {
    const { first_name, last_name, identification_number, email, password, role, major } = form;
    if (!first_name || !last_name || !identification_number || !email || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    setCreating(true);
    try {
      const data = new FormData();
      data.append('first_name', first_name.trim());
      data.append('last_name', last_name.trim());
      data.append('identification_number', identification_number.trim());
      data.append('email', email.trim().toLowerCase());
      data.append('password', password);
      data.append('role', role);
      if (major) data.append('major', major.trim());

      const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', body: data });
      const json = await res.json();

      if (!res.ok) throw new Error(json.detail || 'Error al crear la cuenta');

      Alert.alert('✅ Cuenta creada', `La cuenta de ${first_name} ${last_name} fue creada exitosamente.`);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la cuenta.');
    } finally {
      setCreating(false);
    }
  };

  const usersRef = React.useRef(users);
  usersRef.current = users;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      if (JSON.stringify(data) !== JSON.stringify(usersRef.current)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 8000);
    return () => clearInterval(interval);
  }, []);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, name: string, currentlyActive: boolean) => {
    if (updatingId) return;

    // Confirm action
    Alert.alert(
      currentlyActive ? "Bloquear Usuario" : "Activar Usuario",
      `¿Estás seguro de que deseas ${currentlyActive ? 'bloquear' : 'activar'} a ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setUpdatingId(userId);
            const newStatus = currentlyActive ? 'inactive' : 'active';

            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));

            try {
              const res = await axios.put(`${API_URL}/admin/users/${userId}/toggle-status`);

              if (res.status !== 200) {
                throw new Error('Error al actualizar el estado en el servidor');
              }

              Alert.alert("Éxito", `El usuario ${name} ha sido ${currentlyActive ? 'bloqueado' : 'activado'} correctamente.`);
            } catch (err: any) {
              console.error("Error toggling user status:", err);
              // Revert
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: currentlyActive ? 'active' : 'inactive' } : u));
              Alert.alert("Error", err.message || "No se pudo actualizar el estado.");
            } finally {
              setUpdatingId(null);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => {
    const fullName = u.full_name || '';
    const email = u.email || '';
    const role = u.role || '';

    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Todos los Usuarios') return true;
    if (activeFilter === 'Estudiantes' && role.toLowerCase() === 'student') return true;
    if (activeFilter === 'Docentes' && role.toLowerCase() === 'teacher') return true;
    if (activeFilter === 'Admin' && role.toLowerCase() === 'admin') return true;
    return false;
  });

  return (
    <ThemedView style={styles.container}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.adminHeader}>
          <ThemedText style={styles.adminHeaderTitle}>Gestión de Usuarios</ThemedText>
          <ThemedText style={styles.adminHeaderSub}>Supervisa la identidad del campus y el control de acceso.</ThemedText>
        </View>

        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.muted} />
            <TextInput
              placeholder="Buscar por nombre o email..."
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          {['Todos los Usuarios', 'Estudiantes', 'Docentes', 'Admin'].map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterChip,
                activeFilter === f && { backgroundColor: isLight ? colors.primary : colors.accent }
              ]}
            >
              <Ionicons
                name="filter"
                size={16}
                color={activeFilter === f ? (isLight ? "#FFF" : "#000") : colors.muted}
                style={{ marginRight: 8 }}
              />
              <ThemedText style={[styles.filterChipText, activeFilter === f && { color: isLight ? '#FFF' : '#000' }]}>{f}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.counterRow}>
          <ThemedText style={styles.counterLabel}>REGISTRO DE IDENTIDAD</ThemedText>
          <ThemedText style={[styles.counterValue, { color: colors.primary }]}>{filteredUsers.length} encontrados</ThemedText>
        </View>

        <View style={styles.userList}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            filteredUsers.map(u => (
              <UserCard
                key={u.id}
                id={u.id}
                name={u.full_name}
                email={u.email}
                role={u.role}
                status={u.status}
                onToggleStatus={handleToggleStatus}
                loading={updatingId === u.id}
              />
            ))
          )}
          {!loading && filteredUsers.length === 0 && (
            <ThemedText style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No se encontraron usuarios.</ThemedText>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add" size={24} color={isLight ? "#FFF" : "#000"} />
      </TouchableOpacity>

      {/* Create Account Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
            <Pressable style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Crear Nueva Cuenta</ThemedText>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
                {[
                  { key: 'first_name', label: 'Nombre *', placeholder: 'Ej: Juan' },
                  { key: 'last_name', label: 'Apellido *', placeholder: 'Ej: Pérez' },
                  { key: 'identification_number', label: 'N° Identificación *', placeholder: 'Ej: 1234567890' },
                  { key: 'email', label: 'Correo electrónico *', placeholder: 'usuario@udec.edu.co' },
                  { key: 'password', label: 'Contraseña *', placeholder: 'Mínimo 6 caracteres' },
                  { key: 'major', label: 'Carrera / Departamento', placeholder: 'Ej: Ingeniería de Sistemas' },
                ].map(({ key, label, placeholder }) => (
                  <View key={key}>
                    <ThemedText style={styles.formLabel}>{label}</ThemedText>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder={placeholder}
                      placeholderTextColor={colors.muted}
                      value={(form as any)[key]}
                      onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
                      secureTextEntry={key === 'password'}
                      autoCapitalize={key === 'email' ? 'none' : 'words'}
                      keyboardType={key === 'email' ? 'email-address' : key === 'identification_number' ? 'numeric' : 'default'}
                    />
                  </View>
                ))}

                <View>
                  <ThemedText style={styles.formLabel}>Rol *</ThemedText>
                  <View style={styles.roleRow}>
                    {['student', 'teacher', 'admin'].map(r => (
                      <TouchableOpacity
                        key={r}
                        onPress={() => setForm(prev => ({ ...prev, role: r }))}
                        style={[styles.roleChip, form.role === r && { backgroundColor: colors.primary }]}
                      >
                        <ThemedText style={[styles.roleChipText, form.role === r && { color: '#FFF' }]}>
                          {r === 'student' ? 'Estudiante' : r === 'teacher' ? 'Docente' : 'Admin'}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }, creating && { opacity: 0.6 }]}
                  onPress={handleCreateAccount}
                  disabled={creating}
                >
                  {creating
                    ? <ActivityIndicator color="#FFF" />
                    : <ThemedText style={styles.submitBtnText}>Crear Cuenta</ThemedText>
                  }
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 130 },
  adminHeader: { marginBottom: 32 },
  adminHeaderTitle: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
  adminHeaderSub: { fontSize: 14, color: '#8E8E93', lineHeight: 20, fontWeight: '600' },
  searchSection: { marginBottom: 24 },
  searchBar: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600' },
  filterRow: { marginBottom: 32, marginHorizontal: -24 },
  filterContent: { paddingHorizontal: 24, gap: 12 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: 'rgba(150,150,150,0.1)' },
  filterChipText: { fontSize: 13, fontWeight: '800' },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  counterLabel: { fontSize: 10, fontWeight: '900', color: '#8E8E93', letterSpacing: 1 },
  counterValue: { fontSize: 12, fontWeight: '800', lineHeight: 18 },
  userList: { gap: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 32, gap: 16, borderWidth: 1 },
  userAvatarContainer: { width: 60, height: 60, position: 'relative' },
  userAvatar: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  userStatusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, zIndex: 10 },
  userInfo: { flex: 1 },
  userNameText: { fontSize: 18, fontWeight: '800', marginBottom: 2, lineHeight: 24 },
  userEmailText: { fontSize: 12, color: '#8E8E93', marginBottom: 8, fontWeight: '600' },
  userBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 9, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabelText: { fontSize: 10, color: '#8E8E93', fontWeight: '700' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionIconButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  formLabel: { fontSize: 11, fontWeight: '900', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 6 },
  formInput: { height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.12)' },
  roleChipText: { fontSize: 13, fontWeight: '800' },
  submitBtn: { height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitBtnText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
