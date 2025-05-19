
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useSupabaseTasks';
import { toast } from 'sonner';

// Interface para registro de operações offline
interface OfflineOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

// Interface para dados de métricas de saúde
interface HealthData {
  date: string;
  steps?: number;
  sleepHours?: number;
  heartRate?: number;
}

// Interface para correlação de saúde e produtividade
interface HealthProductivityCorrelation {
  correlations: Array<{
    date: string;
    sleepHours: number;
    steps: number;
    heartRate?: number;
    completionRate: number;
  }>;
  insights: Array<{
    type: string;
    description: string;
    score: number;
  }>;
}

// Interface para status de sincronização
interface SyncStatus {
  inProgress?: boolean;
  status: 'none' | 'success' | 'error';
  lastSync?: string;
  changes?: {
    created: number;
    updated: number;
    deleted: number;
  };
  count?: number;
  error?: string;
}

// Interface para status de sincronização completo
interface UserSyncStatus {
  calendar: SyncStatus;
  health: SyncStatus;
}

// Chave para armazenamento local de operações offline
const OFFLINE_OPS_KEY = 'kairos_offline_operations';
const SYNC_STATUS_KEY = 'kairos_sync_status';

// Verificar conexão com a internet
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Salvar operação offline
export const saveOfflineOperation = (
  table: string,
  operation: 'insert' | 'update' | 'delete',
  data: any
): void => {
  try {
    const offlineOps = getOfflineOperations();
    
    const newOp: OfflineOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      table,
      operation,
      data,
      timestamp: Date.now(),
      synced: false,
    };
    
    offlineOps.push(newOp);
    localStorage.setItem(OFFLINE_OPS_KEY, JSON.stringify(offlineOps));
  } catch (error) {
    console.error('Error saving offline operation:', error);
  }
};

// Obter operações offline
export const getOfflineOperations = (): OfflineOperation[] => {
  try {
    const ops = localStorage.getItem(OFFLINE_OPS_KEY);
    return ops ? JSON.parse(ops) : [];
  } catch (error) {
    console.error('Error getting offline operations:', error);
    return [];
  }
};

// Marcar operação como sincronizada
export const markOperationSynced = (id: string): void => {
  try {
    const offlineOps = getOfflineOperations();
    const updatedOps = offlineOps.map(op => 
      op.id === id ? { ...op, synced: true } : op
    );
    
    localStorage.setItem(OFFLINE_OPS_KEY, JSON.stringify(updatedOps));
  } catch (error) {
    console.error('Error marking operation as synced:', error);
  }
};

// Limpar operações sincronizadas
export const clearSyncedOperations = (): void => {
  try {
    const offlineOps = getOfflineOperations();
    const pendingOps = offlineOps.filter(op => !op.synced);
    
    localStorage.setItem(OFFLINE_OPS_KEY, JSON.stringify(pendingOps));
  } catch (error) {
    console.error('Error clearing synced operations:', error);
  }
};

// Sincronizar todas as operações pendentes
export const syncOfflineOperations = async (): Promise<boolean> => {
  if (!isOnline()) {
    return false;
  }
  
  try {
    const offlineOps = getOfflineOperations().filter(op => !op.synced);
    
    if (offlineOps.length === 0) {
      return true;
    }
    
    // Ordenar operações por timestamp
    offlineOps.sort((a, b) => a.timestamp - b.timestamp);
    
    let syncedCount = 0;
    
    for (const op of offlineOps) {
      let success = false;
      
      switch (op.table) {
        case 'tasks':
          success = await syncTaskOperation(op);
          break;
        // Adicionar outros tipos de tabelas conforme necessário
        default:
          console.warn(`Unsupported table for sync: ${op.table}`);
          break;
      }
      
      if (success) {
        markOperationSynced(op.id);
        syncedCount++;
      }
    }
    
    if (syncedCount > 0) {
      toast.success(`${syncedCount} operações sincronizadas com sucesso!`);
      clearSyncedOperations();
    }
    
    return syncedCount === offlineOps.length;
  } catch (error) {
    console.error('Error syncing offline operations:', error);
    toast.error('Erro ao sincronizar dados');
    return false;
  }
};

// Sincronizar operação de tarefa
async function syncTaskOperation(op: OfflineOperation): Promise<boolean> {
  try {
    switch (op.operation) {
      case 'insert': {
        const { error } = await supabase
          .from('tasks')
          .insert([op.data]);
        
        return !error;
      }
      case 'update': {
        const { id, ...updates } = op.data;
        const { error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id);
        
        return !error;
      }
      case 'delete': {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', op.data.id);
        
        return !error;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error syncing task operation (${op.operation}):`, error);
    return false;
  }
}

// Configurar event listeners para verificar o estado da conexão
export const setupSyncListeners = (): void => {
  // Tentar sincronizar quando a conexão voltar
  window.addEventListener('online', async () => {
    toast.info('Conexão com a internet restaurada, sincronizando dados...');
    await syncOfflineOperations();
  });
  
  // Notificar quando a conexão cair
  window.addEventListener('offline', () => {
    toast.warning('Conexão com a internet perdida, operações serão salvas localmente');
  });
};

// Obter status de sincronização para um usuário
export const getSyncStatus = (userId: string): UserSyncStatus => {
  try {
    const statusJson = localStorage.getItem(`${SYNC_STATUS_KEY}_${userId}`);
    const defaultStatus: SyncStatus = { status: 'none' };
    
    if (!statusJson) {
      return {
        calendar: defaultStatus,
        health: defaultStatus
      };
    }
    
    const status = JSON.parse(statusJson);
    return {
      calendar: status.calendar || defaultStatus,
      health: status.health || defaultStatus
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      calendar: { status: 'error', error: 'Erro ao carregar status de sincronização' },
      health: { status: 'error', error: 'Erro ao carregar status de sincronização' }
    };
  }
};

// Atualizar status de sincronização para um usuário
export const updateSyncStatus = (userId: string, type: 'calendar' | 'health', status: Partial<SyncStatus>): void => {
  try {
    const currentStatus = getSyncStatus(userId);
    const newStatus = { 
      ...currentStatus, 
      [type]: { 
        ...currentStatus[type], 
        ...status, 
        lastSync: status.lastSync || (status.status === 'success' ? new Date().toISOString() : currentStatus[type].lastSync) 
      } 
    };
    
    localStorage.setItem(`${SYNC_STATUS_KEY}_${userId}`, JSON.stringify(newStatus));
  } catch (error) {
    console.error('Error updating sync status:', error);
  }
};

// Sincronizar tarefas com Google Calendar
export const syncTasksWithGoogleCalendar = async (userId: string): Promise<boolean> => {
  if (!isOnline()) {
    return false;
  }

  updateSyncStatus(userId, 'calendar', { inProgress: true });
  
  try {
    // Aqui seria implementada a lógica real de sincronização com Google Calendar
    // Esta é uma implementação simulada para demonstração
    
    // Simulação de operação assíncrona
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Atualiza o status com sucesso
    updateSyncStatus(userId, 'calendar', {
      status: 'success',
      inProgress: false,
      changes: { created: 3, updated: 2, deleted: 0 }
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    
    // Atualiza o status com erro
    updateSyncStatus(userId, 'calendar', {
      status: 'error',
      inProgress: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

// Sincronizar dados de saúde com Google Fit
export const syncHealthDataWithGoogleFit = async (userId: string): Promise<boolean> => {
  if (!isOnline()) {
    return false;
  }

  updateSyncStatus(userId, 'health', { inProgress: true });
  
  try {
    // Aqui seria implementada a lógica real de sincronização com Google Fit
    // Esta é uma implementação simulada para demonstração
    
    // Simulação de operação assíncrona
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Atualiza o status com sucesso
    updateSyncStatus(userId, 'health', {
      status: 'success',
      inProgress: false,
      count: 8
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing with Google Fit:', error);
    
    // Atualiza o status com erro
    updateSyncStatus(userId, 'health', {
      status: 'error',
      inProgress: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return false;
  }
};

// Correlacionar dados de saúde com produtividade
export const correlateHealthWithProductivity = (healthData: HealthData[], tasks: Task[]): HealthProductivityCorrelation => {
  const correlations = [];
  const insights = [];
  
  // Mapeia datas para calcular taxa de conclusão de tarefas
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach(task => {
    if (task.due_date) {
      const dateStr = new Date(task.due_date).toISOString().split('T')[0];
      if (!tasksByDate[dateStr]) {
        tasksByDate[dateStr] = [];
      }
      tasksByDate[dateStr].push(task);
    }
  });
  
  // Correlaciona dados de saúde com conclusão de tarefas
  for (const data of healthData) {
    const dateStr = data.date;
    const tasksForDate = tasksByDate[dateStr] || [];
    const completedTasks = tasksForDate.filter(task => task.completed).length;
    const totalTasks = tasksForDate.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    correlations.push({
      date: dateStr,
      sleepHours: data.sleepHours || 0,
      steps: data.steps || 0,
      heartRate: data.heartRate,
      completionRate
    });
  }
  
  // Gera insights baseados nos dados
  if (correlations.length >= 3) {
    // Insight sobre sono
    const goodSleepDays = correlations.filter(day => day.sleepHours >= 7);
    const badSleepDays = correlations.filter(day => day.sleepHours < 7);
    
    if (goodSleepDays.length > 0 && badSleepDays.length > 0) {
      const goodSleepAvgCompletion = goodSleepDays.reduce((sum, day) => sum + day.completionRate, 0) / goodSleepDays.length;
      const badSleepAvgCompletion = badSleepDays.reduce((sum, day) => sum + day.completionRate, 0) / badSleepDays.length;
      
      if (goodSleepAvgCompletion > badSleepAvgCompletion * 1.2) {
        insights.push({
          type: 'sleep',
          description: 'Dormir bem (7+ horas) parece aumentar sua produtividade em cerca de ' + 
                      Math.round((goodSleepAvgCompletion / badSleepAvgCompletion - 1) * 100) + '%.',
          score: 0.8
        });
      }
    }
    
    // Insight sobre atividade física
    const activeStepThreshold = 7500;
    const activeDays = correlations.filter(day => day.steps >= activeStepThreshold);
    const inactiveDays = correlations.filter(day => day.steps < activeStepThreshold);
    
    if (activeDays.length > 0 && inactiveDays.length > 0) {
      const activeAvgCompletion = activeDays.reduce((sum, day) => sum + day.completionRate, 0) / activeDays.length;
      const inactiveAvgCompletion = inactiveDays.reduce((sum, day) => sum + day.completionRate, 0) / inactiveDays.length;
      
      if (activeAvgCompletion > inactiveAvgCompletion * 1.1) {
        insights.push({
          type: 'activity',
          description: 'Dias com mais de ' + activeStepThreshold + ' passos correlacionam com ' + 
                      Math.round((activeAvgCompletion / inactiveAvgCompletion - 1) * 100) + '% mais produtividade.',
          score: 0.7
        });
      }
    }
  }
  
  return { correlations, insights };
};

// Inicializar o serviço de sincronização
export const initSyncService = (): void => {
  setupSyncListeners();
  
  // Tentar sincronizar operações pendentes ao carregar
  if (isOnline()) {
    setTimeout(async () => {
      await syncOfflineOperations();
    }, 2000);
  }
};
