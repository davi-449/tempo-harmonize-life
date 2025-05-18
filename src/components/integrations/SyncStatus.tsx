
import { useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSyncStatus } from '@/services/syncService';
import { useAuth } from '@/context/AuthContext';

interface SyncStatusProps {
  type: 'calendar' | 'health';
}

export default function SyncStatus({ type }: SyncStatusProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      const status = getSyncStatus(user.id);
      setStatus(type === 'calendar' ? status.calendar : status.health);
    }

    const interval = setInterval(() => {
      if (user) {
        const status = getSyncStatus(user.id);
        setStatus(type === 'calendar' ? status.calendar : status.health);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, type]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      if (user) {
        const status = getSyncStatus(user.id);
        setStatus(type === 'calendar' ? status.calendar : status.health);
      }
      setRefreshing(false);
    }, 1000);
  };

  if (!status) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Sem dados de sincronização</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status.inProgress ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : status.status === 'success' ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : status.status === 'error' ? (
            <X className="h-4 w-4 text-red-500" />
          ) : (
            <span className="h-4 w-4 rounded-full bg-gray-300" />
          )}

          <span>
            {status.lastSync && (
              <>
                Última sincronização: {formatDistanceToNow(new Date(status.lastSync), { addSuffix: true, locale: ptBR })}
              </>
            )}
          </span>
        </div>

        <button onClick={handleRefresh} disabled={refreshing || status.inProgress} className="p-1 hover:bg-muted rounded-full">
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {status.changes && (
        <div className="text-xs text-muted-foreground">
          {status.changes.created} criados, {status.changes.updated} atualizados, {status.changes.deleted} excluídos
        </div>
      )}

      {status.count !== undefined && (
        <div className="text-xs text-muted-foreground">
          {status.count} registros sincronizados
        </div>
      )}

      {status.status === 'error' && status.error && (
        <div className="text-xs text-red-500">
          Erro: {status.error}
        </div>
      )}
    </div>
  );
}
