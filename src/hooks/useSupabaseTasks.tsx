
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

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

export function useSupabaseTasks() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Parse dates
      const parsedTasks: Task[] = data.map(task => ({
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : new Date(),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        category: task.category as TaskCategory,
      }));
      
      setTasks(parsedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          user_id: user.id,
          due_date: taskData.due_date?.toISOString(),
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Parse dates for the newly added task
        const newTask: Task = {
          ...data[0],
          due_date: data[0].due_date ? new Date(data[0].due_date) : new Date(),
          created_at: new Date(data[0].created_at),
          updated_at: new Date(data[0].updated_at),
          category: data[0].category as TaskCategory,
        };
        
        setTasks(prevTasks => [...prevTasks, newTask]);
        toast.success('Tarefa adicionada com sucesso!');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'user_id'>>) => {
    try {
      const updateData = {
        ...updates,
        due_date: updates.due_date?.toISOString(),
      };
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id
            ? {
                ...task,
                ...updates,
                due_date: updates.due_date || task.due_date,
                updated_at: new Date(),
              }
            : task
        )
      );
      
      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const toggleCompleted = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const newCompletedState = !task.completed;
      
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: newCompletedState,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id
            ? {
                ...task,
                completed: newCompletedState,
                updated_at: new Date(),
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleCompleted,
    refreshTasks: fetchTasks,
  };
}
