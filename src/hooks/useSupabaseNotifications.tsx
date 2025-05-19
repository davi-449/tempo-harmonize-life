
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { Notification } from '@/context/NotificationsContext';
import { Json } from '@/integrations/supabase/types';

export interface NotificationPreferences {
  intensity: 'low' | 'medium' | 'high';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categorySettings: Record<string, boolean>;
}

export function useSupabaseNotifications() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isFocusModeActive, setIsFocusModeActive] = useState<boolean>(false);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchPreferences();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Parse dates and ensure correct types
      const parsedNotifications = data.map(notification => ({
        ...notification,
        created_at: new Date(notification.created_at),
        actions: notification.actions as any[] || []
      })) as Notification[];
      
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No record found
          return;
        }
        throw error;
      }
      
      if (data) {
        const prefs = {
          intensity: data.intensity || 'medium',
          quietHours: data.quiet_hours || { enabled: false, start: '22:00', end: '08:00' },
          categorySettings: data.category_settings || {}
        };
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notificação excluída');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao excluir notificação');
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          user_id: user.id,
          read: false
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newNotification = {
          ...data[0],
          created_at: new Date(data[0].created_at),
          actions: data[0].actions as any[] || []
        } as Notification;
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  // Additional functions needed by components
  const clearNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id || '');
      
      if (error) throw error;
      
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Todas as notificações foram excluídas');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Erro ao excluir notificações');
    }
  };

  const performAction = async (notificationId: string, actionIndex: number) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || !notification.actions || actionIndex >= notification.actions.length) {
        return;
      }
      
      const action = notification.actions[actionIndex];
      // In a real app, you would implement the action here
      console.log('Performing action:', action);
      
      // Mark as read after action
      await markAsRead(notificationId);
      
      // Example: if action is related to a task
      if (action.type === 'view_task' && action.taskId) {
        // Navigate to task or show task detail
      }
      
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Erro ao executar ação');
    }
  };

  const updatePreferences = async (prefs: any) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          intensity: prefs.intensity,
          quiet_hours: prefs.quietHours,
          category_settings: prefs.categorySettings
        });
      
      if (error) throw error;
      
      setPreferences(prefs);
      toast.success('Preferências atualizadas');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Erro ao atualizar preferências');
    }
  };

  const enableFocusMode = async () => {
    setIsFocusModeActive(true);
    toast.success('Modo foco ativado');
    // In a real app, you would persist this state
  };

  const disableFocusMode = async () => {
    setIsFocusModeActive(false);
    toast.success('Modo foco desativado');
    // In a real app, you would persist this state
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refreshNotifications: fetchNotifications,
    clearNotifications,
    performAction,
    preferences,
    updatePreferences,
    enableFocusMode,
    isFocusModeActive,
    disableFocusMode
  };
}
