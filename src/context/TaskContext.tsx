
import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

export type TaskCategory = 'personal' | 'work' | 'fitness' | 'academic';

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date: Date;
  completed: boolean;
  category: TaskCategory;
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: Date;
  updated_at: Date;
  start_time?: string;
  end_time?: string;
  is_recurring?: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly';
  reminder_time?: number;
  google_event_id?: string;
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'user_id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const taskManager = useSupabaseTasks();
  
  return (
    <TaskContext.Provider value={taskManager}>
      {children}
    </TaskContext.Provider>
  );
};
