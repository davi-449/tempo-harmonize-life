import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, useTask } from '@/context/TaskContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, Edit, Trash2, Share2, AlertCircle, SkipForward, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskDetail({ task, isOpen, onClose, onEdit, onDelete }: TaskDetailProps) {
  const { toggleCompleted, updateTask } = useTask();
  const [showPostponeOptions, setShowPostponeOptions] = useState(false);
  const [postponeDate, setPostponeDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  // Tradução de categorias
  const getCategoryName = (category: string): string => {
    const categories: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[category] || category;
  };
  
  // Tradução de prioridades
  const getPriorityName = (priority: string): string => {
    const priorities: Record<string, string> = {
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta'
    };
    
    return priorities[priority] || priority;
  };

  // Cores por prioridade
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return '';
    }
  };
  
  // Cores por categoria
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'personal': return 'bg-[#E5DEFF] text-[#5D4A9C] dark:bg-[#5D4A9C] dark:text-[#E5DEFF]';
      case 'work': return 'bg-[#D3E4FD] text-[#3A5F8A] dark:bg-[#3A5F8A] dark:text-[#D3E4FD]';
      case 'fitness': return 'bg-[#F2FCE2] text-[#55803E] dark:bg-[#55803E] dark:text-[#F2FCE2]';
      case 'academic': return 'bg-[#FEF7CD] text-[#9C7E23] dark:bg-[#9C7E23] dark:text-[#FEF7CD]';
      default: return '';
    }
  };
  
  const handleTaskComplete = () => {
    toggleCompleted(task.id);
    toast.success('Status da tarefa atualizado');
    onClose();
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: task.title,
        text: `${task.title}\n${task.description || ''}`,
      })
      .catch(() => toast.error('Falha ao compartilhar tarefa'));
    } else {
      try {
        navigator.clipboard.writeText(`${task.title}\n${task.description || ''}`);
        toast.success('Tarefa copiada para a área de transferência');
      } catch (err) {
        toast.error('Não foi possível copiar a tarefa');
      }
    }
  };
  
  const handlePostponeConfirm = () => {
    if (postponeDate) {
      updateTask(task.id, { dueDate: postponeDate });
      toast.success('Tarefa adiada com sucesso');
      setShowPostponeOptions(false);
      onClose();
    }
  };

  // Adiar para amanhã
  const postponeToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateTask(task.id, { dueDate: tomorrow });
    toast.success('Tarefa adiada para amanhã');
    onClose();
  };
  
  // Adiar para próxima semana
  const postponeToNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    updateTask(task.id, { dueDate: nextWeek });
    toast.success('Tarefa adiada para a próxima semana');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Badges de categoria e prioridade */}
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(task.category)}>
              {getCategoryName(task.category)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              Prioridade {getPriorityName(task.priority)}
            </Badge>
            {task.isRecurring && (
              <Badge variant="outline">
                Recorrente: {
                  task.recurrenceType === 'daily' ? 'Diário' : 
                  task.recurrenceType === 'weekly' ? 'Semanal' : 'Mensal'
                }
              </Badge>
            )}
          </div>
          
          {/* Descrição */}
          {task.description && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
              <p className="text-sm">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data de vencimento */}
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Data de Vencimento</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.dueDate), "PPP", { locale: ptBR })}
                </p>
              </div>
            </div>
            
            {/* Horário */}
            {task.startTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Horário</p>
                  <p className="text-sm text-muted-foreground">
                    {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                  </p>
                </div>
              </div>
            )}
            
            {/* Lembrete */}
            {task.reminderTime !== undefined && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Lembrete</p>
                  <p className="text-sm text-muted-foreground">
                    {task.reminderTime === 0 && 'No momento do evento'}
                    {task.reminderTime === 5 && '5 minutos antes'}
                    {task.reminderTime === 15 && '15 minutos antes'}
                    {task.reminderTime === 30 && '30 minutos antes'}
                    {task.reminderTime === 60 && '1 hora antes'}
                    {task.reminderTime === 120 && '2 horas antes'}
                    {task.reminderTime === 1440 && '1 dia antes'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Status */}
            <div className="flex items-start gap-2">
              <div className={`h-5 w-5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-amber-500'}`} />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {task.completed ? 'Concluída' : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {showPostponeOptions ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Escolha uma nova data</h4>
            <div className="flex flex-col items-center space-y-4">
              <Calendar
                mode="single"
                selected={postponeDate}
                onSelect={setPostponeDate}
                locale={ptBR}
                className="border rounded-md p-3 pointer-events-auto"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPostponeOptions(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handlePostponeConfirm} disabled={!postponeDate}>
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleTaskComplete}
              >
                <Check className="mr-2 h-4 w-4" />
                {task.completed ? 'Desmarcar' : 'Concluir'}
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Adiar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-4 space-y-2">
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={postponeToTomorrow}
                    >
                      Adiar para amanhã
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={postponeToNextWeek}
                    >
                      Adiar para próxima semana
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowPostponeOptions(true)}
                    >
                      Escolher outra data
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="secondary" 
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={onEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
