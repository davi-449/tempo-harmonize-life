
import { useState, useEffect } from 'react';
import { useNotifications, Notification } from '@/context/NotificationsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BellRing, Clock, Calendar, BellOff, CheckCheck, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NotificationsCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications, 
    performAction 
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(notifications);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    let result = [...notifications];
    
    // Aplicar pesquisa
    if (searchTerm) {
      result = result.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro por categoria
    if (selectedCategory) {
      result = result.filter(notification => notification.category === selectedCategory);
    }
    
    setFilteredNotifications(result);
  }, [notifications, searchTerm, selectedCategory]);
  
  // Agrupar notificações por data
  const getGroupedNotifications = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const earlier: Notification[] = [];
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      
      if (isToday(date)) {
        today.push(notification);
      } else if (isYesterday(date)) {
        yesterday.push(notification);
      } else {
        earlier.push(notification);
      }
    });
    
    return { today, yesterday, earlier };
  };
  
  const { today, yesterday, earlier } = getGroupedNotifications();
  
  // Obter categorias únicas
  const categories = Array.from(
    new Set(notifications.map(notification => notification.category).filter(Boolean))
  );
  
  const formatNotificationDate = (date: Date) => {
    if (isToday(date)) {
      return `Hoje, ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else if (isYesterday(date)) {
      return `Ontem, ${format(date, 'HH:mm', { locale: ptBR })}`;
    } else {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    }
  };
  
  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return "";
    
    const categories: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[category] || category;
  };
  
  const getCategoryClass = (category: string | undefined) => {
    if (!category) return "";
    
    const classes: Record<string, string> = {
      'personal': 'bg-[#E5DEFF] text-[#5D4A9C]',
      'work': 'bg-[#D3E4FD] text-[#3A5F8A]',
      'fitness': 'bg-[#F2FCE2] text-[#55803E]',
      'academic': 'bg-[#FEF7CD] text-[#9C7E23]'
    };
    
    return classes[category] || "";
  };
  
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'reminder': 'Lembrete',
      'dueDate': 'Prazo',
      'suggestion': 'Sugestão',
      'overdue': 'Atrasado',
      'achievement': 'Conquista'
    };
    
    return types[type] || type;
  };
  
  const getTypeClass = (type: string) => {
    const classes: Record<string, string> = {
      'reminder': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'dueDate': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'suggestion': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'achievement': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };
    
    return classes[type] || "";
  };
  
  const renderNotificationGroup = (groupTitle: string, notifications: Notification[]) => {
    if (notifications.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">{groupTitle}</h3>
        
        {notifications.map(notification => (
          <Card 
            key={notification.id} 
            className={cn(
              "overflow-hidden transition-all hover:shadow-md cursor-pointer",
              !notification.read ? "border-l-4 border-l-primary" : ""
            )}
            onClick={() => markAsRead(notification.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <h4 className="font-medium">{notification.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {notification.category && (
                      <Badge variant="outline" className={getCategoryClass(notification.category)}>
                        {getCategoryLabel(notification.category)}
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className={getTypeClass(notification.type)}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                    
                    {notification.priority && (
                      <Badge variant="outline" className={
                        notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                        notification.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : 
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }>
                        Prioridade {
                          notification.priority === 'high' ? 'Alta' : 
                          notification.priority === 'medium' ? 'Média' : 'Baixa'
                        }
                      </Badge>
                    )}
                  </div>
                  
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {notification.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            performAction(notification.id, action.action);
                          }}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {formatNotificationDate(new Date(notification.createdAt))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar notificações..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? "bg-secondary" : ""}
          >
            <Filter className="h-4 w-4 mr-1" />
            Todos
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                selectedCategory === category ? "bg-secondary" : "",
                "hidden sm:flex" // Ocultar em telas muito pequenas
              )}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Separação por abas */}
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            <span>Tudo</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Não lidas</span>
            <Badge variant="secondary" className="ml-auto">
              {filteredNotifications.filter(n => !n.read).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Hoje</span>
            <Badge variant="secondary" className="ml-auto">
              {today.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="muted" className="flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            <span>Silenciadas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6 pr-4">
              {filteredNotifications.length > 0 ? (
                <>
                  {renderNotificationGroup("Hoje", today)}
                  {renderNotificationGroup("Ontem", yesterday)}
                  {renderNotificationGroup("Anteriores", earlier)}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <CheckCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Nenhuma notificação encontrada</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm || selectedCategory 
                      ? "Tente ajustar seus filtros de pesquisa." 
                      : "Você está em dia com todas as notificações."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6 pr-4">
              {filteredNotifications.filter(n => !n.read).length > 0 ? (
                <div className="space-y-4">
                  {renderNotificationGroup("Não Lidas", filteredNotifications.filter(n => !n.read))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <CheckCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Nenhuma notificação não lida</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você já visualizou todas as notificações.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="today" className="space-y-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6 pr-4">
              {today.length > 0 ? (
                <div className="space-y-4">
                  {renderNotificationGroup("Hoje", today)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <CheckCheck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Nenhuma notificação hoje</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há notificações novas para o dia de hoje.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="muted" className="space-y-4">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Notificações silenciadas</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure quais notificações você deseja silenciar na seção de Configurações.
            </p>
            <Button variant="outline" className="mt-4">
              Ir para Configurações
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Botões de ação */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline" 
            onClick={() => markAllAsRead()}
            disabled={!filteredNotifications.some(n => !n.read)}
          >
            Marcar todas como lidas
          </Button>
          <Button
            variant="outline" 
            onClick={() => clearNotifications()}
          >
            Limpar notificações
          </Button>
        </div>
      )}
    </div>
  );
}
