
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckIcon, CalendarClock, Layers3, Activity, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getTokens, initiateGoogleAuth } from '@/services/googleAuth';
import { syncTasksWithGoogleCalendar, syncHealthDataWithGoogleFit } from '@/services/syncService';
import { useTask } from '@/context/TaskContext';
import SyncStatus from '@/components/integrations/SyncStatus';

export default function IntegrationsSettings() {
  const { user } = useAuth();
  const { tasks } = useTask();
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    importEvents: true,
    exportEvents: false,
    bidirectional: false,
    importFitnessData: true,
    correlateProductivity: true
  });
  
  // Check for existing Google connections
  useEffect(() => {
    if (user) {
      const tokens = getTokens(user.id);
      if (tokens) {
        setGoogleCalendarConnected(true);
        setGoogleFitConnected(true);
      }
    }
  }, [user]);
  
  const handleConnectGoogleCalendar = () => {
    setIsConnecting(true);
    
    try {
      initiateGoogleAuth();
      // No need to set isConnecting to false as we're redirecting away
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      setIsConnecting(false);
      toast.error("Falha ao conectar com Google Calendar");
    }
  };
  
  const handleDisconnectGoogleCalendar = () => {
    // In a real app, revoke access token
    // For now, just remove from localStorage
    if (user) {
      localStorage.removeItem(`google_tokens_${user.id}`);
      setGoogleCalendarConnected(false);
      toast("Google Calendar desconectado");
    }
  };
  
  const handleConnectGoogleFit = () => {
    // Google Fit uses the same OAuth flow as Calendar with the required scopes
    handleConnectGoogleCalendar();
  };
  
  const handleDisconnectGoogleFit = () => {
    // Since we're using the same tokens, this is the same as disconnecting Calendar
    handleDisconnectGoogleCalendar();
  };
  
  const handleSyncCalendar = async () => {
    if (user && tasks) {
      const result = await syncTasksWithGoogleCalendar(user.id, tasks);
      if (!result.success) {
        toast.error("Falha ao sincronizar com Google Calendar");
      }
    }
  };
  
  const handleSyncHealth = async () => {
    if (user) {
      const result = await syncHealthDataWithGoogleFit(user.id);
      if (!result.success) {
        toast.error("Falha ao sincronizar com Google Fit");
      }
    }
  };
  
  const [healthData, setHealthData] = useState({
    steps: 0,
    sleep: 0,
    heartRate: 0,
    exerciseMinutes: 0
  });
  
  const handleUpdateHealthData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Dados de saúde atualizados com sucesso!');
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="google">
        <TabsList className="mb-6">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="google" className="space-y-6">
          {/* Google Calendar */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    <Calendar className="h-6 w-6 text-[#4285F4]" />
                  </div>
                  <div>
                    <CardTitle>Google Calendar</CardTitle>
                    <CardDescription>
                      Sincronize seus eventos e tarefas com o Google Calendar
                    </CardDescription>
                  </div>
                </div>
                <div>
                  {googleCalendarConnected ? (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-500">
                      <CheckIcon className="mr-1 h-4 w-4" />
                      Conectado
                    </div>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {googleCalendarConnected ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure como deseja sincronizar seus eventos e tarefas com o Google Calendar.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="import-events">Importar eventos</Label>
                        <p className="text-xs text-muted-foreground">Importar eventos do Google Calendar para o TempoApp</p>
                      </div>
                      <Switch
                        id="import-events"
                        checked={syncSettings.importEvents}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, importEvents: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="export-events">Exportar eventos</Label>
                        <p className="text-xs text-muted-foreground">Exportar tarefas do TempoApp para o Google Calendar</p>
                      </div>
                      <Switch
                        id="export-events"
                        checked={syncSettings.exportEvents}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, exportEvents: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="bidirectional-sync">Sincronização bidirecional</Label>
                        <p className="text-xs text-muted-foreground">Manter tudo atualizado em ambos os aplicativos</p>
                      </div>
                      <Switch
                        id="bidirectional-sync"
                        checked={syncSettings.bidirectional}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, bidirectional: checked})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleSyncCalendar}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Sincronizar agora
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <p className="text-muted-foreground text-sm">Conecte-se ao Google Calendar para sincronizar seus eventos e tarefas.</p>
                  <Button 
                    onClick={handleConnectGoogleCalendar} 
                    className="mt-2 bg-[#4285F4] text-white hover:bg-[#3367d6]"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Conectar com Google Calendar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
            {googleCalendarConnected && (
              <CardFooter className="bg-muted/50 px-6 py-3">
                <div className="flex justify-between items-center w-full">
                  <SyncStatus type="calendar" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectGoogleCalendar}
                  >
                    Desconectar
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Google Fit */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    <Activity className="h-6 w-6 text-[#4caf50]" />
                  </div>
                  <div>
                    <CardTitle>Google Fit</CardTitle>
                    <CardDescription>
                      Correlacione sua saúde física com sua produtividade
                    </CardDescription>
                  </div>
                </div>
                <div>
                  {googleFitConnected ? (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-500">
                      <CheckIcon className="mr-1 h-4 w-4" />
                      Conectado
                    </div>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {googleFitConnected ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure como deseja integrar seus dados de saúde com o TempoApp.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="import-fitness">Importar dados de atividade física</Label>
                        <p className="text-xs text-muted-foreground">Importar métricas de atividade física do Google Fit</p>
                      </div>
                      <Switch
                        id="import-fitness"
                        checked={syncSettings.importFitnessData}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, importFitnessData: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="correlate-productivity">Correlacionar com produtividade</Label>
                        <p className="text-xs text-muted-foreground">Analisar relação entre exercícios e produtividade</p>
                      </div>
                      <Switch
                        id="correlate-productivity"
                        checked={syncSettings.correlateProductivity}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, correlateProductivity: checked})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleSyncHealth}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Sincronizar dados de saúde
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Status da Sincronização</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <SyncStatus type="health" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <p className="text-muted-foreground text-sm">Conecte-se ao Google Fit para correlacionar sua saúde física com sua produtividade.</p>
                  <Button 
                    onClick={handleConnectGoogleFit} 
                    className="mt-2 bg-[#4caf50] text-white hover:bg-[#3d8b40]"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-4 w-4" />
                        Conectar com Google Fit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
            {googleFitConnected && (
              <CardFooter className="bg-muted/50 px-6 py-3">
                <div className="flex justify-between items-center w-full">
                  <p className="text-xs text-muted-foreground">Use os mesmos dados de autenticação do Google Calendar</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectGoogleFit}
                  >
                    Desconectar
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entrada Manual de Dados de Saúde</CardTitle>
              <CardDescription>
                Registre seus dados de saúde manualmente para correlação com produtividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdateHealthData}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="steps">Passos diários</Label>
                    <input
                      id="steps"
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ex: 8000"
                      min="0"
                      value={healthData.steps}
                      onChange={(e) => setHealthData({...healthData, steps: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep">Tempo de sono (horas)</Label>
                    <input
                      id="sleep"
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ex: 7.5"
                      min="0"
                      max="24"
                      step="0.5"
                      value={healthData.sleep}
                      onChange={(e) => setHealthData({...healthData, sleep: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heart-rate">Frequência cardíaca média (bpm)</Label>
                    <input
                      id="heart-rate"
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ex: 75"
                      min="0"
                      max="220"
                      value={healthData.heartRate}
                      onChange={(e) => setHealthData({...healthData, heartRate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Minutos de exercício</Label>
                    <input
                      id="exercise"
                      type="number"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ex: 30"
                      min="0"
                      value={healthData.exerciseMinutes}
                      onChange={(e) => setHealthData({...healthData, exerciseMinutes: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-4">Salvar Dados</Button>
              </form>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">Prévia: Saúde e Produtividade</h3>
                <div className="bg-muted rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Layers3 className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Gráficos de correlação</h4>
                      <p className="text-xs text-muted-foreground">
                        Adicione dados por pelo menos 7 dias para ver estatísticas de correlação entre saúde e produtividade.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
