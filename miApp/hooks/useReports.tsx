import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '@/constants/Config';
import { useRole } from './useRole';
import { Platform } from 'react-native';
import axios from 'axios';

export type ReportStatus = 'PENDIENTE' | 'EN PROCESO' | 'RESUELTO';
export type ReportPriority = 'Baja' | 'Media' | 'Alta';

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
  userId: string;
}

interface ReportContextType {
  reports: Report[];
  addReport: (report: any) => Promise<void>;
  updateStatus: (id: string, status: ReportStatus) => Promise<void>;
  refreshReports: () => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const { userId } = useRole();
  const [reports, setReports] = useState<Report[]>([]);

  const refreshReports = async () => {
    try {
      const res = await fetch(`${API_URL}/incidents/`);
      if (!res.ok) {
        console.warn('Failed to fetch incidents:', res.status);
        return;
      }
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn('Expected array for incidents, got:', typeof data);
        return;
      }

      const mappedReports = data.map((i: any) => {
        let mappedStatus: ReportStatus = 'PENDIENTE';
        if (i.status === 'in_progress') mappedStatus = 'EN PROCESO';
        else if (i.status === 'resolved' || i.status === 'closed') mappedStatus = 'RESUELTO';

        return {
          id: i.id,
          title: i.title,
          description: i.description,
          space: i.space_name || 'General',
          priority: i.priority as ReportPriority,
          status: mappedStatus,
          imageUri: i.image_url ? (i.image_url.startsWith('http') ? i.image_url : `${API_URL}${i.image_url}`) : undefined,
          createdAt: new Date(i.created_at).toLocaleString(),
          userName: i.user_name || 'Usuario Anónimo',
          userId: String(i.user_id)
        };
      });
      setReports(mappedReports);
    } catch (error) {
      console.error('Error refreshing reports:', error);
    }
  };

  useEffect(() => {
    refreshReports();
    const interval = setInterval(refreshReports, 8000);
    return () => clearInterval(interval);
  }, []);

  const addReport = async (newReport: any) => {
    if (!userId) {
      console.error('Error: userId is missing. Cannot add report.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      if (newReport.spaceId) {
        formData.append('space_id', newReport.spaceId);
      }
      formData.append('title', newReport.title);
      formData.append('description', newReport.description);
      formData.append('status', 'open');
      formData.append('priority', newReport.priority);

      if (newReport.imageUri) {
        const uri = newReport.imageUri;
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = uri.split('/').pop() || `incident_${Date.now()}.${fileType}`;

        // React Native FormData requires this specific object structure for files
        const fileToUpload = {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: fileName,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        };

        formData.append('image', fileToUpload as any);
      }

      const res = await axios.post(`${API_URL}/incidents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        console.error('Failed to create report', res.data);
        return;
      }
      refreshReports();
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const updateStatus = async (id: string, status: ReportStatus) => {
    try {
      let backendStatus = 'open';
      if (status === 'EN PROCESO') backendStatus = 'in_progress';
      else if (status === 'RESUELTO') backendStatus = 'resolved';

      const formData = new FormData();
      formData.append('status', backendStatus);

      const res = await fetch(`${API_URL}/incidents/${id}/status`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        console.error('Failed to update status', await res.text());
        return;
      }
      refreshReports();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, updateStatus, refreshReports }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}
