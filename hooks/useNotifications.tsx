import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '@/constants/Config';
import { useRole } from './useRole';

export type NotificationType = 'success' | 'alert' | 'info';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  time: string;
  isRead: boolean;
  userName: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (noti: any) => Promise<void>;
  sendNotificationToUser: (targetUserId: string, noti: any) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  acceptInvitation: (notificationId: string, groupId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { userId } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = async () => {
    if (!userId || isNaN(parseInt(userId))) return;

    try {
      const res = await fetch(`${API_URL}/notifications/user/${userId}`);
      if (!res.ok) {
        console.warn('Failed to fetch notifications:', res.status);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.warn('Expected array for notifications, got:', typeof data);
        return;
      }
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        type: n.type as NotificationType,
        time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: n.is_read,
        userName: 'SISTEMA' // Simplified
      }));
      if (JSON.stringify(mapped) !== JSON.stringify(notifications)) {
        setNotifications(mapped);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 8000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
      refreshNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
      refreshNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = async (noti: any) => {
    if (!userId || isNaN(parseInt(userId))) return;
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('title', noti.title);
      formData.append('description', noti.description);
      formData.append('type', noti.type || 'info');
      formData.append('is_read', 'false');

      await fetch(`${API_URL}/notifications/`, {
        method: 'POST',
        body: formData,
      });
      refreshNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const sendNotificationToUser = async (targetUserId: string, noti: any) => {
    try {
      const formData = new FormData();
      formData.append('user_id', targetUserId);
      formData.append('title', noti.title);
      formData.append('description', noti.description);
      formData.append('type', noti.type || 'info');
      formData.append('is_read', 'false');

      await fetch(`${API_URL}/notifications/`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  };

  const acceptInvitation = async (notificationId: string, groupId: string) => {
    if (!userId || isNaN(parseInt(userId))) return;
    try {
      const formData = new FormData();
      formData.append('notification_id', notificationId);
      formData.append('group_id', groupId);
      formData.append('user_id', userId);

      await fetch(`${API_URL}/study-groups/accept-invitation`, {
        method: 'POST',
        body: formData,
      });
      refreshNotifications();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      markAsRead, 
      deleteNotification, 
      addNotification,
      sendNotificationToUser,
      refreshNotifications,
      acceptInvitation
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
