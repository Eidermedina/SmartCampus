import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
  title: string;
  description: string;
  type: 'alert' | 'info' | 'success';
  time: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, type, time }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getIcon = () => {
    switch (type) {
      case 'alert': return 'alert-circle';
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'alert': return '#FF453A';
      case 'info': return '#0A84FF';
      case 'success': return '#00FF00';
      default: return colors.primary;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
        <Ionicons name={getIcon()} size={20} color={getIconColor()} />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
      <ThemedText style={styles.time}>{time}</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  time: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
});
