
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTask, Task } from './TaskContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type NotificationPreference = {
  enabled: boolean;
  categories: Record<string, boolean>;
  priorities: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  locationBased: boolean;
  contextAware: boolean;
  intensity: 'low' | 'medium' | 'high';
};

export type NotificationType = 'reminder' | 'dueDate' | 'suggestion' | 'overdue' | 'achievement';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  taskId?: string;
  createdAt: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: 'complete' | 'postpone' | 'view' | 'dismiss';
  }>;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  related?: string[];
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference;
  updatePreferences: (prefs: Partial<NotificationPreference>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  performAction: (notificationId: string, action: string) => void;
  enableFocusMode: (minutes: number) => void;
  disableFocusMode: () => void;
  isFocusModeActive: boolean;
  focusModeEndTime?: Date;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { tasks, updateTask } = useTask();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    enabled: true,
    categories: { personal: true, work: true, fitness: true, academic: true },
    priorities: { high: true, medium: true, low: true },
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    locationBased: true,
    contextAware: true,
    intensity: 'medium',
  });
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusModeEndTime, setFocusModeEndTime] = useState<Date | undefined>(undefined);

  // Carregar preferências e notificações do localStorage
  useEffect(() => {
    if (user) {
      const storedPrefs = localStorage.getItem(`notification-prefs-${user.id}`);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }

      const storedNotifications = localStorage.getItem(`notifications-${user.id}`);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications, (key, value) => {
          if (key === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
        setNotifications(parsedNotifications);
      }
    }
  }, [user]);

  // Salvar preferências no localStorage quando mudarem
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification-prefs-${user.id}`, JSON.stringify(preferences));
    }
  }, [preferences, user]);

  // Salvar notificações no localStorage quando mudarem
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Verifica as tarefas para gerar notificações contextuais
  useEffect(() => {
    if (!preferences.enabled || !tasks.length || isFocusModeActive) return;

    // Verificar horário silencioso
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const isQuietHours = preferences.quietHoursStart && preferences.quietHoursEnd && 
      ((preferences.quietHoursStart <= currentHour && preferences.quietHoursEnd >= currentHour) || 
       (preferences.quietHoursStart > preferences.quietHoursEnd && 
        (currentHour >= preferences.quietHoursStart || currentHour <= preferences.quietHoursEnd)));

    if (isQuietHours) return;

    // Verificar tarefas que estão prestes a vencer
    const upcomingTasks = tasks.filter(task => {
      if (task.completed) return false;
      
      const dueDate = new Date(task.dueDate);
      const minutesUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60);
      
      // Verificar se a categoria e prioridade estão habilitadas
      const isCategoryEnabled = preferences.categories[task.category];
      const isPriorityEnabled = preferences.priorities[task.priority];
      
      return !task.completed && 
             minutesUntilDue > 0 && 
             minutesUntilDue <= (task.reminderTime ?? 30) && 
             isCategoryEnabled && 
             isPriorityEnabled;
    });

    // Agrupar tarefas por categoria
    const tasksByCategory = upcomingTasks.reduce((grouped, task) => {
      if (!grouped[task.category]) {
        grouped[task.category] = [];
      }
      grouped[task.category].push(task);
      return grouped;
    }, {} as Record<string, Task[]>);

    // Criar notificações agrupadas por categoria
    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
      if (categoryTasks.length === 1) {
        const task = categoryTasks[0];
        
        // Verificar se já existe notificação para esta tarefa
        const existingNotification = notifications.find(n => 
          n.taskId === task.id && n.type === 'reminder' && !n.read
        );
        
        if (!existingNotification) {
          createNotification({
            title: 'Lembrete de tarefa',
            message: `"${task.title}" vence em breve`,
            type: 'reminder',
            taskId: task.id,
            category,
            priority: task.priority,
            actions: [
              { label: 'Concluir', action: 'complete' },
              { label: 'Adiar', action: 'postpone' },
              { label: 'Ver', action: 'view' }
            ]
          });
        }
      } else {
        // Notificação agrupada para múltiplas tarefas
        const hasPriorityHigh = categoryTasks.some(t => t.priority === 'high');
        
        // Verificar se já existe notificação agrupada para esta categoria
        const existingGroupNotification = notifications.find(n => 
          n.category === category && n.type === 'reminder' && !n.read && n.related
        );
        
        if (!existingGroupNotification) {
          const taskIds = categoryTasks.map(t => t.id);
          const categoryName = getCategoryName(category);
          
          createNotification({
            title: `Múltiplas tarefas de ${categoryName}`,
            message: `Você tem ${categoryTasks.length} tarefas de ${categoryName} que vencem em breve`,
            type: 'reminder',
            category,
            priority: hasPriorityHigh ? 'high' : 'medium',
            related: taskIds,
            actions: [
              { label: 'Ver todas', action: 'view' }
            ]
          });
        }
      }
    });

    // Verificar tarefas atrasadas
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return !task.completed && dueDate < now && preferences.categories[task.category] && preferences.priorities[task.priority];
    });

    if (overdueTasks.length > 0 && !notifications.some(n => n.type === 'overdue' && !n.read)) {
      createNotification({
        title: 'Tarefas atrasadas',
        message: `Você tem ${overdueTasks.length} ${overdueTasks.length === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}`,
        type: 'overdue',
        priority: 'high',
        actions: [
          { label: 'Ver tarefas', action: 'view' }
        ]
      });
    }

  }, [tasks, preferences.enabled, isFocusModeActive]);

  // Função para criar uma nova notificação
  const createNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      read: false,
      ...data
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostrar toast apenas se o usuário estiver na aplicação
    if (document.visibilityState === 'visible' && preferences.enabled) {
      toast(newNotification.title, {
        description: newNotification.message,
        action: newNotification.actions && newNotification.actions[0] ? {
          label: newNotification.actions[0].label,
          onClick: () => performAction(newNotification.id, newNotification.actions![0].action)
        } : undefined
      });
    }

    // Notificação do navegador se suportado
    if (Notification.permission === 'granted' && document.visibilityState === 'hidden' && preferences.enabled) {
      try {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.error('Failed to show browser notification', e);
      }
    }
  };

  // Traduzir nome da categoria
  const getCategoryName = (category: string): string => {
    const translations: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return translations[category] || category;
  };

  // Atualizar preferências de notificação
  const updatePreferences = (prefs: Partial<NotificationPreference>) => {
    setPreferences(prev => ({
      ...prev,
      ...prefs
    }));
  };

  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Limpar todas as notificações
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Realizar ação em uma notificação
  const performAction = (notificationId: string, action: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    switch (action) {
      case 'complete':
        if (notification.taskId) {
          updateTask(notification.taskId, { completed: true });
          toast.success('Tarefa marcada como concluída');
        }
        break;
      case 'view':
        // Aqui você poderia implementar navegação para visualizar a tarefa
        break;
      case 'postpone':
        if (notification.taskId) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          updateTask(notification.taskId, { dueDate: tomorrow });
          toast.success('Tarefa adiada para amanhã');
        }
        break;
    }

    markAsRead(notificationId);
  };

  // Ativar modo foco
  const enableFocusMode = (minutes: number) => {
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + minutes);
    setFocusModeEndTime(endTime);
    setIsFocusModeActive(true);
    toast.success(`Modo foco ativado por ${minutes} minutos`);

    // Desativar automaticamente após o tempo
    setTimeout(() => {
      disableFocusMode();
    }, minutes * 60 * 1000);
  };

  // Desativar modo foco
  const disableFocusMode = () => {
    setIsFocusModeActive(false);
    setFocusModeEndTime(undefined);
    toast.success('Modo foco desativado');
  };

  // Calcular número de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    preferences,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    performAction,
    enableFocusMode,
    disableFocusMode,
    isFocusModeActive,
    focusModeEndTime,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
