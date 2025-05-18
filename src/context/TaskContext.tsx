import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type TaskCategory = 'personal' | 'work' | 'fitness' | 'academic';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  category: TaskCategory;
  priority: 'low' | 'medium' | 'high';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  reminderTime?: number;
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => void;
  deleteTask: (id: string) => void;
  toggleCompleted: (id: string) => void;
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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      // Load tasks from localStorage when user is authenticated
      const storedTasks = localStorage.getItem(`tasks-${user.id}`);
      if (storedTasks) {
        // Parse tasks and convert string dates back to Date objects
        const parsedTasks = JSON.parse(storedTasks, (key, value) => {
          if (key === 'dueDate' || key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });
        setTasks(parsedTasks);
      } else {
        // If no tasks exist, initialize with empty array
        setTasks([]);
      }
    } else {
      // Clear tasks when logged out
      setTasks([]);
    }
    
    setIsLoading(false);
  }, [user]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (user && tasks.length > 0) {
      localStorage.setItem(`tasks-${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  const addTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const toggleCompleted = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date(),
            }
          : task
      )
    );
  };

  const value = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleCompleted,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
