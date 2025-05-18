
import { useState } from 'react';
import { Task, useTask } from '@/context/TaskContext';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { CheckIcon, CalendarIcon, EditIcon, TrashIcon } from 'lucide-react';
import TaskForm from './TaskForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
}

export default function TaskList({ tasks, title = 'Tasks', emptyMessage = 'No tasks found' }: TaskListProps) {
  const { toggleCompleted, deleteTask } = useTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskComplete = (taskId: string) => {
    toggleCompleted(taskId);
    toast.success('Task status updated');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast.success('Task deleted');
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
                task.completed && "opacity-60"
              )}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => handleTaskComplete(task.id)}
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
                <CardContent className="pt-2 text-sm text-muted-foreground">
                  <p>{task.description}</p>
                </CardContent>
              )}
              
              <CardFooter className="flex justify-between items-center pt-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  <span className={cn("ml-2 font-medium", getPriorityClass(task.priority))}>
                    • {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditTask(task)}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
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
            dueDate: editingTask.dueDate,
            category: editingTask.category,
            priority: editingTask.priority,
          }}
        />
      )}
    </div>
  );
}
