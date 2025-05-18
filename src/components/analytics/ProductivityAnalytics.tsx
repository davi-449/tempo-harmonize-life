
import { useState } from 'react';
import { useTask } from '@/context/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, getWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getCategoryDistribution, getCompletedTasks, getTasksInDateRange } from '@/utils/taskUtils';

export default function ProductivityAnalytics() {
  const { tasks } = useTask();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  
  // Calcular datas com base no intervalo selecionado
  const now = new Date();
  const getStartDate = () => {
    switch (timeRange) {
      case 'week': return subDays(now, 7);
      case 'month': return subDays(now, 30);
      case 'quarter': return subDays(now, 90);
    }
  };

  const startDate = getStartDate();
  const tasksInRange = getTasksInDateRange(tasks, startDate, now);
  const completedTasks = getCompletedTasks(tasksInRange);
  const overdueCount = tasksInRange.filter(task => !task.completed && new Date(task.dueDate) < now).length;
  const completionRate = tasksInRange.length > 0 ? Math.round((completedTasks.length / tasksInRange.length) * 100) : 0;
  const categoryDistribution = getCategoryDistribution(tasksInRange);
  
  // Dados para o gráfico de barras
  const prepareWeeklyData = () => {
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    const dailyData = eachDayOfInterval({ start, end }).map(day => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === day.getDate() && 
               taskDate.getMonth() === day.getMonth() && 
               taskDate.getFullYear() === day.getFullYear();
      });
      
      const completed = dayTasks.filter(task => task.completed).length;
      
      return {
        name: format(day, 'EEE', { locale: ptBR }),
        total: dayTasks.length,
        concluídas: completed,
      };
    });
    
    return dailyData;
  };

  // Dados para o gráfico de categorias
  const prepareCategoryData = () => {
    return Object.entries(categoryDistribution).map(([category, count]) => ({
      name: translateCategory(category),
      value: count,
    }));
  };

  // Calcular produtividade por semana (últimas 4 semanas)
  const prepareProductivityTrendData = () => {
    const weeksToShow = 4;
    const data = [];
    
    for (let i = weeksToShow - 1; i >= 0; i--) {
      const endOfWeekDate = subDays(endOfWeek(now), i * 7);
      const startOfWeekDate = startOfWeek(endOfWeekDate);
      
      const weekTasks = getTasksInDateRange(tasks, startOfWeekDate, endOfWeekDate);
      const weekCompleted = weekTasks.filter(task => task.completed).length;
      const weekRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;
      
      data.push({
        name: `Semana ${getWeek(startOfWeekDate) - getWeek(startOfWeek(now)) + weeksToShow}`,
        produtividade: weekRate,
      });
    }
    
    return data;
  };

  // Função para traduzir categorias
  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return translations[category] || category;
  };
  
  // Cores para gráficos
  const COLORS = ['#E5DEFF', '#D3E4FD', '#F2FCE2', '#FEF7CD'];
  const DARK_COLORS = ['#5D4A9C', '#3A5F8A', '#55803E', '#9C7E23'];
  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartColors = isDarkMode ? DARK_COLORS : COLORS;

  // Gerar sugestões personalizadas
  const generateSuggestions = () => {
    const suggestions = [];
    
    if (completionRate < 50) {
      suggestions.push('Tente dividir tarefas grandes em subtarefas menores e mais gerenciáveis.');
    }
    
    if (overdueCount > 3) {
      suggestions.push('Considere definir lembretes mais frequentes para evitar tarefas atrasadas.');
    }
    
    const mostCommonCategory = Object.entries(categoryDistribution).sort((a, b) => b[1] - a[1])[0];
    suggestions.push(`Você tem mais tarefas na categoria ${translateCategory(mostCommonCategory[0])}. Considere equilibrar suas atividades.`);
    
    return suggestions;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Análise de Produtividade</h1>
        <p className="text-muted-foreground">
          Analise seus padrões de conclusão de tarefas e otimize sua produtividade.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Tabs defaultValue="week" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="week" onClick={() => setTimeRange('week')}>Semana</TabsTrigger>
            <TabsTrigger value="month" onClick={() => setTimeRange('month')}>Mês</TabsTrigger>
            <TabsTrigger value="quarter" onClick={() => setTimeRange('quarter')}>Trimestre</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Resumo de Produtividade */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Taxa de Conclusão</CardTitle>
            <CardDescription>Tarefas concluídas vs. total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-sm text-muted-foreground">
              {completedTasks.length} de {tasksInRange.length} tarefas concluídas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tarefas Atrasadas</CardTitle>
            <CardDescription>Tarefas não concluídas no prazo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueCount}</div>
            <p className="text-sm text-muted-foreground">
              {tasksInRange.length > 0
                ? `${Math.round((overdueCount / tasksInRange.length) * 100)}% do total de tarefas`
                : 'Nenhuma tarefa no período'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Média Diária</CardTitle>
            <CardDescription>Tarefas concluídas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedTasks.length > 0 
                ? (completedTasks.length / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90)).toFixed(1) 
                : '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Barras - Tarefas por Dia */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tarefas por Dia da Semana</CardTitle>
            <CardDescription>Comparação entre tarefas totais e concluídas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareWeeklyData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} tarefas`, 
                    name === 'concluídas' ? 'Concluídas' : 'Total'
                  ]}
                />
                <Bar dataKey="total" fill={chartColors[1]} name="total" />
                <Bar dataKey="concluídas" fill={chartColors[0]} name="concluídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Tarefas por categoria</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareCategoryData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {prepareCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} tarefas`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Gráfico de Linha - Tendência de Produtividade */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Produtividade</CardTitle>
            <CardDescription>Taxa de conclusão nas últimas 4 semanas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={prepareProductivityTrendData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(tick) => `${tick}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Taxa de Produtividade']}
                />
                <Line 
                  type="monotone" 
                  dataKey="produtividade" 
                  stroke={chartColors[2]} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Sugestões de Melhoria */}
      <Card>
        <CardHeader>
          <CardTitle>Sugestões Personalizadas</CardTitle>
          <CardDescription>Com base nos seus padrões de conclusão de tarefas</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {generateSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
