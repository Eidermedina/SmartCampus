import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, TextInput, Image } from 'react-native';
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

// --- SHARED COMPONENTS ---

const NotificationItem = ({ icon, title, message, time, color }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.notiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

// --- ADMIN COMPONENTS ---

const UserCard = ({ name, id, role, status, image }: any) => {
  const isDocente = role === 'DOCENTE';
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.userAvatarContainer}>
        <Image source={{ uri: image }} style={styles.userAvatar} />
        <View style={[styles.userStatusDot, { backgroundColor: status === 'Activo' ? colors.success : colors.error, borderColor: colors.card }]} />
      </View>
      <View style={styles.userInfo}>
        <ThemedText style={styles.userNameText}>{name}</ThemedText>
        <ThemedText style={styles.userIdText}>ID: {id}</ThemedText>
        <View style={styles.userBadgeRow}>
          <View style={[styles.roleBadge, { backgroundColor: isDocente ? `${colors.error}15` : `${colors.success}15` }]}>
            <ThemedText style={[styles.roleBadgeText, { color: isDocente ? colors.error : colors.success }]}>{role}</ThemedText>
          </View>
          <View style={styles.statusRow}>
             <View style={[styles.miniDot, { backgroundColor: status === 'Activo' ? colors.success : colors.error }]} />
             <ThemedText style={styles.statusLabelText}>{status}</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={[styles.actionIconButton, { backgroundColor: `${colors.text}05` }]}><Ionicons name="create-outline" size={20} color={colors.text} /></TouchableOpacity>
        <TouchableOpacity style={[styles.actionIconButton, { backgroundColor: `${colors.text}05` }]}><Ionicons name="ellipsis-vertical" size={20} color={colors.text} /></TouchableOpacity>
      </View>
    </View>
  );
};

const AdminProfileScreen = () => {
  const [activeFilter, setActiveFilter] = useState('Todos los Usuarios');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

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
                placeholder="Buscar por nombre, ID o email..." 
                placeholderTextColor={colors.muted} 
                style={[styles.searchInput, { color: colors.text }]} 
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
          <ThemedText style={[styles.counterValue, { color: colors.primary }]}>1,284 total</ThemedText>
        </View>

        <View style={styles.userList}>
          <UserCard 
            name="Elena Rodriguez" 
            id="2024-8842" 
            role="ESTUDIANTE" 
            status="Activo" 
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop" 
          />
          <UserCard 
            name="Dr. Marcus Thorne" 
            id="FAC-1052" 
            role="DOCENTE" 
            status="Activo" 
            image="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" 
          />
          <UserCard 
            name="Julian Chen" 
            id="2022-3310" 
            role="ESTUDIANTE" 
            status="Suspendido" 
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
          />
          <UserCard 
            name="Sarah Miller" 
            id="FAC-1099" 
            role="DOCENTE" 
            status="Activo" 
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <Ionicons name="person-add" size={24} color={isLight ? "#FFF" : "#000"} />
      </TouchableOpacity>
    </ThemedView>
  );
};

// --- MAIN SCREEN ---

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { userName, role, logout, userMajor, userStatus, studentId } = useRole();
  const { isDark, toggleTheme } = useAppTheme();

  if (role === 'admin') return <AdminProfileScreen />;

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
          <ThemedText style={[styles.profileLabel, { color: colors.primary }]}>PERFIL DEL {role === 'student' ? 'ESTUDIANTE' : 'DOCENTE'}</ThemedText>
          <ThemedText style={styles.profileName} numberOfLines={1}>{userName}</ThemedText>
          <ThemedText style={styles.profileSub} numberOfLines={1}>{userMajor}</ThemedText>

          <View style={styles.profileBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(0,123,62,0.2)' : 'rgba(0,123,62,0.1)' }]}>
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
          <TouchableOpacity>
            <ThemedText style={[styles.markReadText, { color: colors.primary }]}>MARCAR TODO COMO{'\n'}LEÍDO</ThemedText>
          </TouchableOpacity>
        </View>

        <NotificationItem 
          icon="calendar-outline" 
          color="#E57373" 
          title="Clase Cancelada" 
          message="Mecánica de Fluidos para hoy a las 14:00 ha sido cancelada por el Prof. Miller." 
          time="HACE 2 HORAS" 
        />
        <NotificationItem 
          icon="document-text-outline" 
          color="#81C784" 
          title="Calificación Publicada" 
          message="Tu calificación final para 'Diseño Estructural' ya está disponible." 
          time="HACE 5 HORAS" 
        />
        <NotificationItem 
          icon="notifications-outline" 
          color="#81C784" 
          title="Recordatorio de Evento" 
          message="La Feria de Carrera Anual comienza en 30 minutos en el Patio Central." 
          time="AYER" 
        />

        <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/profile/notifications')}>
          <ThemedText style={[styles.viewAllText, { color: colors.primary }]}>Ver notificaciones</ThemedText>
        </TouchableOpacity>

        {/* Cuenta y Gobernanza */}
        <ThemedText style={styles.sectionTitleSimple}>Cuenta y Gobernanza</ThemedText>
        
        <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="phone-portrait-outline" label="Mis Reservas" onPress={() => router.push('/profile/reservations')} />
          <MenuItem icon="document-text-outline" label="Mis reportes" onPress={() => router.push('/profile/reports')} />
          <MenuItem icon="help-circle-outline" label="Ayuda y Soporte" onPress={() => {}} />
          <MenuItem icon="options-outline" label="Gestion de Notificaciones" onPress={() => router.push('/profile/notification-settings')} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: `${colors.error}22`, backgroundColor: `${colors.error}11` }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <ThemedText style={[styles.logoutText, { color: colors.error }]}>CERRAR SESIÓN</ThemedText>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 130 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '800' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  profileCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  profileCard: { padding: 32, borderRadius: 40, borderWidth: 1, marginBottom: 40 },
  profileLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  profileName: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
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
  viewAllBtn: { marginVertical: 8, paddingVertical: 8 },
  viewAllText: { fontSize: 14, fontWeight: '800' },
  sectionTitleSimple: { fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 16 },
  menuContainer: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12, borderRadius: 24, borderWidth: 1, marginTop: 40 },
  logoutText: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  // ADMIN STYLES
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
  userAvatar: { width: 60, height: 60, borderRadius: 30 },
  userStatusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  userInfo: { flex: 1 },
  userNameText: { fontSize: 18, fontWeight: '800', marginBottom: 2, lineHeight: 24 },
  userIdText: { fontSize: 12, color: '#8E8E93', marginBottom: 8, fontWeight: '600' },
  userBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 9, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabelText: { fontSize: 10, color: '#8E8E93', fontWeight: '700' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionIconButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007B3E', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#007B3E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
});
