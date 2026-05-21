import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/hooks/useReports';
import { useRole } from '@/hooks/useRole';
import { TopNav } from '@/components/smart-campus/TopNav';

const ReportItem = ({ title, location, date, status, icon }: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  
  const getStatusColor = (s: string) => {
    switch(s) {
      case 'RESUELTO': return '#32D74B';
      case 'EN PROCESO': return '#0A84FF';
      case 'PENDIENTE': return '#FFD60A';
      default: return '#8E8E93';
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reportHeader}>
        <View style={[styles.reportIconBox, { backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }]}>
          <Ionicons name={icon} size={20} color="#8E8E93" />
        </View>
        <View style={styles.reportMain}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.reportTitle} numberOfLines={1}>{title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <ThemedText style={[styles.statusText, { color: statusColor }]}>{status}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.reportSub} numberOfLines={1}>{location} • {date}</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default function ReportsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';
  const router = useRouter();
  const { userName, userId } = useRole();
  const { reports: allReports } = useReports();
  const reports = allReports.filter(r => r.userId === String(userId));

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'RESUELTO': return '#32D74B';
      case 'EN PROCESO': return '#0A84FF';
      case 'PENDIENTE': return '#FFD60A';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Alta': return '#FF453A';
      case 'Media': return '#FFD60A';
      case 'Baja': return '#32D74B';
      default: return '#8E8E93';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopNav />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <ThemedText style={styles.title}>Mis Reportes de Incidencias</ThemedText>
        <ThemedText style={styles.subtitle}>Consulta el estado y progreso de tus reportes realizados.</ThemedText>

        <View style={styles.sectionHeader}>
           <ThemedText style={styles.sectionTitle}>HISTORIAL RECIENTE</ThemedText>
           <TouchableOpacity style={styles.filterBtn}>
             <ThemedText style={[styles.filterText, { color: colors.primary }]}>Filtrar</ThemedText>
             <Ionicons name="chevron-down" size={14} color={colors.primary} />
           </TouchableOpacity>
        </View>

        {/* Report List */}
        {reports.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
            <ThemedText style={styles.emptyTitle}>Sin reportes todavía</ThemedText>
            <ThemedText style={styles.emptySubtitle}>Los reportes que envíes aparecerán aquí con su estado actualizado.</ThemedText>
          </View>
        ) : (
          reports.map((report) => {
            const statusColor = getStatusColor(report.status);
            const priorityColor = getPriorityColor(report.priority);
            return (
              <TouchableOpacity
                key={report.id}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/profile/report/[id]', params: { id: report.id } } as any)}
                style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.reportHeader}>
                  <View style={[styles.reportIconBox, { backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }]}>
                    <Ionicons name="document-text-outline" size={20} color="#8E8E93" />
                  </View>
                  <View style={styles.reportMain}>
                    <View style={styles.titleRow}>
                      <ThemedText style={styles.reportTitle} numberOfLines={1}>{report.title}</ThemedText>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <ThemedText style={[styles.statusText, { color: statusColor }]}>{report.status}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.reportSub} numberOfLines={1}>{report.space} • {report.createdAt}</ThemedText>
                    <View style={styles.reportFooter}>
                      <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
                        <ThemedText style={[styles.priorityText, { color: priorityColor }]}>Prioridad: {report.priority}</ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#8E8E93" style={{ marginLeft: 'auto' }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <ThemedText style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>SEGUIMIENTO EN VIVO</ThemedText>
        <View style={[styles.liveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
           <View style={[styles.liveImagePlaceholder, { backgroundColor: isLight ? '#F2F2F7' : '#111' }]}>
              <Ionicons name="videocam-outline" size={32} color="#444" />
              <View style={styles.liveBadge}>
                 <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
                 <ThemedText style={styles.liveBadgeText}>Aula 204 • Piso 2</ThemedText>
              </View>
           </View>
           
           <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                 <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                 </View>
                 <View>
                    <ThemedText style={styles.timelineTitle}>Reporte Recibido</ThemedText>
                    <ThemedText style={styles.timelineDate}>12 Oct, 09:30 AM</ThemedText>
                 </View>
              </View>
              <View style={[styles.timelineLine, { backgroundColor: isLight ? '#E5E5EA' : '#333' }]} />
              <View style={styles.timelineItem}>
                 <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                    <Ionicons name="build" size={10} color="#FFF" />
                 </View>
                 <View>
                    <ThemedText style={styles.timelineTitle}>En Inspección</ThemedText>
                    <ThemedText style={styles.timelineDate}>12 Oct, 14:15 PM</ThemedText>
                 </View>
              </View>
              <View style={[styles.timelineLine, { backgroundColor: isLight ? '#E5E5EA' : '#333' }]} />
              <View style={styles.timelineItem}>
                 <View style={[styles.timelineDot, { backgroundColor: isLight ? '#E5E5EA' : '#333' }]} />
                 <View>
                    <ThemedText style={[styles.timelineTitle, { color: '#8E8E93' }]}>Resolución</ThemedText>
                    <ThemedText style={styles.timelineDate}>Pendiente</ThemedText>
                 </View>
              </View>
           </View>
        </View>

        {/* New Report CTA */}
        <View style={[styles.ctaCard, { backgroundColor: colors.primary }]}>
           <ThemedText style={styles.ctaTitle}>¿Nueva Incidencia?</ThemedText>
           <ThemedText style={styles.ctaSub}>Ayúdanos a mantener el campus en perfectas condiciones.</ThemedText>
           <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: colors.accent }]} onPress={() => router.push('/(tabs)/reports' as any)}>
              <ThemedText style={[styles.ctaBtnText, { color: isLight ? '#FFF' : '#000' }]}>CREAR REPORTE</ThemedText>
           </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00FF00',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF00',
  },
  reportCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  progressCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  reportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportMain: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  reportSub: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00FF00',
  },
  liveCard: {
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
  },
  liveImagePlaceholder: {
    height: 180,
    backgroundColor: '#111',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF00',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    height: 20,
    marginLeft: 9,
    marginVertical: 4,
  },
  ctaCard: {
    marginTop: 32,
    backgroundColor: '#006B3E',
    padding: 30,
    borderRadius: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  ctaSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: '#8EFFA9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  emptyState: {
    marginTop: 16,
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
