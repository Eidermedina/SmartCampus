import { TopNav } from '@/components/smart-campus/TopNav';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_SCALE = 2.5;
const MAP_WIDTH = SCREEN_WIDTH * MAP_SCALE;
const MAP_HEIGHT = SCREEN_HEIGHT * MAP_SCALE;

const MapMarker = ({ top, left, label, icon, onPress, isActive, color }: any) => {
  return (
    <TouchableOpacity style={[styles.markerContainer, { top, left }]} onPress={onPress}>
      <View style={[styles.markerBadge, isActive && { backgroundColor: color || '#006B3E' }]}>
        <ThemedText style={styles.markerLabel}>{label}</ThemedText>
      </View>
      <View style={[styles.markerCircle, { backgroundColor: color || '#007B3E' }, isActive && { transform: [{ scale: 1.1 }] }]}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);

  const pan = useRef(new Animated.ValueXY({
    x: -(MAP_WIDTH - SCREEN_WIDTH) / 2,
    y: -(MAP_HEIGHT - SCREEN_HEIGHT) / 2
  })).current;

  const panValue = useRef({
    x: -(MAP_WIDTH - SCREEN_WIDTH) / 2,
    y: -(MAP_HEIGHT - SCREEN_HEIGHT) / 2
  });

  const scale = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(1);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);

  useEffect(() => {
    const idPan = pan.addListener((value) => {
      panValue.current = value;
    });
    const idScale = scale.addListener((value) => {
      scaleValue.current = value.value;
    });
    return () => {
      pan.removeListener(idPan);
      scale.removeListener(idScale);
    };
  }, [pan, scale]);

  const enforceBounds = (currentPanX: number, currentPanY: number, s: number) => {
    const widthDiff = (MAP_WIDTH * s - MAP_WIDTH) / 2;
    const heightDiff = (MAP_HEIGHT * s - MAP_HEIGHT) / 2;

    const minX = -(MAP_WIDTH - SCREEN_WIDTH) - widthDiff;
    const maxX = widthDiff;
    const minY = -(MAP_HEIGHT - SCREEN_HEIGHT) - heightDiff;
    const maxY = heightDiff;

    let newX = currentPanX;
    let newY = currentPanY;
    let outOfBounds = false;

    if (newX > maxX) { newX = maxX; outOfBounds = true; }
    if (newX < minX) { newX = minX; outOfBounds = true; }
    if (newY > maxY) { newY = maxY; outOfBounds = true; }
    if (newY < minY) { newY = minY; outOfBounds = true; }

    if (outOfBounds) {
      Animated.spring(pan, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
      }).start();
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    let newScale = scaleValue.current + (direction === 'in' ? 0.6 : -0.6);
    newScale = Math.max(0.5, Math.min(newScale, 3.5));

    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();

    enforceBounds(panValue.current.x, panValue.current.y, newScale);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        return e.nativeEvent.touches.length === 2 || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: panValue.current.x,
          y: panValue.current.y
        });
        pan.setValue({ x: 0, y: 0 });
        initialDistance.current = null;
      },
      onPanResponderMove: (e, gestureState) => {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          const dist = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
          if (!initialDistance.current) {
            initialDistance.current = dist;
            initialScale.current = scaleValue.current;
          } else {
            let newScale = initialScale.current * (dist / initialDistance.current);
            newScale = Math.max(0.5, Math.min(newScale, 3.5));
            scale.setValue(newScale);
          }
        } else if (touches.length === 1) {
          if (initialDistance.current !== null) {
            return;
          }
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        initialDistance.current = null;
        enforceBounds(panValue.current.x, panValue.current.y, scaleValue.current);
      }
    })
  ).current;

  const buildings = [
    {
      id: 'CAF_HUECO',
      top: '44%',
      left: '82%',
      label: 'EL HUECO',
      icon: 'restaurant',
      title: 'Cafetería El Hueco',
      subtitle: 'Zona de Alimentación Principal',
      category: 'SERVICIOS',
      rooms: 'Abierto',
      wifi: 'Disponible',
      color: '#ed00edff'
    },
    {
      id: 'CAF_RINCON',
      top: '89%',
      left: '5%',
      label: 'RINCÓN U',
      icon: 'cafe',
      title: 'El Rincón de la U',
      subtitle: 'Cafetería y Snacks',
      category: 'SERVICIOS',
      rooms: 'Abierto',
      wifi: 'Disponible',
      color: '#ed00edff'
    },
    {
      id: 'FUTBOL',
      top: '21%',
      left: '30%',
      label: 'FUTBOL',
      icon: 'football',
      title: 'Cancha de Futbol',
      subtitle: 'Campo Principal',
      category: 'DEPORTES',
      rooms: 'Exterior',
      wifi: 'N/A',
      color: '#f1690fff'
    },
    {
      id: 'MICRO',
      top: '40%',
      left: '74%',
      label: 'MICRO',
      icon: 'trophy',
      title: 'Cancha de Microfútbol',
      subtitle: 'Zona Multideportiva',
      category: 'DEPORTES',
      rooms: 'Exterior',
      wifi: 'N/A',
      color: '#f1690fff'
    },
    {
      id: 'AUDITORIO',
      top: '62%',
      left: '67%',
      label: 'AUDITORIO',
      icon: 'megaphone',
      title: 'Auditorio',
      subtitle: 'Eventos y Conferencias',
      category: 'CULTURA',
      rooms: 'Cap. 200',
      wifi: 'Disponible',
      color: '#f4f000ff'
    },
    {
      id: 'BLOQUE_D',
      top: '77%',
      left: '47%',
      label: 'BLOQUE D',
      icon: 'school',
      title: 'Bloque D',
      subtitle: 'Aulas de Clase',
      category: 'ACADÉMICO',
      rooms: '20 Salones',
      wifi: 'Disponible',
      color: '#29b92bff'
    },
    {
      id: 'SALON DESCANSO',
      top: '75%',
      left: '60%',
      label: 'SALON DESCANSO',
      icon: 'bed',
      title: 'Salon Descanso',
      subtitle: 'Zona de descanso',
      category: 'SERVICIOS',
      rooms: 'Abierto',
      wifi: 'Disponible',
      color: '#00e5ffff'
    },
    {
      id: 'BIBLIOTECA',
      top: '54%',
      left: '25%',
      label: 'BIBLIOTECA',
      icon: 'book',
      title: 'Biblioteca',
      subtitle: 'Centro de Recursos',
      category: 'ACADÉMICO',
      rooms: 'Cap. 150',
      wifi: 'Excelente',
      color: '#8729b9ff'
    },
    {
      id: 'BOQUE A',
      top: '55%',
      left: '5%',
      label: 'BOQUE A',
      icon: 'school',
      title: 'Biblioteca',
      subtitle: 'Centro de Recursos',
      category: 'ACADÉMICO',
      rooms: 'Cap. 150',
      wifi: 'Excelente',
      color: '#29b92bff'
    },
    {
      id: 'LAB',
      top: '44%',
      left: '5%',
      label: 'LAB',
      icon: 'flask',
      title: 'Laboratorio',
      subtitle: 'Investigación y Práctica',
      category: 'TECNOLOGÍA',
      rooms: '8 Labs',
      wifi: 'Alta Velocidad',
      color: '#E74C3C'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TopNav />

      <View style={styles.mapBackground}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale }
            ]
          }}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedBuilding(null)}>
            <View style={{ width: '100%', height: '100%' }}>
              <Image
                source={require('../../assets/map_girardot.jpg')}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <View style={styles.mapOverlay} pointerEvents="none" />

              {buildings.map(b => (
                <MapMarker
                  key={b.id}
                  top={b.top}
                  left={b.left}
                  label={b.label}
                  icon={b.icon}
                  color={b.color}
                  isActive={selectedBuilding?.id === b.id}
                  onPress={() => setSelectedBuilding(b)}
                />
              ))}

              <View style={[styles.mapIconCircle, { top: '28%', left: '85%', backgroundColor: '#FF5CBE' }]}>
                <Ionicons name="restaurant" size={12} color="#FFF" />
              </View>

              <View style={styles.userDotContainer}>
                <View style={[styles.userDotPulse, { backgroundColor: `${colors.success}33` }]} />
                <View style={[styles.userDotInner, { backgroundColor: colors.success }]} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Search buildings, labs..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color={colors.tint} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: 10, paddingRight: 24 }}>
          <TouchableOpacity style={[styles.chip, { backgroundColor: '#007B3E' }]}>
            <Ionicons name="school-outline" size={16} color="#FFF" />
            <ThemedText style={styles.chipText}>ACADÉMICO</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: '#DAAA00' }]}>
            <Ionicons name="basketball-outline" size={16} color="#FFF" />
            <ThemedText style={styles.chipText}>DEPORTES</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: '#00A99D' }]}>
            <Ionicons name="flask-outline" size={16} color="#FFF" />
            <ThemedText style={styles.chipText}>LABS</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: '#00482B' }]}>
            <Ionicons name="restaurant-outline" size={16} color="#FFF" />
            <ThemedText style={styles.chipText}>SERVICIOS</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: '#79C000' }]}>
            <Ionicons name="megaphone-outline" size={16} color="#FFF" />
            <ThemedText style={styles.chipText}>CULTURA</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('in')} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('out')} activeOpacity={0.7}>
          <Ionicons name="remove" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Building Detail */}
      {selectedBuilding && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetContent}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.catBadge, { backgroundColor: `${colors.primary}22` }]}>
                    <ThemedText style={[styles.catBadgeText, { color: colors.primary }]}>{selectedBuilding.category}</ThemedText>
                  </View>
                  <View style={styles.openBadge}>
                    <View style={[styles.greenDot, { backgroundColor: colors.tint }]} />
                    <ThemedText style={styles.openText}>OPEN NOW</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.buildingTitle}>{selectedBuilding.title}</ThemedText>
                <ThemedText style={styles.buildingSub}>{selectedBuilding.subtitle}</ThemedText>
              </View>
              <TouchableOpacity style={[styles.directionBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="navigate" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="business-outline" size={22} color={colors.primary} style={{ marginRight: 12 }} />
                <View>
                  <ThemedText style={styles.statLabel}>SALONES</ThemedText>
                  <ThemedText style={styles.statValue}>{selectedBuilding.rooms}</ThemedText>
                </View>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="wifi-outline" size={22} color={colors.primary} style={{ marginRight: 12 }} />
                <View>
                  <ThemedText style={styles.statLabel}>CONEXIÓN</ThemedText>
                  <ThemedText style={styles.statValue}>{selectedBuilding.wifi}</ThemedText>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.viewBtn}>
              <LinearGradient
                colors={[colors.accent, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewGradient}
              >
                <ThemedText style={styles.viewBtnText}>View Schedule & Events</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#051A10', // Dark green base instead of pure black
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fully transparent
  },
  searchSection: {
    position: 'absolute',
    top: 130,
    left: 24,
    right: 24,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chipScroll: {
    marginTop: 16,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 2,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007B3E', // Institutional Green
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  mapIconCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userDotContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  userDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  zoomControls: {
    position: 'absolute',
    right: 24,
    top: 380,
    gap: 12,
    zIndex: 20,
  },
  zoomBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 100,
  },
  sheetContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  catBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00FF00',
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF00',
  },
  openText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  buildingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  buildingSub: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  directionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#006B3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#8E8E93',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  viewBtn: {
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  viewGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
});
