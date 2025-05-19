
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseNotifications, Notification } from '@/hooks/useSupabaseNotifications';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

// Reexportar o tipo Notification para uso em outros componentes
export type { Notification };

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const notificationsManager = useSupabaseNotifications();
  
  return (
    <NotificationsContext.Provider value={notificationsManager}>
      {children}
    </NotificationsContext.Provider>
  );
};
