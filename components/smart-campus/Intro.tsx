import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../themed-text';

const { width } = Dimensions.get('window');

interface IntroProps {
  onFinish: () => void;
}

const SLIDES = [
  {
    id: '1',
    icon: 'calendar' as keyof typeof Ionicons.glyphMap,
    title: 'Reserva Inteligente',
    description: 'Reserva laboratorios de computación, salas de estudio y espacios deportivos en segundos. Sin filas, sin complicaciones.',
    image: require('../../assets/images/intro/reserva.png'),
    accent: '#00FF00',
  },
  {
    id: '2',
    icon: 'map' as keyof typeof Ionicons.glyphMap,
    title: 'Campus Girardot',
    description: 'Localiza tus clases, oficinas administrativas y zonas de bienestar con nuestro mapa interactivo de alta precisión.',
    image: require('../../assets/images/intro/mapa.png'),
    accent: '#00FF00',
  },
  {
    id: '3',
    icon: 'notifications' as keyof typeof Ionicons.glyphMap,
    title: 'Alertas en Tiempo Real',
    description: 'No pierdas ni un detalle. Recibe notificaciones instantáneas sobre cambios de horario, eventos y servicios de bienestar.',
    image: require('../../assets/images/intro/alertas.png'),
    accent: '#00FF00',
  },
];

export const Intro: React.FC<IntroProps> = ({ onFinish }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const nextSlide = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      onFinish();
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          style={styles.overlay}
        />
      </View>

      <View style={styles.content}>
        <View style={[styles.accentBar, { backgroundColor: item.accent }]} />
        <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.slideDescription}>{item.description}</ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Fixed */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="school" size={20} color={colors.primary} />
        </View>
        <View>
          <ThemedText style={styles.headerTitle}>SmartCampus</ThemedText>
          <ThemedText style={styles.headerSubtitle}>SECCIONAL GIRARDOT</ThemedText>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />

      {/* Footer Fixed */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : 'rgba(255,255,255,0.2)',
                  width: index === activeIndex ? 24 : 8
                }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={nextSlide}
        >
          <ThemedText style={styles.buttonText}>
            {activeIndex === SLIDES.length - 1 ? 'Empezar ahora' : 'Siguiente'}
          </ThemedText>
          <Ionicons
            name={activeIndex === SLIDES.length - 1 ? "rocket" : "arrow-forward"}
            size={20}
            color="#000"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <ThemedText style={styles.skipText}>SALTAR INTRODUCCIÓN</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 25,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF00',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingHorizontal: 40,
    paddingBottom: 220, // Adjusted for better balance
  },
  accentBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  slideTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 46,
    letterSpacing: -1,
  },
  slideDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 28,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipBtn: {
    marginTop: 24,
  },
  skipText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '900',
    letterSpacing: 2,
  },
});

