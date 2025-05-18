
import { useState } from 'react';
import { useTask } from '@/context/TaskContext';
import { addDays, startOfWeek, endOfWeek, format, addWeeks, subWeeks, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Task } from '@/context/TaskContext';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import TaskDetail from '../tasks/TaskDetail';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WeeklyCalendar() {
  const { tasks, deleteTask } = useTask();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());
  
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  // Determina o formato de hora para exibição
  const formatTaskTime = (task: Task) => {
    if (task.startTime) {
      if (task.endTime) {
        return `${task.startTime} - ${task.endTime}`;
      }
      return task.startTime;
    }
    return null;
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-amber-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return '';
    }
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleEditTask = () => {
    // Redirecionar para o formulário de edição quando implementado
    navigate('/dashboard'); // Temporário
    closeTaskDetail();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast.success('Tarefa excluída');
    closeTaskDetail();
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas tarefas em formato de calendário.
        </p>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">
          {format(weekStart, "MMMM yyyy", { locale: ptBR })}
        </h2>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Semana anterior</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima semana</span>
          </Button>
        </div>
      </div>
      
      {/* Weekly Calendar View */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {daysOfWeek.map((day, idx) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={idx} 
              className={cn(
                "text-center p-2 font-medium",
                isToday ? "bg-primary text-primary-foreground rounded-t-md" : ""
              )}
            >
              <div className="text-sm">{format(day, "EEE", { locale: ptBR })}</div>
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full mx-auto mt-1",
                isToday ? "bg-primary-foreground text-primary" : ""
              )}>
                {format(day, "d")}
              </div>
            </div>
          );
        })}
        
        {/* Calendar Cells */}
        {daysOfWeek.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={`cell-${idx}`} 
              className={cn(
                "min-h-[200px] border border-border rounded-b-md",
                isToday ? "border-primary" : ""
              )}
            >
              {dayTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <span>Sem tarefas</span>
                </div>
              ) : (
                <div className="space-y-2 p-2 max-h-[300px] overflow-y-auto">
                  {dayTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className={cn(
                        "p-2 rounded-md cursor-pointer text-sm hover:bg-accent",
                        getPriorityClass(task.priority),
                        task.completed ? "opacity-50" : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={task.completed ? "line-through" : "font-medium"}>
                          {task.title}
                        </span>
                        <CategoryBadge category={task.category} className="text-xs" />
                      </div>
                      
                      {formatTaskTime(task) && (
                        <div className="text-muted-foreground text-xs flex items-center mt-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatTaskTime(task)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={closeTaskDetail}
          onEdit={handleEditTask}
          onDelete={() => handleDeleteTask(selectedTask.id)}
        />
      )}
    </div>
  );
}
