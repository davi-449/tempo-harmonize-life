
import { useEffect, useState } from "react";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { correlateHealthWithProductivity } from "@/services/syncService";
import { getSyncStatus } from "@/services/syncService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";

export default function HealthProductivityCorrelation() {
  const { user } = useAuth();
  const { tasks } = useTask();
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasHealthData, setHasHealthData] = useState(false);
  
  useEffect(() => {
    const checkForHealthData = () => {
      if (!user) return;
      
      const syncStatus = getSyncStatus(user.id);
      const healthSyncStatus = syncStatus.health;
      
      if (healthSyncStatus && healthSyncStatus.status === 'success' && healthSyncStatus.count > 0) {
        setHasHealthData(true);
      } else {
        setHasHealthData(false);
      }
      
      setLoading(false);
    };
    
    checkForHealthData();
    
    // Mock data for demonstration
    if (user && tasks.length > 0) {
      // This is for demo purposes - in a real app, you would use real health data from Google Fit
      const mockHealthData = [
        { date: '2025-05-10', steps: 5000, sleepHours: 6.5, heartRate: 75 },
        { date: '2025-05-11', steps: 7500, sleepHours: 7, heartRate: 72 },
        { date: '2025-05-12', steps: 9000, sleepHours: 8, heartRate: 70 },
        { date: '2025-05-13', steps: 4000, sleepHours: 5.5, heartRate: 78 },
        { date: '2025-05-14', steps: 10000, sleepHours: 7.5, heartRate: 71 },
        { date: '2025-05-15', steps: 8000, sleepHours: 7, heartRate: 72 },
        { date: '2025-05-16', steps: 6000, sleepHours: 6, heartRate: 76 },
        { date: '2025-05-17', steps: 8500, sleepHours: 8, heartRate: 69 },
      ];
      
      const correlation = correlateHealthWithProductivity(mockHealthData, tasks);
      setCorrelationData(correlation);
      
      // Set has health data true for demo
      setHasHealthData(true);
      setLoading(false);
    }
  }, [user, tasks]);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Correlação Saúde e Produtividade</CardTitle>
          <CardDescription>Analisando relações entre saúde e produtividade</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!hasHealthData || !correlationData) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Correlação Saúde e Produtividade</CardTitle>
          <CardDescription>Analisando relações entre saúde e produtividade</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Lightbulb className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sincronize seus dados de saúde do Google Fit para ver correlações com sua produtividade.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const chartData = correlationData.correlations?.map((item: any) => ({
    date: item.date.substring(5),
    'Produtividade (%)': Math.round(item.completionRate * 100),
    'Sono (horas)': item.sleepHours,
    'Passos (mil)': Math.round(item.steps / 1000 * 10) / 10
  }));
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Correlação Saúde e Produtividade</CardTitle>
        <CardDescription>Analisando relações entre saúde e produtividade</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {correlationData.insights && correlationData.insights.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium">Insights</h4>
              {correlationData.insights.map((insight: any, i: number) => (
                <div key={i} className="bg-primary/10 rounded-md p-3 flex items-start">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">{insight.description}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Produtividade (%)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="Sono (horas)" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="Passos (mil)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
