import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/hooks/useReports';
import { useRole } from '@/hooks/useRole';
import { TopNav } from '@/components/smart-campus/TopNav';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  'PENDIENTE':   { color: '#FFD60A', icon: 'time-outline',          label: 'Pendiente de revisión' },
  'EN PROCESO':  { color: '#0A84FF', icon: 'build-outline',         label: 'En proceso de solución' },
  'RESUELTO':    { color: '#32D74B', icon: 'checkmark-circle-outline', label: 'Reporte resuelto' },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  'Alta':  { color: '#FF453A' },
  'Media': { color: '#FFD60A' },
  'Baja':  { color: '#32D74B' },
};

const TimelineStep = ({ icon, title, date, active, isLast }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: active ? colors.primary : colors.border }]}>
          <Ionicons name={icon} size={12} color={active ? '#FFF' : '#8E8E93'} />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
      </View>
      <View style={styles.timelineContent}>
        <ThemedText style={[styles.timelineTitle, !active && { color: '#8E8E93' }]}>{title}</ThemedText>
        <ThemedText style={styles.timelineDate}>{date || 'Pendiente'}</ThemedText>
      </View>
    </View>
  );
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const { reports, updateStatus } = useReports();
  const { role } = useRole();

  const report = reports.find(r => String(r.id) === String(id));

  if (!report) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <TopNav />
        <Ionicons name="document-text-outline" size={64} color={colors.muted} />
        <ThemedText style={{ fontSize: 20, fontWeight: '900', marginTop: 16 }}>Reporte no encontrado</ThemedText>
      </ThemedView>
    );
  }

  const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG['PENDIENTE'];
  const priorityCfg = PRIORITY_CONFIG[report.priority] ?? { color: '#8E8E93' };

  const steps = [
    { icon: 'document-text-outline', title: 'Reporte Recibido',   date: report.createdAt,  active: true },
    { icon: 'build-outline',         title: 'En Inspección',      date: report.status !== 'PENDIENTE' ? 'En proceso' : undefined, active: report.status !== 'PENDIENTE' },
    { icon: 'checkmark-circle-outline', title: 'Resolución',      date: report.status === 'RESUELTO' ? 'Resuelto' : undefined,    active: report.status === 'RESUELTO' },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status Hero */}
        <LinearGradient
          colors={isLight ? ['#00482B', '#007B3E'] : [colors.card, colors.card]}
          style={styles.heroCard}
        >
          <View style={[styles.heroIconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={statusCfg.icon} size={32} color="#FFF" />
          </View>
          <ThemedText style={styles.heroStatus}>{report.status}</ThemedText>
          <ThemedText style={styles.heroDesc}>{statusCfg.label}</ThemedText>
        </LinearGradient>

        {/* Title & Meta */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.infoLabel, { color: colors.primary }]}>INCIDENCIA REPORTADA</ThemedText>
          <ThemedText style={styles.infoTitle}>{report.title}</ThemedText>
          <ThemedText style={styles.infoDescription}>{report.description}</ThemedText>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#8E8E93" />
              <ThemedText style={styles.metaText}>{report.space}</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
              <ThemedText style={styles.metaText}>{report.createdAt}</ThemedText>
            </View>
          </View>

          <View style={styles.badgesRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}20` }]}>
              <ThemedText style={[styles.badgeText, { color: statusCfg.color }]}>{report.status}</ThemedText>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: `${priorityCfg.color}20` }]}>
              <ThemedText style={[styles.badgeText, { color: priorityCfg.color }]}>Prioridad {report.priority}</ThemedText>
            </View>
          </View>
          
          {report.imageUri && (
            <Image
              source={{ uri: report.imageUri }}
              style={{ width: '100%', height: 200, borderRadius: 16, marginTop: 24 }}
              contentFit="cover"
              transition={200}
            />
          )}
        </View>

        {/* Timeline */}
        <ThemedText style={[styles.sectionLabel, { color: colors.primary }]}>SEGUIMIENTO DEL REPORTE</ThemedText>
        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {steps.map((step, i) => (
            <TimelineStep
              key={i}
              icon={step.icon}
              title={step.title}
              date={step.date}
              active={step.active}
              isLast={i === steps.length - 1}
            />
          ))}
        </View>

        {/* Reporter */}
        <View style={[styles.reporterCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 24 }]}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.reporterLabel}>REPORTADO POR</ThemedText>
            <ThemedText style={styles.reporterName}>{report.userName}</ThemedText>
          </View>
        </View>

        {/* Admin Actions */}
        {role === 'admin' && (
          <View style={{ marginBottom: 40 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '900', marginBottom: 16 }}>Cambiar Estado del Proceso</ThemedText>
            <View style={{ gap: 14 }}>
              {[
                { label: 'PENDIENTE', value: 'PENDIENTE', color: colors.error, icon: 'alert-circle' },
                { label: 'EN PROCESO', value: 'EN PROCESO', color: colors.warning, icon: 'construct' },
                { label: 'MARCAR RESUELTO', value: 'RESUELTO', color: colors.success, icon: 'checkmark-done-circle' }
              ].map(btn => (
                <TouchableOpacity
                  key={btn.value}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    backgroundColor: report.status === btn.value ? btn.color : 'rgba(150,150,150,0.05)',
                    borderWidth: 2,
                    borderColor: report.status === btn.value ? btn.color : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                  onPress={async () => {
                    await updateStatus(report.id, btn.value as any);
                  }}
                >
                  <Ionicons name={btn.icon as any} size={20} color={report.status === btn.value ? '#FFF' : btn.color} />
                  <ThemedText style={{
                    fontWeight: '900',
                    fontSize: 14,
                    letterSpacing: 0.5,
                    color: report.status === btn.value ? '#FFF' : btn.color
                  }}>
                    {btn.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 130 },
  heroCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroStatus: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  infoCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
    lineHeight: 28,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 20,
  },
  metaRow: { gap: 12, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  badgesRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '900' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timelineCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  reporterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  reporterLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reporterName: {
    fontSize: 16,
    fontWeight: '800',
  },
});
