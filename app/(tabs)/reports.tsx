import { TopNav } from '@/components/smart-campus/TopNav';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReports } from '@/hooks/useReports';
import { useRole } from '@/hooks/useRole';
import { useCampus } from '@/hooks/useCampus';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InputLabel = ({ children }: { children: string }) => (
  <ThemedText style={styles.inputLabel}>{children}</ThemedText>
);

const IncidentCard = ({ priority, time, title, location, date, status, actionText, images, description, userName, onAction }: any) => {
  const isCritical = priority === 'CRÍTICO';
  const isMedium = priority === 'MEDIO';
  const isLow = priority === 'BAJO';
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  const getPriorityColor = () => {
    if (isCritical) return colors.error;
    if (isMedium) return colors.warning;
    return colors.success;
  };

  const getStatusColor = () => {
    if (status === 'INVESTIGANDO') return colors.warning;
    if (status === 'REPORTADO') return colors.error;
    return colors.success;
  };

  return (
    <View style={[styles.incidentCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 6, borderLeftColor: getPriorityColor() }]}>
      <View style={styles.incidentHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <ThemedText style={styles.priorityBadgeText}>{priority}</ThemedText>
        </View>
        <ThemedText style={styles.timeAgoText}>Hace {time}</ThemedText>
      </View>

      <ThemedText style={styles.incidentTitle}>{title}</ThemedText>

      {description && (
        <ThemedText style={[styles.metaText, { marginVertical: 8, fontSize: 14, color: colors.text }]}>
          {description}
        </ThemedText>
      )}

      <View style={styles.metadataRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <ThemedText style={styles.metaText}>{location}</ThemedText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.muted} />
          <ThemedText style={styles.metaText}>{userName || 'Anónimo'}</ThemedText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.muted} />
          <ThemedText style={styles.metaText}>{date}</ThemedText>
        </View>
      </View>

      {images && images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
          {images.map((img: string, idx: number) => (
            <Image key={idx} source={{ uri: img }} style={[styles.incidentImage, images.length === 1 && { width: '100%', height: 180 }]} contentFit="cover" transition={200} />
          ))}
        </ScrollView>
      )}

      <View style={styles.incidentFooter}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <ThemedText style={styles.statusText}>{status}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: isCritical ? (isLight ? colors.primary : colors.accent) : `${colors.primary}15` }]}
          onPress={onAction}
        >
          <ThemedText style={[styles.actionBtnText, { color: isCritical ? (isLight ? '#FFF' : '#000') : colors.primary }]}>
            {actionText}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AdminReportsScreen = () => {
  const { reports, updateStatus } = useReports();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Todos los Reportes');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  const handleManageStatus = (report: any) => {
    router.push({ pathname: '/profile/report/[id]', params: { id: report.id } } as any);
  };

  return (
    <ThemedView style={styles.container}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.adminHeader}>
          <ThemedText style={styles.adminHeaderTitle}>Seguimiento de Incidencias</ThemedText>
          <ThemedText style={styles.adminHeaderSub}>Monitoreo de mantenimiento y seguridad en todo el campus.</ThemedText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          {['Todos los Reportes', 'Crítico', 'Medio', 'Bajo'].map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.filterChip, activeFilter === f && { backgroundColor: isLight ? '#007B3E' : '#32D74B' }]}
            >
              <ThemedText style={[styles.filterChipText, activeFilter === f && { color: isLight ? '#FFF' : '#000' }]}>{f}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.incidentList}>
          {reports.filter((r: any) => {
            if (activeFilter === 'Todos los Reportes') return true;
            const p = r.priority.toUpperCase();
            if (activeFilter === 'Crítico' && p === 'ALTA') return true;
            if (activeFilter === 'Medio' && p === 'MEDIA') return true;
            if (activeFilter === 'Bajo' && p === 'BAJA') return true;
            return false;
          }).map((r: any) => (
            <IncidentCard
              key={r.id}
              priority={r.priority.toUpperCase() === 'ALTA' ? 'CRÍTICO' : r.priority.toUpperCase() === 'MEDIA' ? 'MEDIO' : 'BAJO'}
              time={r.createdAt}
              title={r.title}
              description={r.description}
              userName={r.userName}
              location={r.space}
              date={r.createdAt.split(',')[0]}
              status={r.status}
              actionText="GESTIONAR"
              onAction={() => handleManageStatus(r)}
              images={r.imageUri ? [r.imageUri] : []}
            />
          ))}
          {reports.filter((r: any) => {
            if (activeFilter === 'Todos los Reportes') return true;
            const p = r.priority.toUpperCase();
            if (activeFilter === 'Crítico' && p === 'ALTA') return true;
            if (activeFilter === 'Medio' && p === 'MEDIA') return true;
            if (activeFilter === 'Bajo' && p === 'BAJA') return true;
            return false;
          }).length === 0 && (
              <ThemedText style={{ textAlign: 'center', marginTop: 40, color: colors.muted }}>No hay reportes pendientes.</ThemedText>
            )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const RecentReportItem = ({ title, status, time, icon, color, onPress }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <TouchableOpacity style={[styles.reportItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.reportMain}>
        <ThemedText style={styles.reportTitleText} numberOfLines={1}>{title}</ThemedText>
        <View style={styles.reportMetaRow}>
          <View style={[styles.statusDot, { backgroundColor: status === 'Resuelto' ? '#32D74B' : '#FFD60A' }]} />
          <ThemedText style={styles.reportMetaText}>{status} • {time}</ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#444" />
    </TouchableOpacity>
  );
};

export default function ReportsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const router = useRouter();
  const { userName, role, userId } = useRole();

  if (role === 'admin') return <AdminReportsScreen />;

  const { addReport, reports } = useReports();
  const { spaces: campusSpaces } = useCampus();

  const [priority, setPriority] = useState('Media');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [selectedSpaceTitle, setSelectedSpaceTitle] = useState('');
  const [isSpaceModalVisible, setSpaceModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'camera' | 'gallery' | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // 1. Recuperar la imagen y el estado del formulario tras reinicio
  useEffect(() => {
    const restoreState = async () => {
      try {
        // Restaurar texto e ID
        const savedData = await AsyncStorage.getItem('pending_report');
        if (savedData) {
          const { title: t, description: d, spaceId: sid, spaceTitle: st, priority: p } = JSON.parse(savedData);
          if (t) setTitle(t);
          if (d) setDescription(d);
          if (sid) setSelectedSpaceId(sid);
          if (st) setSelectedSpaceTitle(st);
          if (p) setPriority(p);
        }

        // Restaurar imagen pendiente (Android)
        const pending = await ImagePicker.getPendingResultAsync();
        if (pending && Array.isArray(pending) && pending.length > 0) {
          const firstResult = pending[0];
          if (!firstResult.canceled && firstResult.assets && firstResult.assets.length > 0) {
            setImageUri(firstResult.assets[0].uri);
          }
        }
      } catch (e) {
        console.warn("Restore state error:", e);
      }
    };
    restoreState();
  }, []);

  // 2. Persistir estado del formulario en cada cambio
  useEffect(() => {
    const saveData = async () => {
      try {
        const data = { title, description, spaceId: selectedSpaceId, spaceTitle: selectedSpaceTitle, priority };
        await AsyncStorage.setItem('pending_report', JSON.stringify(data));
      } catch (e) {
        console.warn("Save state error:", e);
      }
    };
    saveData();
  }, [title, description, selectedSpaceId, selectedSpaceTitle, priority]);

  // 4. Lanzador de cámara/galería mejorado
  const executeImageAction = async (action: 'camera' | 'gallery') => {
    try {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (camStatus !== 'granted' || libStatus !== 'granted') {
        Alert.alert("Permisos necesarios", "La app necesita acceso a cámara y galería.");
        return;
      }

      let result;
      // Give the app a moment to settle background tasks (like saving state) before the camera context switch
      await new Promise(resolve => setTimeout(resolve, 500));

      if (action === 'camera') {
        if (!cameraPermission?.granted) {
          const permission = await requestCameraPermission();
          if (!permission.granted) {
            Alert.alert("Permisos necesarios", "La app necesita acceso a cámara.");
            setShowOptions(false);
            return;
          }
        }
        setShowOptions(false);
        setIsCameraVisible(true);
        return; // Detenemos aquí, la cámara nativa (inline) se encargará del resto
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
        });
      }

      if (result && !result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn("Image picking error:", err);
      Alert.alert("Error", "No se pudo abrir la cámara o galería.");
    } finally {
      setShowOptions(false);
    }
  };

  // Estados para los filtros del Modal
  const [modalCategory, setModalCategory] = useState('salones');
  const [modalBlock, setModalBlock] = useState('Bloque A');
  const [modalFloor, setModalFloor] = useState(1);

  const getFilteredModalSpaces = () => {
    let results = campusSpaces.filter(s => s.category.toLowerCase() === modalCategory.toLowerCase());
    if (modalCategory === 'salones') {
      results = results.filter(s => s.block === modalBlock);
      if (modalBlock === 'Bloque D') {
        results = results.filter(s => s.floor === modalFloor);
      }
    }
    return results;
  };

  const pickImage = async () => {
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (camStatus !== 'granted' || libStatus !== 'granted') {
      Alert.alert("Permisos necesarios", "La app necesita acceso a cámara y galería.");
      return;
    }
    setShowOptions(true);
  };

  const clearForm = async () => {
    setSelectedSpaceId('');
    setSelectedSpaceTitle('');
    setTitle('');
    setDescription('');
    setImageUri(null);
    setPriority('Media');
    setShowOptions(false);
    try {
      await AsyncStorage.removeItem('pending_report');
    } catch (e) {
      console.error("Clear state error:", e);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSpaceId || !title || !description) {
      Alert.alert("Campos incompletos", "Por favor completa el espacio, título y descripción.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addReport({
        title,
        description,
        spaceId: selectedSpaceId,
        priority: priority as any,
        imageUri: imageUri ?? undefined,
        userName: userName ?? 'Usuario',
      });

      setIsSubmitting(false);
      Alert.alert(
        "Reporte Enviado ✓",
        "Tu incidencia ha sido reportada correctamente. El equipo técnico la revisará pronto.",
        [{
          text: "OK",
          onPress: () => {
            clearForm();
          }
        }]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error", "No se pudo enviar el reporte.");
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerLabel, { color: colors.primary }]}>REPORTE DE INCIDENCIAS</ThemedText>
          <ThemedText style={styles.headerTitle}>Mejora tu Campus</ThemedText>
          <ThemedText style={styles.headerSub}>Reporta problemas de infraestructura o servicios en tiempo real.</ThemedText>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: isLight ? '#FFF' : 'rgba(255,255,255,0.02)', borderColor: colors.border }]}>
          <InputLabel>UBICACIÓN / ESPACIO</InputLabel>
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: isLight ? '#F2F2F7' : '#111', borderColor: isLight ? '#E5E5EA' : '#222' }]}
            onPress={() => setSpaceModalVisible(true)}
          >
            <ThemedText style={[styles.dropdownText, selectedSpaceTitle ? { color: isLight ? '#000' : '#FFF' } : {}]}>
              {selectedSpaceTitle || 'Seleccionar Edificio/Aula'}
            </ThemedText>
            <Ionicons name="chevron-down" size={18} color="#8E8E93" />
          </TouchableOpacity>

          <InputLabel>TÍTULO DEL PROBLEMA</InputLabel>
          <TextInput
            style={[styles.input, { backgroundColor: isLight ? '#F2F2F7' : '#111', borderColor: isLight ? '#E5E5EA' : '#222', color: isLight ? '#000' : '#FFF' }]}
            placeholder="Ej: Luminaria fundida"
            placeholderTextColor={isLight ? "#8E8E93" : "#444"}
            value={title}
            onChangeText={setTitle}
          />

          <InputLabel>DESCRIPCIÓN</InputLabel>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: isLight ? '#F2F2F7' : '#111', borderColor: isLight ? '#E5E5EA' : '#222', color: isLight ? '#000' : '#FFF' }]}
            placeholder="Detalla la incidencia..."
            placeholderTextColor={isLight ? "#8E8E93" : "#444"}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <InputLabel>EVIDENCIA VISUAL</InputLabel>
          {showOptions && !imageUri ? (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: `${colors.primary}22`, borderColor: colors.primary }]}
                onPress={() => executeImageAction('camera')}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <ThemedText style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>CÁMARA</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, { backgroundColor: 'rgba(150,150,150,0.1)', borderColor: 'rgba(150,150,150,0.2)' }]}
                onPress={() => executeImageAction('gallery')}
              >
                <Ionicons name="images" size={24} color={colors.text} />
                <ThemedText style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>GALERÍA</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionBtn, { flex: 0.4, borderColor: 'transparent' }]}
                onPress={() => setShowOptions(false)}
              >
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadBox, { borderColor: isLight ? '#E5E5EA' : '#333' }]}
              onPress={pickImage}
            >
              {imageUri ? (
                <View style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}>
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                  >
                    <Ionicons name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.uploadIconCircle, { backgroundColor: `${colors.primary}11` }]}>
                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                  </View>
                  <ThemedText style={styles.uploadText}>Adjuntar foto del problema</ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}

          <InputLabel>PRIORIDAD</InputLabel>
          <View style={styles.priorityRow}>
            {['Baja', 'Media', 'Alta'].map((p) => {
              const getPriorityColor = () => {
                if (p === 'Baja') return '#0A84FF';
                if (p === 'Media') return '#FFD60A';
                if (p === 'Alta') return '#FF453A';
                return colors.primary;
              };
              const pColor = getPriorityColor();
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityChip,
                    { backgroundColor: isLight ? '#F2F2F7' : '#1C1C1E' },
                    priority === p && { borderColor: pColor, backgroundColor: `${pColor}22` }
                  ]}
                >
                  <ThemedText style={[styles.priorityText, priority === p && { color: pColor }]}>{p}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <ThemedText style={[styles.submitBtnText, { color: isLight ? '#FFF' : '#000' }]}>
                {isSubmitting ? "Enviando..." : "Enviar Reporte"}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Reports */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <ThemedText style={styles.recentTitle}>Mis Reportes Recientes</ThemedText>
            <TouchableOpacity onPress={() => router.push('/profile/reports')}>
              <ThemedText style={[styles.verTodos, { color: colors.primary }]}>Ver todos</ThemedText>
            </TouchableOpacity>
          </View>

          {reports.filter(r => r.userId === String(userId)).length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={36} color="#8E8E93" />
              <ThemedText style={styles.emptyStateText}>Aún no has enviado reportes.</ThemedText>
            </View>
          ) : (
            reports.filter(r => r.userId === String(userId)).slice(0, 3).map((r) => (
              <RecentReportItem
                key={r.id}
                title={r.title}
                status={r.status === 'PENDIENTE' ? 'Pendiente' : r.status === 'EN PROCESO' ? 'En Proceso' : 'Resuelto'}
                time={r.createdAt}
                icon="document-text-outline"
                color={colors.primary}
                onPress={() => router.push({ pathname: '/profile/report/[id]', params: { id: r.id } } as any)}
              />
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Space Selection Modal */}
      <Modal
        visible={isSpaceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSpaceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Seleccionar Espacio</ThemedText>
              <TouchableOpacity onPress={() => setSpaceModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalFilterContainer}>
              {/* Categorías */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCatRow}>
                {[
                  { id: 'salones', label: 'Salones', icon: 'easel' },
                  { id: 'laboratorios', label: 'Labs', icon: 'flask' },
                  { id: 'descanso', label: 'Descanso', icon: 'cafe' },
                  { id: 'canchas', label: 'Canchas', icon: 'football' }
                ].map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setModalCategory(cat.id)}
                    style={[styles.modalCatBtn, modalCategory === cat.id && { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={modalCategory === cat.id ? '#000' : colors.text} />
                    <ThemedText style={[styles.modalCatText, modalCategory === cat.id && { color: '#000' }]}>{cat.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Filtros de Bloque (Solo para Salones) */}
              {modalCategory === 'salones' && (
                <View style={styles.modalSubFilterRow}>
                  {['Bloque A', 'Bloque D'].map(block => (
                    <TouchableOpacity
                      key={block}
                      onPress={() => setModalBlock(block)}
                      style={[styles.modalSubBtn, modalBlock === block && { borderColor: colors.primary }]}
                    >
                      <ThemedText style={[styles.modalSubText, modalBlock === block && { color: colors.primary }]}>{block}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Filtros de Piso (Solo para Salones en Bloque D) */}
              {modalCategory === 'salones' && modalBlock === 'Bloque D' && (
                <View style={styles.modalSubFilterRow}>
                  {[1, 2, 3].map(floor => (
                    <TouchableOpacity
                      key={floor}
                      onPress={() => setModalFloor(floor)}
                      style={[styles.modalSubBtn, modalFloor === floor && { borderColor: colors.primary }]}
                    >
                      <ThemedText style={[styles.modalSubText, modalFloor === floor && { color: colors.primary }]}>Piso {floor}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <ScrollView style={styles.modalList}>
              {getFilteredModalSpaces().map((space) => (
                <TouchableOpacity
                  key={space.id}
                  style={[styles.modalItem, { borderBottomColor: isLight ? '#E5E5EA' : '#222' }]}
                  onPress={() => {
                    setSelectedSpaceTitle(space.title);
                    setSelectedSpaceId(space.id);
                    setSpaceModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons name={modalCategory === 'canchas' ? 'football' : 'business'} size={18} color={colors.primary} style={{ marginRight: 12 }} />
                    <ThemedText style={[styles.modalItemText, selectedSpaceId === space.id && { color: colors.primary, fontWeight: '800' }]}>
                      {space.title}
                    </ThemedText>
                  </View>
                  {selectedSpaceId === space.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {getFilteredModalSpaces().length === 0 && (
                <ThemedText style={styles.noResultsText}>No hay espacios disponibles con estos filtros.</ThemedText>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Inline Camera Modal to prevent Android OOM kills */}
      <Modal visible={isCameraVisible} animationType="slide" transparent={false} onRequestClose={() => setIsCameraVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView 
            style={{ flex: 1 }} 
            facing="back" 
            ref={cameraRef}
          />
          
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 40 }}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}
              onPress={() => setIsCameraVisible(false)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' }}
              onPress={async () => {
                if (cameraRef.current) {
                  try {
                    const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 });
                    if (photo) {
                      setImageUri(photo.uri);
                      setIsCameraVisible(false);
                    }
                  } catch (e) {
                    Alert.alert("Error", "No se pudo capturar la foto.");
                  }
                }
              }}
            >
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'white', borderWidth: 2, borderColor: '#000' }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 130,
  },
  header: {
    marginBottom: 32,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 12,
    paddingBottom: 4,
  },
  headerSub: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    fontWeight: '600',
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 20,
  },
  dropdown: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 160,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '700',
  },
  optionBtn: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityChip: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8E8E93',
  },
  submitBtn: {
    height: 60,
    borderRadius: 30,
    marginTop: 32,
    overflow: 'hidden',
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  verTodos: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00FF00',
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportMain: {
    flex: 1,
  },
  reportTitleText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reportMetaText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalList: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  modalFilterContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 12,
  },
  modalCatRow: {
    flexGrow: 0,
    marginBottom: 8,
  },
  modalCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(150,150,150,0.1)',
    marginRight: 8,
    gap: 6,
  },
  modalCatText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalSubFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  modalSubBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
  },
  modalSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
    fontSize: 14,
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyState: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Admin Reports Styles
  adminHeader: {
    marginBottom: 32,
  },
  adminHeaderTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  adminHeaderSub: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    lineHeight: 20,
  },
  filterRow: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  incidentList: {
    gap: 20,
  },
  incidentCard: {
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sideIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 6,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
  },
  timeAgoText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  incidentTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  imageGallery: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  incidentImage: {
    width: 140,
    height: 100,
    borderRadius: 16,
    marginRight: 12,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  primaryAction: {
    backgroundColor: '#007B3E',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(50, 215, 75, 0.3)',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
  },
});

