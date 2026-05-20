import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Switch } from 'react-native';
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
      !isActive && { opacity: 0.6 } // Atenuar si está bloqueado
    ]}>
      <View style={styles.userAvatarContainer}>
        <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText style={{ color: colors.primary, fontWeight: '900', fontSize: 24 }}>{name?.charAt(0)}</ThemedText>
        </View>
        <View style={[styles.userStatusDot, { backgroundColor: isActive ? colors.success : colors.error, borderColor: colors.card }]} />
      </View>
      <View style={styles.userInfo}>
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
            <ThemedText style={styles.statusLabelText}>{isActive ? 'ACTIVO' : 'BLOQUEADO'}</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        {!isAdmin && (
          <Switch
            trackColor={{ false: '#767577', true: colors.success + '80' }}
            thumbColor={isActive ? colors.success : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
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

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Ionicons name="person-add" size={24} color={isLight ? "#FFF" : "#000"} />
      </TouchableOpacity>
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
});
