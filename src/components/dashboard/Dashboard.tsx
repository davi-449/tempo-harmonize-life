
import { useState } from 'react';
import { useTask } from '@/context/TaskContext';
import TaskList from '../tasks/TaskList';
import ProductivityMetrics from '../stats/ProductivityMetrics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTasksForCurrentWeek, getPendingTasks, sortTasksByDueDate, getTasksByCategory, getTasksDueToday, getOverdueTasks } from '@/utils/taskUtils';
import { TaskCategory } from '@/context/TaskContext';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Star, Bell, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/context/NotificationsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { tasks } = useTask();
  const { notifications, unreadCount, isFocusModeActive } = useNotifications();
  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  
  // Get tasks for the dashboard
  const weeklyTasks = getTasksForCurrentWeek(tasks);
  const pendingTasks = getPendingTasks(weeklyTasks);
  const sortedTasks = sortTasksByDueDate(pendingTasks);
  const overdueTasksArray = getOverdueTasks(tasks);
  const tasksDueToday = getTasksDueToday(tasks);
  
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
  
  // Função para gerar mensagem motivacional
  const getMotivationalMessage = () => {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length;
    const completionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
    
    if (completionRate >= 80) {
      return "Excelente trabalho! Você está superando suas metas!";
    } else if (completionRate >= 60) {
      return "Bom trabalho! Continue mantendo esse ritmo!";
    } else if (completionRate >= 40) {
      return "Você está progredindo bem. Continue assim!";
    } else if (completionRate >= 20) {
      return "Um pequeno progresso ainda é progresso. Vamos em frente!";
    } else {
      return "Hoje é um novo dia para começar. Você consegue!";
    }
  };

  // Calcular estatísticas por categoria
  const getCategoryStats = () => {
    const stats = {
      personal: tasks.filter(t => t.category === 'personal').length,
      work: tasks.filter(t => t.category === 'work').length,
      fitness: tasks.filter(t => t.category === 'fitness').length,
      academic: tasks.filter(t => t.category === 'academic').length,
    };
    
    return stats;
  };
  
  const categoryStats = getCategoryStats();

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Painel</h1>
        <p className="text-muted-foreground">
          Gerencie suas tarefas e acompanhe sua produtividade.
        </p>
      </div>
      
      {/* Seção Hoje */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
          <h2 className="text-xl font-medium">Hoje: {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
          
          {isFocusModeActive && (
            <div className="flex items-center text-sm bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full px-3 py-1">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              Modo Foco Ativo
            </div>
          )}
          
          {/* Calendar Link */}
          <Link to="/calendar">
            <Button variant="outline" size="sm" className="group">
              <Calendar className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Ver Calendário
            </Button>
          </Link>
        </div>
        
        {/* Mensagem motivacional */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium">{getMotivationalMessage()}</p>
          </CardContent>
        </Card>
        
        {/* Cards de estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-muted-foreground text-xs">Tarefas para hoje</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-2xl font-bold">{tasksDueToday.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-muted-foreground text-xs">Tarefas atrasadas</span>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-red-500">{overdueTasksArray.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-muted-foreground text-xs">Notificações</span>
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-2xl font-bold">{unreadCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-1">
                <span className="text-muted-foreground text-xs">Produtividade</span>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  <Link to="/analytics" className="text-2xl font-bold hover:text-primary">Ver</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Próximos eventos importantes */}
      {(tasksDueToday.length > 0 || overdueTasksArray.length > 0) && (
        <section>
          <h2 className="text-xl font-medium mb-4">Prioridades</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {overdueTasksArray.length > 0 && (
              <Card className="border-red-200 dark:border-red-900 overflow-hidden">
                <CardHeader className="bg-red-50 dark:bg-red-900/30 pb-2">
                  <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Tarefas Atrasadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollableTaskList tasks={overdueTasksArray.slice(0, 3)} heightClass="max-h-36" />
                </CardContent>
                {overdueTasksArray.length > 3 && (
                  <CardFooter className="p-2 bg-muted/50">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver todas ({overdueTasksArray.length})
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
            
            {tasksDueToday.length > 0 && (
              <Card className="border-blue-200 dark:border-blue-900 overflow-hidden">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/30 pb-2">
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Tarefas para Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollableTaskList tasks={tasksDueToday.slice(0, 3)} heightClass="max-h-36" />
                </CardContent>
                {tasksDueToday.length > 3 && (
                  <CardFooter className="p-2 bg-muted/50">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver todas ({tasksDueToday.length})
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </section>
      )}
      
      {/* Estatísticas por categoria */}
      <section>
        <h2 className="text-xl font-medium mb-4">Resumo por Categoria</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <CategoryCard 
            category="personal" 
            count={categoryStats.personal} 
            color="bg-[#E5DEFF]" 
            textColor="text-[#5D4A9C]"
          />
          <CategoryCard 
            category="work" 
            count={categoryStats.work} 
            color="bg-[#D3E4FD]" 
            textColor="text-[#3A5F8A]"
          />
          <CategoryCard 
            category="fitness" 
            count={categoryStats.fitness} 
            color="bg-[#F2FCE2]" 
            textColor="text-[#55803E]"
          />
          <CategoryCard 
            category="academic" 
            count={categoryStats.academic} 
            color="bg-[#FEF7CD]" 
            textColor="text-[#9C7E23]"
          />
        </div>
      </section>
      
      {/* Productivity Metrics */}
      <section>
        <h2 className="text-xl font-medium mb-4">Visão Geral de Produtividade</h2>
        <ProductivityMetrics />
      </section>
      
      {/* Tasks Section */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-medium">Suas Tarefas</h2>
          
          {/* Notification Center Link */}
          <Link to="/notifications">
            <Button variant="outline" size="sm" className="group">
              <Bell className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Central de Notificações
              {unreadCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </span>
              )}
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

// Componente auxiliar para exibir lista de tarefas com scroll
function ScrollableTaskList({ tasks, heightClass = "max-h-40" }: { tasks: any[], heightClass?: string }) {
  if (tasks.length === 0) return null;
  
  return (
    <div className={cn("overflow-auto", heightClass)}>
      <ul className="divide-y">
        {tasks.map((task) => (
          <li key={task.id} className="p-3 hover:bg-muted/50 flex items-center gap-2">
            <CheckCircle className={cn(
              "h-5 w-5", 
              task.completed ? "text-green-500 fill-green-500" : "text-muted"
            )} />
            <div className="overflow-hidden">
              <p className={cn(
                "text-sm truncate", 
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(task.dueDate), "dd/MM/yyyy")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Componente de cartão para categoria
function CategoryCard({ category, count, color, textColor }: { 
  category: string;
  count: number; 
  color: string;
  textColor: string;
}) {
  const getCategoryLabel = (cat: string): string => {
    const categories: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return categories[cat] || cat;
  };
  
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'personal': 
        return <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#5D4A9C]/20">🏠</div>;
      case 'work': 
        return <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#3A5F8A]/20">💼</div>;
      case 'fitness': 
        return <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#55803E]/20">💪</div>;
      case 'academic': 
        return <div className="h-8 w-8 rounded-full flex items-center justify-center bg-[#9C7E23]/20">📚</div>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("border-none", color)}>
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className="mt-2">
          {getCategoryIcon(category)}
        </div>
        <span className={cn("font-medium", textColor)}>{getCategoryLabel(category)}</span>
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-xs text-muted-foreground">tarefas</span>
      </CardContent>
    </Card>
  );
}
