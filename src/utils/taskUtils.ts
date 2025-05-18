
import { Task, TaskCategory } from '../context/TaskContext';

export const getTasksByDateRange = (tasks: Task[], startDate: Date, endDate: Date): Task[] => {
  return tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= startDate && taskDate <= endDate;
  });
};

export const getTasksByCategory = (tasks: Task[], category: TaskCategory): Task[] => {
  return tasks.filter(task => task.category === category);
};

export const getCompletedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => task.completed);
};

export const getPendingTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => !task.completed);
};

export const sortTasksByDueDate = (tasks: Task[], ascending = true): Task[] => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

export const getTasksDueToday = (tasks: Task[]): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && !task.completed;
  });
};

export const getOverdueTasks = (tasks: Task[]): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && !task.completed;
  });
};

export const getTasksForCurrentWeek = (tasks: Task[]): Task[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day + (day === 0 ? -6 : 1)); // Adjust to Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);
  
  return getTasksByDateRange(tasks, startOfWeek, endOfWeek);
};

export const getProductivityScore = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(task => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

export const getCategoryDistribution = (tasks: Task[]): Record<TaskCategory, number> => {
  const distribution: Record<TaskCategory, number> = {
    personal: 0,
    work: 0,
    fitness: 0,
    academic: 0
  };
  
  tasks.forEach(task => {
    distribution[task.category]++;
  });
  
  return distribution;
};
