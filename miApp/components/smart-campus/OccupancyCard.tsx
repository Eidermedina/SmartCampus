import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OccupancyCardProps {
  label: string;
  location?: string;
  percentage: number;
  status?: string;
  statusColor?: string;
}

export const OccupancyCard: React.FC<OccupancyCardProps> = ({ 
  label, 
  location, 
  percentage, 
  status, 
  statusColor 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.accentBar, { backgroundColor: statusColor || colors.primary }]} />
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.label}>{label}</ThemedText>
            {location && <ThemedText style={styles.location}>{location}</ThemedText>}
          </View>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor || colors.primary}15` }]}>
              <ThemedText style={[styles.statusText, { color: statusColor || colors.primary }]}>{status}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.capacityRow}>
          <ThemedText style={styles.capacityLabel}>CAPACIDAD</ThemedText>
          <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
        </View>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: statusColor || colors.primary, 
                width: `${percentage}%` 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  accentBar: {
    width: 6,
    height: '100%',
  },
  mainContent: {
    flex: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
});
