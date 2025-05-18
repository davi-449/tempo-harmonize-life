
import { useState } from 'react';
import { useTask } from '@/context/TaskContext';
import { addDays, startOfWeek, endOfWeek, format, addWeeks, subWeeks, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Task } from '@/context/TaskContext';
import { ChevronLeft, ChevronRight, CalendarIcon, Filter } from 'lucide-react';
import TaskDetail from '../tasks/TaskDetail';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WeeklyCalendar() {
  const { tasks, deleteTask } = useTask();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());
  
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (categoryFilter && task.category !== categoryFilter) {
        return false;
      }
      
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
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="h-2 w-2 rounded-full bg-red-500 absolute -top-1 -right-1"></span>;
      case 'medium':
        return <span className="h-2 w-2 rounded-full bg-amber-500 absolute -top-1 -right-1"></span>;
      default:
        return null;
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
  
  const getWeeklyTasks = () => {
    let allTasks: Task[] = [];
    
    daysOfWeek.forEach(day => {
      const dayTasks = getTasksForDay(day);
      allTasks = [...allTasks, ...dayTasks];
    });
    
    return allTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  const getCategoryColors = () => {
    return {
      'personal': { bg: 'bg-[#E5DEFF]', text: 'text-[#5D4A9C]' },
      'work': { bg: 'bg-[#D3E4FD]', text: 'text-[#3A5F8A]' },
      'fitness': { bg: 'bg-[#F2FCE2]', text: 'text-[#55803E]' },
      'academic': { bg: 'bg-[#FEF7CD]', text: 'text-[#9C7E23]' }
    };
  };
  
  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[category] || category;
  };

  const categoryColors = getCategoryColors();
  const categories = Object.keys(categoryColors);
  const weeklyTasks = getWeeklyTasks();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col space-y-2">
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold tracking-tight"
        >
          Calendário
        </motion.h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas tarefas em formato de calendário.
        </p>
      </div>
      
      {/* View Selector */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            variant={categoryFilter === null ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            <Filter className="h-3 w-3 mr-1" />
            Todos
          </Button>
          
          {categories.map((category) => {
            const colors = categoryColors[category];
            return (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className={cn(
                  categoryFilter === category ? colors.bg : '',
                  categoryFilter === category ? colors.text : '',
                )}
              >
                {getCategoryLabel(category)}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.h2 
          whileHover={{ scale: 1.02 }}
          className="text-xl font-medium"
        >
          {format(weekStart, "MMMM yyyy", { locale: ptBR })}
        </motion.h2>
        
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
      
      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          /* Weekly Calendar View */
          <motion.div 
            key="calendar-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-7 gap-2"
          >
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
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full mx-auto mt-1",
                      isToday ? "bg-primary-foreground text-primary" : ""
                    )}
                  >
                    {format(day, "d")}
                  </motion.div>
                </div>
              );
            })}
            
            {/* Calendar Cells */}
            {daysOfWeek.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <motion.div 
                  key={`cell-${idx}`}
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "min-h-[200px] border border-border rounded-b-md transition-colors",
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
                        <motion.div 
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          whileHover={{ scale: 1.02, backgroundColor: 'var(--accent)' }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "p-2 rounded-md cursor-pointer text-sm relative",
                            getPriorityClass(task.priority),
                            task.completed ? "opacity-50" : ""
                          )}
                        >
                          {getPriorityIcon(task.priority)}
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
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* List View */
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {weeklyTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Nenhuma tarefa encontrada para esta semana.</p>
              </div>
            ) : (
              <div>
                {daysOfWeek.map((day, idx) => {
                  const dayTasks = getTasksForDay(day);
                  if (dayTasks.length === 0) return null;
                  
                  return (
                    <div key={idx} className="mb-6">
                      <h3 className={cn(
                        "text-sm font-medium mb-2 pb-1 border-b",
                        isSameDay(day, new Date()) ? "text-primary" : ""
                      )}>
                        {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        {isSameDay(day, new Date()) && " (Hoje)"}
                      </h3>
                      
                      <div className="space-y-2">
                        {dayTasks.map((task) => (
                          <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01, backgroundColor: 'var(--accent-light)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTaskClick(task)}
                            className={cn(
                              "p-3 border rounded-md flex justify-between items-center cursor-pointer",
                              task.completed ? "opacity-60" : ""
                            )}
                          >
                            <div className="flex flex-col">
                              <span className={cn("font-medium", task.completed ? "line-through" : "")}>
                                {task.title}
                              </span>
                              <div className="flex space-x-2 mt-1 text-xs text-muted-foreground">
                                {formatTaskTime(task) && (
                                  <span className="flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {formatTaskTime(task)}
                                  </span>
                                )}
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-full",
                                  task.priority === 'high' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  task.priority === 'medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                )}>
                                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                              </div>
                            </div>
                            <CategoryBadge category={task.category} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={closeTaskDetail}
          onEdit={handleEditTask}
          onDelete={() => handleDeleteTask(selectedTask.id)}
        />
      )}
    </motion.div>
  );
}
