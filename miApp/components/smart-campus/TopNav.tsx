import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRole } from '@/hooks/useRole';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export const TopNav: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { role } = useRole();

  const isLight = colorScheme === 'light';

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const pathname = usePathname();
  const canGoBack = router.canGoBack() && !['/', '/(tabs)', '/(tabs)/index', '/(tabs)/spaces', '/(tabs)/map', '/(tabs)/reports', '/(tabs)/requests'].includes(pathname);

  const handleAvatarPress = () => {
    if (pathname.includes('profile')) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)' as any);
      }
    } else {
      router.push('/profile' as any);
    }
  };

  // En Expo Router los grupos (tabs) no aparecen en el pathname real
  const MAIN_ROUTES = ['/', '/index', '/spaces', '/map', '/reports', '/requests', '/users', '/(tabs)', '/(tabs)/index', '/(tabs)/spaces', '/(tabs)/map', '/(tabs)/reports', '/(tabs)/requests', '/(tabs)/users'];
  const isMainTab = MAIN_ROUTES.includes(pathname);

  // Layout original para tabs principales
  const MainNavContent = (
    <View style={styles.content}>
      <View style={styles.topBarLeft}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.7}>
          <Image
            source={require('@/assets/images/icon-v2.png')}
            style={styles.campusLogo}
            contentFit="contain"
          />
        </TouchableOpacity>
        <ThemedText style={[styles.topBarTitle, { color: isLight ? '#FFF' : colors.primary }]}>SmartCampus</ThemedText>
      </View>
      <View style={styles.topBarRight}>
        <View style={styles.clockContainer}>
          <Ionicons name="time-outline" size={12} color={isLight ? '#FFF' : colors.text} style={styles.clockIcon} />
          <ThemedText style={[styles.clockText, { color: isLight ? '#FFF' : colors.text }]}>{formattedTime}</ThemedText>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={isLight ? '#FFF' : colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleAvatarPress}>
          <View style={[styles.avatar, { borderColor: isLight ? 'rgba(255,255,255,0.5)' : colors.border, backgroundColor: isLight ? '#FFF' : '#111' }]}>
            <Ionicons name="person" size={22} color={isLight ? colors.primary : colors.tint} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Layout con flecha para vistas secundarias
  const SecondaryNavContent = (
    <View style={styles.content}>
      <View style={styles.topBarLeft}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={isLight ? '#FFF' : colors.primary} />
        </TouchableOpacity>
        <ThemedText style={[styles.topBarTitle, { color: isLight ? '#FFF' : colors.primary }]}>Volver</ThemedText>
      </View>
      <View style={styles.topBarRight}>
        <TouchableOpacity style={styles.avatarBtn} onPress={handleAvatarPress}>
          <View style={[styles.avatar, { borderColor: isLight ? 'rgba(255,255,255,0.5)' : colors.border, backgroundColor: isLight ? '#FFF' : '#111' }]}>
            <Ionicons name="person" size={22} color={isLight ? colors.primary : colors.tint} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const NavContent = isMainTab ? MainNavContent : SecondaryNavContent;

  if (isLight) {
    return (
      <LinearGradient
        colors={['#00482B', '#007B3E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topNav}
      >
        {NavContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.topNav, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {NavContent}
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  campusLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  clockIcon: {
    marginRight: 3,
  },
  clockText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  iconBtn: {
    // padding removed to let gap handle spacing uniformly
  },
  avatarBtn: {
    // margin removed to let gap handle spacing uniformly
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
