
import { useState } from 'react';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function NotificationsMenu() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotifications,
    performAction
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.taskId) {
      // Navegar para a tarefa específica, quando implementado
      navigate('/dashboard');
    } else if (notification.type === 'overdue') {
      navigate('/dashboard');
    }
    
    setOpen(false);
  };

  const handleAction = (notificationId: string, action: string) => {
    performAction(notificationId, action);
    
    if (action === 'view') {
      navigate('/dashboard');
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-[1.2rem] w-[1.2rem]" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-sm font-medium">Notificações</h2>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs px-2">
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[calc(80vh-8rem)] max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-accent/50 flex flex-col gap-2",
                    notification.read ? "" : "bg-accent/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={cn(
                        "text-sm font-medium",
                        notification.read ? "text-foreground" : ""
                      )}>
                        {notification.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {notification.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(notification.id, action.action);
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center py-2 justify-center cursor-pointer text-xs text-muted-foreground"
              onClick={() => clearNotifications()}
            >
              Limpar todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
