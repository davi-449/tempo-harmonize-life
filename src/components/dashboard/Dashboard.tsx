
import { useState } from 'react';
import { useTask } from '@/context/TaskContext';
import TaskList from '../tasks/TaskList';
import ProductivityMetrics from '../stats/ProductivityMetrics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTasksForCurrentWeek, getPendingTasks, sortTasksByDueDate, getTasksByCategory } from '@/utils/taskUtils';
import { TaskCategory } from '@/context/TaskContext';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function Dashboard() {
  const { tasks } = useTask();
  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  
  // Get pending tasks for this week
  const weeklyTasks = getTasksForCurrentWeek(tasks);
  const pendingTasks = getPendingTasks(weeklyTasks);
  const sortedTasks = sortTasksByDueDate(pendingTasks);
  
  // Apply category filter if selected
  const filteredTasks = categoryFilter === 'all'
    ? sortedTasks
    : getTasksByCategory(sortedTasks, categoryFilter);
  
  const handleCategoryFilter = (category: TaskCategory | 'all') => {
    setCategoryFilter(category);
  };

  // Função para traduzir categorias
  const getCategoryLabel = (category: TaskCategory | 'all'): string => {
    const categories: Record<TaskCategory | 'all', string> = {
      'all': 'Todas',
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[category];
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Painel</h1>
        <p className="text-muted-foreground">
          Gerencie suas tarefas e acompanhe sua produtividade.
        </p>
      </div>
      
      {/* Productivity Metrics */}
      <section>
        <h2 className="text-xl font-medium mb-4">Visão Geral de Produtividade</h2>
        <ProductivityMetrics />
      </section>
      
      {/* Tasks Section */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-medium">Suas Tarefas</h2>
          
          {/* Calendar Link */}
          <Link to="/calendar">
            <Button variant="outline" size="sm" className="group">
              <Calendar className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Ver Calendário
            </Button>
          </Link>
        </div>
        
        {/* Time View Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Tabs defaultValue="weekly" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="daily" onClick={() => setTimeView('daily')}>Diário</TabsTrigger>
              <TabsTrigger value="weekly" onClick={() => setTimeView('weekly')}>Semanal</TabsTrigger>
              <TabsTrigger value="monthly" onClick={() => setTimeView('monthly')}>Mensal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={categoryFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleCategoryFilter('all')}
          >
            Todas
          </Button>
          <Button 
            variant={categoryFilter === 'personal' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleCategoryFilter('personal')}
            className="bg-[#E5DEFF] hover:bg-[#d2c8ff] text-[#5D4A9C] border-[#E5DEFF] hover:text-[#5D4A9C] dark:bg-[#5D4A9C] dark:text-[#E5DEFF] dark:hover:bg-[#4d3a8c]"
          >
            Pessoal
          </Button>
          <Button 
            variant={categoryFilter === 'work' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleCategoryFilter('work')}
            className="bg-[#D3E4FD] hover:bg-[#b9d4fb] text-[#3A5F8A] border-[#D3E4FD] hover:text-[#3A5F8A] dark:bg-[#3A5F8A] dark:text-[#D3E4FD] dark:hover:bg-[#2a4f7a]"
          >
            Trabalho
          </Button>
          <Button 
            variant={categoryFilter === 'fitness' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleCategoryFilter('fitness')}
            className="bg-[#F2FCE2] hover:bg-[#e5f9c8] text-[#55803E] border-[#F2FCE2] hover:text-[#55803E] dark:bg-[#55803E] dark:text-[#F2FCE2] dark:hover:bg-[#45702e]"
          >
            Academia
          </Button>
          <Button 
            variant={categoryFilter === 'academic' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleCategoryFilter('academic')}
            className="bg-[#FEF7CD] hover:bg-[#fef0a5] text-[#9C7E23] border-[#FEF7CD] hover:text-[#9C7E23] dark:bg-[#9C7E23] dark:text-[#FEF7CD] dark:hover:bg-[#8c6e13]"
          >
            Faculdade
          </Button>
        </div>
        
        {/* Task List */}
        <TaskList 
          tasks={filteredTasks}
          title="" 
          emptyMessage={`Nenhuma tarefa ${categoryFilter === 'all' ? '' : getCategoryLabel(categoryFilter)} encontrada para esta visualização ${timeView === 'daily' ? 'diária' : timeView === 'weekly' ? 'semanal' : 'mensal'}.`}
        />
      </section>
    </div>
  );
}
