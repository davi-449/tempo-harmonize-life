
import { useTask } from '@/context/TaskContext';
import { getCompletedTasks, getTasksForCurrentWeek, getProductivityScore, getCategoryDistribution } from '@/utils/taskUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProductivityMetrics() {
  const { tasks } = useTask();
  
  // Get metrics
  const weeklyTasks = getTasksForCurrentWeek(tasks);
  const completedTasks = getCompletedTasks(weeklyTasks);
  const productivityScore = getProductivityScore(weeklyTasks);
  const categoryDistribution = getCategoryDistribution(tasks);
  
  // Prepare data for pie chart
  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Colors for the pie chart
  const COLORS = ['#E5DEFF', '#D3E4FD', '#F2FCE2', '#FEF7CD'];
  const DARK_COLORS = ['#5D4A9C', '#3A5F8A', '#55803E', '#9C7E23'];
  
  // Determine if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');
  const pieColors = isDarkMode ? DARK_COLORS : COLORS;

  return (
    <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
      {/* Productivity Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Weekly Productivity</CardTitle>
          <CardDescription>Your task completion rate this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl font-bold">{productivityScore}%</div>
            <Progress value={productivityScore} className="w-full h-2" />
            <p className="text-sm text-muted-foreground">
              {completedTasks.length} of {weeklyTasks.length} tasks completed
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Distribution Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Task Categories</CardTitle>
          <CardDescription>Distribution of your tasks by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => {
                    // Ensure name is a string before calling charAt and slice
                    if (typeof name === 'string') {
                      return name.charAt(0).toUpperCase() + name.slice(1);
                    }
                    return name;
                  }}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => {
                    if (typeof name === 'string') {
                      return [
                        `${value} tasks`, 
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ];
                    }
                    return [`${value} tasks`, name];
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
