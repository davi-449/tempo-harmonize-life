
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseTasks, Task, TaskCategory } from '@/hooks/useSupabaseTasks';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'user_id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

// Reexportar o tipo Task para uso em outros componentes
export type { Task };

// Reexportar o tipo TaskCategory para uso em outros componentes
export type { TaskCategory };

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const taskManager = useSupabaseTasks();
  
  return (
    <TaskContext.Provider value={taskManager}>
      {children}
    </TaskContext.Provider>
  );
};
