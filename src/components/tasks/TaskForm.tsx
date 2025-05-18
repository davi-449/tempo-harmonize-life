
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTask, TaskCategory } from '@/context/TaskContext';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    category: TaskCategory;
    priority: 'low' | 'medium' | 'high';
  };
}

export default function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { addTask, updateTask } = useTask();
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(editTask?.dueDate ? new Date(editTask.dueDate) : undefined);
  const [category, setCategory] = useState<TaskCategory>(editTask?.category || 'personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(editTask?.priority || 'medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reminderTime, setReminderTime] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate) {
      toast.error('Título e data de vencimento são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        dueDate,
        category,
        priority,
        completed: false,
        // Adicionando novos campos
        isRecurring,
        recurrenceType: isRecurring ? recurrenceType : undefined,
        reminderTime: parseInt(reminderTime),
        startTime,
        endTime,
      };

      if (editTask) {
        updateTask(editTask.id, taskData);
        toast.success('Tarefa atualizada com sucesso');
      } else {
        addTask(taskData);
        toast.success('Tarefa adicionada com sucesso');
      }
      
      onClose();
      // Clear form if not editing
      if (!editTask) {
        setTitle('');
        setDescription('');
        setDueDate(undefined);
        setCategory('personal');
        setPriority('medium');
        setIsRecurring(false);
        setRecurrenceType('weekly');
        setReminderTime('30');
        setStartTime('09:00');
        setEndTime('10:00');
      }
    } catch (error) {
      toast.error('Falha ao salvar tarefa');
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para traduzir categorias
  const getCategoryName = (category: TaskCategory): string => {
    const categories: Record<TaskCategory, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[category];
  };

  // Função para traduzir prioridades
  const getPriorityName = (priority: 'low' | 'medium' | 'high'): string => {
    const priorities: Record<'low' | 'medium' | 'high', string> = {
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta'
    };
    
    return priorities[priority];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-fade-in">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</DialogTitle>
          <DialogDescription>
            {editTask 
              ? 'Atualize os detalhes da sua tarefa abaixo.' 
              : 'Preencha as informações abaixo para criar uma nova tarefa.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes sobre sua tarefa"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Data de Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  locale={ptBR}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de Início</Label>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Horário de Término</Label>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="work">Trabalho</SelectItem>
                  <SelectItem value="fitness">Academia</SelectItem>
                  <SelectItem value="academic">Faculdade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="recurring">Tarefa Recorrente</Label>
            </div>
            
            {isRecurring && (
              <Select
                value={recurrenceType}
                onValueChange={(value) => setRecurrenceType(value as 'daily' | 'weekly' | 'monthly')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de recorrência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">Lembrete</Label>
            <Select
              value={reminderTime}
              onValueChange={setReminderTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha quando ser notificado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No momento do evento</SelectItem>
                <SelectItem value="5">5 minutos antes</SelectItem>
                <SelectItem value="15">15 minutos antes</SelectItem>
                <SelectItem value="30">30 minutos antes</SelectItem>
                <SelectItem value="60">1 hora antes</SelectItem>
                <SelectItem value="120">2 horas antes</SelectItem>
                <SelectItem value="1440">1 dia antes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
