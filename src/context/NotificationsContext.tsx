
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { Json } from '@/integrations/supabase/types';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: Date;
  task_id?: string;
  category?: string;
  priority?: string;
  actions?: any[];
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Additional methods needed by components
  clearNotifications: () => Promise<void>;
  performAction: (notificationId: string, actionIndex: number) => Promise<void>;
  preferences: any;
  updatePreferences: (prefs: any) => Promise<void>;
  enableFocusMode: () => Promise<void>;
  isFocusModeActive: boolean;
  disableFocusMode: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const notificationsManager = useSupabaseNotifications();
  
  return (
    <NotificationsContext.Provider value={notificationsManager as NotificationsContextType}>
      {children}
    </NotificationsContext.Provider>
  );
};
