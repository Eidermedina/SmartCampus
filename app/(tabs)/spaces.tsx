import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TopNav } from '@/components/smart-campus/TopNav';
import { useRole } from '@/hooks/useRole';
import { useCampus } from '@/hooks/useCampus';
export type SpaceStatus = 'available' | 'occupied' | 'maintenance';

type CategoryType = 'salones' | 'laboratorios' | 'auditorio' | 'canchas';
type BlockType = 'Bloque A' | 'Bloque D';

// --- SHARED COMPONENTS ---

const SpaceCategory = ({ 
  title, subtitle, icon, color, isActive, onPress 
}: { 
  title: string, subtitle: string, icon: any, color: string, isActive: boolean, onPress: () => void
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.categoryCard, 
        { backgroundColor: isActive ? `${colors.primary}20` : colors.card, borderColor: isActive ? colors.primary : colors.border }
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)' }]}>
        <Ionicons name={icon} size={24} color={isActive ? colors.primary : color} />
      </View>
      <ThemedText style={[styles.categoryTitle, isActive && { color: colors.primary }]}>{title}</ThemedText>
      <ThemedText style={[styles.categorySubtitle, { color: isActive ? colors.primary : color }]}>{subtitle}</ThemedText>
    </TouchableOpacity>
  );
};

const SpaceItem = ({ title, capacity, category, status, imageUrl, onPress, isActive }: { title: string, capacity: string, category: string, status: string, imageUrl?: string, onPress: () => void, isActive: boolean }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isAvailable = status === 'available' && isActive !== false;
  
  const getIcon = () => {
    switch(category) {
      case 'laboratorios': return 'flask';
      case 'auditorio': return 'megaphone';
      case 'canchas': return 'football';
      default: return 'easel';
    }
  };

  const getStatusColor = () => {
    if (isActive === false) return colors.error;
    if (status === 'available') return colors.success;
    if (status === 'occupied') return colors.error;
    return '#FF9500'; // Maintenance
  };
  return (
    <View style={[styles.spaceItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: isActive === false ? 0.8 : 1 }]}>
      <View style={styles.spaceLeft}>
        <View style={styles.imagePlaceholder}>
          {imageUrl ? (
             <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          ) : (
             <Ionicons name={getIcon()} size={22} color={colors.primary} />
          )}
        </View>
        <View style={styles.spaceInfo}>
          <View style={styles.spaceHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={styles.spaceTitle} numberOfLines={1}>{title}</ThemedText>
          </View>
          <ThemedText style={styles.spaceCapacity} numberOfLines={1}>
            Capacidad: {capacity} • {isActive === false ? 'BLOQUEADO' : status.toUpperCase()}
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.apartarBtn, { backgroundColor: isAvailable ? colors.primary : colors.muted, opacity: isAvailable ? 1 : 0.6 }]} 
        onPress={onPress}
        disabled={!isAvailable}
      >
        <ThemedText style={styles.apartarBtnText}>
          {isActive === false ? 'Bloqueado' : (isAvailable ? 'Apartar' : 'Ocupado')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

// --- ADMIN COMPONENTS ---

const AdminSpaceCard: React.FC<{
  id: string;
  title: string;
  location: string;
  capacity?: string;
  occupancy?: string;
  status: SpaceStatus;
  statusLabel?: string;
  tag?: string;
  message?: string;
  type: 'image' | 'icon' | 'details';
  icon?: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onToggle?: () => void;
}> = ({ id, title, location, capacity, occupancy, status, statusLabel, tag, message, type, icon, onToggle, isActive }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  const getStatusColor = () => {
    if (isActive) return colors.success;
    return colors.error;
  };

  const getStatusText = () => {
    if (isActive) return 'HABILITADO';
    return 'DESHABILITADO';
  };

  return (
    <View style={[styles.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {type === 'image' && (
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop' }} style={styles.cardImage} />
          <View style={styles.cardOverlay}>
            <View style={styles.statusBadgeOverlay}>
              <View style={[styles.toggleDot, { backgroundColor: getStatusColor() }]} />
              <ThemedText style={styles.statusBadgeText}>{getStatusText()}</ThemedText>
            </View>
          </View>
        </View>
      )}
      <View style={styles.cardMainContent}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            {type !== 'image' && (
              <View style={styles.iconRow}>
                 <View style={[styles.iconBox, { backgroundColor: `${getStatusColor()}15` }]}>
                    <Ionicons name={icon || 'business'} size={20} color={getStatusColor()} />
                 </View>
                 {tag && (
                   <View style={[styles.tagBadge, { backgroundColor: `${colors.primary}15` }]}><ThemedText style={[styles.tagText, { color: colors.primary }]}>{tag}</ThemedText></View>
                 )}
              </View>
            )}
            <ThemedText style={styles.adminCardTitle}>{title}</ThemedText>
            <ThemedText style={styles.adminCardLocation}>{location} • Capacidad: {capacity}</ThemedText>
          </View>
          <View style={styles.statusToggleContainer}>
             <ThemedText style={styles.toggleLabel}>{statusLabel || getStatusText()}</ThemedText>
              <TouchableOpacity onPress={() => {
                if (onToggle) onToggle();
              }}>
                <Ionicons name={isActive ? "toggle" : "toggle-outline"} size={32} color={getStatusColor()} />
              </TouchableOpacity>
          </View>
        </View>
        {message && (
          <View style={[styles.cardMessageContainer, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}>
             <Ionicons name="time-outline" size={14} color={colors.muted} />
             <ThemedText style={styles.cardMessageText}>{message}</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

// --- SCREENS ---

const AdminSpacesScreen = () => {
  const { spaces, toggleSpaceActive, isLoaded } = useCampus();
  const [activeFilter, setActiveFilter] = useState('Todas las Áreas');
  const router = useRouter();

  if (!isLoaded) return <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ThemedText>Cargando panel...</ThemedText></ThemedView>;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  const renderStatsHeader = (title: string, subtitle: string = 'ESTADO GLOBAL') => {
    const totalSpaces = spaces.length;
    const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

    return (
      <View style={styles.adminHeaderSection}>
        <ThemedText style={[styles.adminSectionLabel, { color: colors.primary }]}>{subtitle}</ThemedText>
        <ThemedText style={styles.adminTitle}>{title}</ThemedText>
        <View style={styles.topStatsRow}>
          <View style={[styles.bigStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={styles.bigStatLabel}>CAPACIDAD</ThemedText>
            <ThemedText style={styles.bigStatValue}>{occupancyRate}%</ThemedText>
            <ThemedText style={styles.bigStatSub}>Uso Actual</ThemedText>
          </View>
          <View style={[styles.bigStatCard, { backgroundColor: isLight ? colors.primary : colors.accent, borderWidth: 0 }]}>
            <ThemedText style={[styles.bigStatLabel, { color: isLight ? '#FFF' : '#000' }]}>ZONAS ACTIVAS</ThemedText>
            <ThemedText style={[styles.bigStatValue, { color: isLight ? '#FFF' : '#000' }]}>{spaces.filter(s => s.status === 'available').length}</ThemedText>
            <ThemedText style={[styles.bigStatSub, { color: isLight ? '#FFF' : '#000' }]}>Habilitadas</ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersContent}>
      {['Todas las Áreas', 'Auditorios', 'Laboratorios', 'Salones', 'Canchas'].map(f => (
        <TouchableOpacity 
          key={f} 
          onPress={() => setActiveFilter(f)} 
          style={[
            styles.filterPill, 
            { backgroundColor: activeFilter === f ? (isLight ? colors.primary : colors.accent) : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)') }
          ]}
        >
          <ThemedText style={[
            styles.filterPillText, 
            { color: activeFilter === f ? (isLight ? '#FFF' : '#000') : (isLight ? '#666' : '#8E8E93') }
          ]}>{f}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const filteredSpaces = spaces.filter(s => {
    if (activeFilter === 'Todas las Áreas') return true;
    const catMap: { [key: string]: string } = {
      'Auditorios': 'auditorio',
      'Laboratorios': 'laboratorios',
      'Salones': 'salones',
      'Canchas': 'canchas'
    };
    return s.category === catMap[activeFilter];
  });

  return (
    <ThemedView style={styles.container}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.adminHeaderSection}>
            <ThemedText style={styles.adminSectionLabel}>RESUMEN DE INSTALACIONES</ThemedText>
            <ThemedText style={styles.adminTitle}>Espacios del Campus</ThemedText>
            <View style={styles.managersRow}>
              <View style={styles.avatarStack}><View style={styles.avatar}><ThemedText style={styles.avatarText}>AD</ThemedText></View><View style={[styles.avatar, { marginLeft: -10, backgroundColor: colors.primary }]}><ThemedText style={styles.avatarText}>SM</ThemedText></View></View>
              <ThemedText style={styles.managersText}>2 Gestores en línea</ThemedText>
            </View>
          </View>
          {renderFilters()}
          <View style={styles.adminList}>
            {filteredSpaces.map(s => (
              <TouchableOpacity key={s.id} onPress={() => router.push(`/spaces/${s.id}`)}>
                <AdminSpaceCard 
                  id={s.id}
                  type={s.category === 'auditorio' ? 'image' : 'icon'} 
                  title={s.title} 
                  location={s.block} 
                  capacity={s.capacity}
                  status={s.status} 
                  isActive={s.isActive}
                  icon={s.category === 'laboratorios' ? 'flask-outline' : 'business-outline'}
                  onToggle={() => toggleSpaceActive(s.id)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
};

export default function SpacesScreen() {
  const { role, userName } = useRole();
  const { spaces, isLoaded } = useCampus();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('salones');
  const [selectedBlock, setSelectedBlock] = useState<string>('Bloque A');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  if (!isLoaded) return <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ThemedText>Cargando espacios...</ThemedText></ThemedView>;

  if (role === 'admin') return <AdminSpacesScreen />;

  const blocks = Array.from(new Set(spaces.filter(s => s && s.category === 'salones').map(s => s.block)));
  const availableFloors = Array.from(new Set(
    spaces.filter(s => s && s.category === 'salones' && s.block === selectedBlock && s.floor !== undefined)
          .map(s => s.floor)
  )).sort((a: any, b: any) => a - b) as number[];

  const filtered = spaces.filter(s => {
    if (!s) return false;
    if (searchText) {
      return s.title.toLowerCase().includes(searchText.toLowerCase());
    }
    if (s.category !== selectedCategory) return false;
    
    if (selectedCategory === 'salones') {
      if (s.block !== selectedBlock) return false;
      if (availableFloors.length > 0 && s.floor !== selectedFloor) return false;
    }
    return true;
  });

  const handleReserve = (space: any) => {
     router.push(`/spaces/${space.id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><ThemedText style={styles.title}>Explorador de Espacios</ThemedText><ThemedText style={styles.subtitle}>Encuentra tu lugar ideal para estudiar.</ThemedText></View>
        <View style={styles.searchSection}><View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="search" size={20} color="#8E8E93" /><TextInput placeholder="Buscar..." placeholderTextColor="#8E8E93" style={styles.searchInput} value={searchText} onChangeText={setSearchText} /></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow} contentContainerStyle={styles.categoriesContent}>
          {(['salones', 'laboratorios', 'auditorio', 'canchas'] as CategoryType[]).map(cat => (
            <SpaceCategory key={cat} title={cat.charAt(0).toUpperCase() + cat.slice(1)} subtitle="DISPONIBLE" icon={cat === 'salones' ? 'business' : cat === 'laboratorios' ? 'flask' : cat === 'auditorio' ? 'megaphone' : 'football'} color={colors.primary} isActive={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
          ))}
        </ScrollView>
        {selectedCategory === 'salones' && (
          <View style={styles.subFiltersContainer}>
            <View style={styles.modalSubFilterRow}>
              {blocks.map(b => (
                <TouchableOpacity
                  key={b}
                  onPress={() => { 
                    setSelectedBlock(b); 
                    const firstFloor = spaces.find(s => s.category === 'salones' && s.block === b && s.floor !== undefined)?.floor || 1;
                    setSelectedFloor(firstFloor);
                  }}
                  style={[styles.modalSubBtn, selectedBlock === b && { borderColor: colors.primary }]}
                >
                  <ThemedText style={[styles.modalSubText, selectedBlock === b && { color: colors.primary }]}>{b}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {availableFloors.length > 0 && (
              <View style={[styles.modalSubFilterRow, { marginTop: 12 }]}>
                {availableFloors.map(floor => (
                  <TouchableOpacity
                    key={floor}
                    onPress={() => setSelectedFloor(floor)}
                    style={[styles.modalSubBtn, selectedFloor === floor && { borderColor: colors.primary }]}
                  >
                    <ThemedText style={[styles.modalSubText, selectedFloor === floor && { color: colors.primary }]}>Piso {floor}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        <View style={styles.resultsList}>
          {filtered.map((s) => (
            <SpaceItem 
              key={s.id} 
              title={s.title} 
              capacity={s.capacity} 
              category={s.category} 
              status={s.status}
              imageUrl={s.imageUrl}
              isActive={s.isActive}
              onPress={() => handleReserve(s)} 
            />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 130, paddingHorizontal: 24 },
  header: { marginBottom: 32, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '900', lineHeight: 40 },
  subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  searchSection: { marginBottom: 32 },
  searchBar: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12 },
  categoriesRow: { marginBottom: 40, marginHorizontal: -24 },
  categoriesContent: { paddingHorizontal: 24, gap: 12 },
  categoryCard: { width: 140, padding: 16, borderRadius: 24, borderWidth: 1.5 },
  categoryIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  categoryTitle: { fontSize: 15, fontWeight: '900' },
  categorySubtitle: { fontSize: 9, fontWeight: '900' },
  resultsList: { gap: 12 },
  spaceItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1 },
  spaceLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  imagePlaceholder: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  spaceInfo: { flex: 1 },
  spaceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  spaceTitle: { fontSize: 16, fontWeight: '800' },
  spaceCapacity: { fontSize: 12, color: '#8E8E93' },
  apartarBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  apartarBtnText: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  // ADMIN STYLES
  adminHeaderSection: { marginBottom: 32 },
  adminSectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  adminTitle: { fontSize: 32, fontWeight: '900', marginBottom: 16 },
  managersRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarStack: { flexDirection: 'row' },
  avatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  avatarText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  managersText: { fontSize: 12, color: '#8E8E93' },
  filtersRow: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  filterPillText: { fontSize: 13, fontWeight: '800' },
  adminList: { gap: 20 },
  adminCard: { borderRadius: 32, borderWidth: 1, overflow: 'hidden' },
  cardImageContainer: { height: 180, width: '100%' },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', top: 16, right: 16 },
  statusBadgeOverlay: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '900', color: '#FFF' },
  toggleDot: { width: 6, height: 6, borderRadius: 3 },
  cardMainContent: { padding: 24 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  adminCardTitle: { fontSize: 20, fontWeight: '800' },
  adminCardLocation: { fontSize: 13, color: '#8E8E93' },
  statusToggleContainer: { alignItems: 'flex-end' },
  toggleLabel: { fontSize: 10, color: '#8E8E93', marginBottom: 4 },
  iconRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  tagBadge: { backgroundColor: 'rgba(50, 215, 75, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 9, fontWeight: '900', color: '#32D74B' },
  cardMessageContainer: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 16, marginBottom: 16 },
  cardMessageText: { fontSize: 12, color: '#8E8E93' },
  statsGrid: { flexDirection: 'row', gap: 40 },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#8E8E93' },
  statVal: { fontSize: 16, fontWeight: '800' },
  topStatsRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  bigStatCard: { flex: 1, padding: 20, borderRadius: 24, borderWidth: 1 },
  bigStatLabel: { fontSize: 10, fontWeight: '900', color: '#8E8E93' },
  bigStatValue: { fontSize: 28, fontWeight: '900', lineHeight: 34 },
  bigStatSub: { fontSize: 11, color: '#8E8E93' },
  listTitle: { fontSize: 12, fontWeight: '900', color: '#8E8E93', textTransform: 'uppercase' },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  alertBox: { backgroundColor: 'rgba(50, 215, 75, 0.1)', padding: 20, borderRadius: 24, borderLeftWidth: 4, borderLeftColor: '#32D74B' },
  alertTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  alertText: { fontSize: 13, color: '#8E8E93', marginBottom: 12 },
  alertLink: { fontSize: 12, fontWeight: '900' },
  detailsLink: { fontSize: 12, fontWeight: '900' },
  subFiltersContainer: {
    marginBottom: 24,
  },
  modalSubFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSubBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  modalSubText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8E8E93',
  },
});
