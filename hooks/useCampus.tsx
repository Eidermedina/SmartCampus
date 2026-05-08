import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { API_URL } from '@/constants/Config';
import { useRole } from './useRole';

export type SpaceStatus = 'available' | 'occupied' | 'maintenance';
export type ReservationStatus = 'REVISIÓN' | 'CONFIRMADA' | 'EN ESPERA' | 'RECHAZADA';
export type ReportStatus = 'PENDIENTE' | 'EN PROCESO' | 'RESUELTO';
export type ReportPriority = 'Baja' | 'Media' | 'Alta';

export interface Space {
  id: string;
  title: string;
  category: string;
  block: string;
  capacity: string;
  status: SpaceStatus;
  floor?: number;
}

export interface Reservation {
  id: string;
  spaceId: string;
  spaceTitle: string;
  userName: string;
  creatorId?: string;
  role: string;
  date: string;
  time: string;
  status: ReservationStatus;
  type: string;
  details?: string;
  priority?: 'ALTA' | 'NORMAL';
  message?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  space: string;
  priority: ReportPriority;
  status: ReportStatus;
  imageUri?: string;
  createdAt: string;
  userName: string;
}

interface CampusContextType {
  spaces: Space[];
  reservations: Reservation[];
  reports: Report[];
  // Actions
  toggleSpaceStatus: (id: string, status: SpaceStatus) => Promise<void>;
  addReport: (report: any) => Promise<void>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoaded: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const { userId } = useRole();
  const [isLoaded, setIsLoaded] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const spacesRef = React.useRef(spaces);
  const reservationsRef = React.useRef(reservations);
  const reportsRef = React.useRef(reports);

  useEffect(() => { spacesRef.current = spaces; }, [spaces]);
  useEffect(() => { reservationsRef.current = reservations; }, [reservations]);
  useEffect(() => { reportsRef.current = reports; }, [reports]);
  const refreshData = React.useCallback(async () => {
    try {
      // Fetch Spaces
      const spacesRes = await fetch(`${API_URL}/spaces/`);
      if (spacesRes.ok) {
        const spacesData = await spacesRes.json();
        if (Array.isArray(spacesData)) {
          const mappedSpaces = spacesData.map((s: any) => ({
            id: s.id.toString(),
            title: s.name,
            category: s.category || 'salones',
            block: s.block || 'Edificio Principal',
            capacity: s.capacity?.toString() || '0',
            status: s.status as SpaceStatus,
            floor: s.floor
          }));
          if (JSON.stringify(mappedSpaces) !== JSON.stringify(spacesRef.current)) {
            setSpaces(mappedSpaces);
          }
        }
      }

      // Fetch Reservations
      let resUrl = `${API_URL}/reservations/`;
      if (userId) {
        resUrl += `?user_id=${userId}`;
      }
      const resRes = await fetch(resUrl);
      if (resRes.ok) {
        const resData = await resRes.json();
        if (Array.isArray(resData)) {
          const mappedReservations = resData.map((r: any) => ({
            id: r.id.toString(),
            spaceId: r.space_id.toString(),
            spaceTitle: r.space_title,
            userName: r.user_name,
            creatorId: r.user_id?.toString(),
            role: 'ESTUDIANTE', // Simplified
            date: new Date(r.start_time).toLocaleDateString(),
            time: `${new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(r.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            status: r.status as ReservationStatus,
            type: r.type || 'ESTUDIO',
            details: r.details,
            priority: r.priority as 'ALTA' | 'NORMAL'
          }));
          if (JSON.stringify(mappedReservations) !== JSON.stringify(reservationsRef.current)) {
            setReservations(mappedReservations);
          }
        }
      }

      // Fetch Reports
      const reportsRes = await fetch(`${API_URL}/incidents/`);
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        if (Array.isArray(reportsData)) {
          const mappedReports = reportsData.map((i: any) => {
            let mappedStatus: ReportStatus = 'PENDIENTE';
            if (i.status === 'in_progress') mappedStatus = 'EN PROCESO';
            else if (i.status === 'resolved' || i.status === 'closed') mappedStatus = 'RESUELTO';

            return {
              id: i.id.toString(),
              title: i.title,
              description: i.description,
              space: i.space_name || 'General',
              priority: i.priority as ReportPriority,
              status: mappedStatus,
              imageUri: i.image_url ? (i.image_url.startsWith('http') ? i.image_url : `${API_URL}${i.image_url}`) : undefined,
              createdAt: new Date(i.created_at).toLocaleString(),
              userName: i.user_name || 'Usuario Anónimo'
            };
          });
          if (JSON.stringify(mappedReports) !== JSON.stringify(reportsRef.current)) {
            setReports(mappedReports);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching campus data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
    // Refresh every 10 seconds for "real-time" feel
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const toggleSpaceStatus = async (id: string, status: SpaceStatus) => {
    try {
      await fetch(`${API_URL}/admin/spaces/${id}/toggle`, {
        method: 'PATCH'
      });
      await refreshData();
    } catch (error) {
      console.error('Error toggling space status:', error);
    }
  };

  const addReport = async (newReport: any) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      if (newReport.spaceId) {
        formData.append('space_id', newReport.spaceId);
      }
      formData.append('title', newReport.title);
      formData.append('description', newReport.description);
      formData.append('status', 'PENDIENTE');
      formData.append('priority', newReport.priority);
      if (newReport.imageUri) formData.append('image_url', newReport.imageUri);

      await fetch(`${API_URL}/incidents/`, {
        method: 'POST',
        body: formData,
      });
      refreshData();
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const updateReportStatus = async (id: string, status: ReportStatus) => {
    console.log('Update report status:', id, status);
  };

  return (
    <CampusContext.Provider value={{
      spaces,
      reservations,
      reports,
      toggleSpaceStatus,
      addReport,
      updateReportStatus,
      refreshData,
      isLoaded
    }}>
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
