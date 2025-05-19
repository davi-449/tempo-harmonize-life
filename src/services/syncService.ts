
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

// Chave para armazenamento local de operações offline
const OFFLINE_OPS_KEY = 'kairos_offline_operations';

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
