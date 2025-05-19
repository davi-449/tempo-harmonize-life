
import { useState } from 'react';
import { Task, useTask } from '@/context/TaskContext';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckIcon, CalendarIcon, EditIcon, TrashIcon, Clock, Share2, ArrowRight } from 'lucide-react';
import TaskForm from './TaskForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import TaskDetail from './TaskDetail';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
}

export default function TaskList({ tasks, title = 'Tarefas', emptyMessage = 'Nenhuma tarefa encontrada' }: TaskListProps) {
  const { toggleCompleted, deleteTask } = useTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const handleTaskComplete = (taskId: string) => {
    toggleCompleted(taskId);
    toast.success('Status da tarefa atualizado');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast.success('Tarefa excluída');
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const getPriorityText = (priority: string) => {
    const translations: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa'
    };
    return translations[priority] || priority;
  };

  return (
    <div className="space-y-4 w-full">
      {title && <h2 className="text-xl font-medium">{title}</h2>}
      
      {tasks.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={cn(
                "task-card animate-fade-in",
                task.completed ? "opacity-60" : "",
                "cursor-pointer hover:shadow-md transition-all"
              )}
              onClick={() => handleViewTask(task)}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      handleTaskComplete(task.id);
                      // Prevent opening task details when clicking checkbox
                      event?.stopPropagation();
                    }}
                    className="h-5 w-5"
                  />
                  <CardTitle className={cn(
                    "text-base font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </CardTitle>
                </div>
                <CategoryBadge category={task.category} />
              </CardHeader>
              
              {task.description && (
                <CardContent className="pt-2 pb-0 text-sm text-muted-foreground">
                  <p className="line-clamp-2">{task.description}</p>
                </CardContent>
              )}
              
              <CardFooter className="flex justify-between items-center pt-4">
                <div className="flex flex-col xs:flex-row xs:items-center text-xs text-muted-foreground gap-1 xs:gap-2">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>Vencimento: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  
                  {task.start_time && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{task.start_time} {task.end_time ? `- ${task.end_time}` : ''}</span>
                    </div>
                  )}
                  
                  <span className={cn("font-medium", getPriorityClass(task.priority))}>
                    • Prioridade {getPriorityText(task.priority)}
                  </span>
                </div>
                
                <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {editingTask && (
        <TaskForm
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          editTask={{
            id: editingTask.id,
            title: editingTask.title,
            description: editingTask.description,
            dueDate: editingTask.due_date,
            category: editingTask.category,
            priority: editingTask.priority,
          }}
        />
      )}
      
      {viewingTask && (
        <TaskDetail
          task={viewingTask}
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setEditingTask(viewingTask);
            setViewingTask(null);
          }}
          onDelete={() => {
            deleteTask(viewingTask.id);
            setViewingTask(null);
            toast.success('Tarefa excluída');
          }}
        />
      )}
    </div>
  );
}
