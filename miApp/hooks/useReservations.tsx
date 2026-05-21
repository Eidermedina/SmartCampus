import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '@/constants/Config';
import { useRole } from './useRole';
import { useAuthStore } from '@/store/useAuthStore';

export type ReservationStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'EN ESPERA';

export interface Reservation {
  id: string;
  spaceId: string;
  spaceTitle: string;
  userName: string;
  creatorId?: string;
  date: string;
  time: string;
  status: ReservationStatus;
  type: string;
}

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: any) => Promise<void>;
  updateStatus: (id: string, status: ReservationStatus) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { userId, role } = useRole();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const refreshReservations = async () => {
    if (!userId) return;
    try {
      const url = role === 'admin' ? `${API_URL}/reservations/` : `${API_URL}/reservations/?user_id=${userId}`;
      const res = await fetch(url);
      const data = await res.json();
      setReservations(data.map((r: any) => ({
        id: r.id.toString(),
        spaceId: r.space_id.toString(),
        spaceTitle: r.space_title,
        userName: r.user_name,
        creatorId: r.user_id?.toString(),
        date: new Date(r.start_time).toLocaleDateString(),
        time: `${r.start_time.substring(11, 16)} - ${r.end_time.substring(11, 16)}`,
        status: r.status as ReservationStatus,
        type: r.type || 'ESTUDIO',
        priority: r.priority || 'NORMAL',
        message: r.details
      })));
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    refreshReservations();
    const interval = setInterval(refreshReservations, 10000);
    return () => clearInterval(interval);
  }, [userId, role]);

  const token = useAuthStore(state => state.token);

  const addReservation = async (newRes: any) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('space_id', newRes.spaceId);
      formData.append('start_time', newRes.startTime || new Date().toISOString());
      formData.append('end_time', newRes.endTime || new Date().toISOString());
      formData.append('status', 'PENDIENTE');
      if (newRes.groupId) formData.append('group_id', newRes.groupId);
      if (newRes.type) formData.append('type', newRes.type);
      if (newRes.priority) formData.append('priority', newRes.priority);
      if (newRes.details) formData.append('details', newRes.details);

      const res = await fetch(`${API_URL}/reservations/`, { 
        method: 'POST', 
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear la reserva');
      }
      refreshReservations();
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  };

  const updateStatus = async (id: string, status: ReservationStatus) => {
    try {
      await fetch(`${API_URL}/reservations/${id}?status=${status}`, { 
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      refreshReservations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      await fetch(`${API_URL}/reservations/${id}`, { 
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      refreshReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  return (
    <ReservationContext.Provider value={{ reservations, addReservation, updateStatus, deleteReservation, refreshReservations }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}
