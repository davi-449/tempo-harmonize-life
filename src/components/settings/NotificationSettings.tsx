
import { useNotifications } from '@/context/NotificationsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useState } from 'react';

export default function NotificationSettings() {
  const { preferences, updatePreferences, enableFocusMode, isFocusModeActive, disableFocusMode } = useNotifications();
  const [focusDuration, setFocusDuration] = useState(30); // 30 minutos por padrão
  
  const handleCategoryToggle = (category: string) => {
    updatePreferences({
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category]
      }
    });
  };
  
  const handlePriorityToggle = (priority: string) => {
    updatePreferences({
      priorities: {
        ...preferences.priorities,
        [priority]: !preferences.priorities[priority]
      }
    });
  };

  const handleSave = () => {
    toast.success('Configurações de notificação salvas');
  };

  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      'personal': 'Pessoal',
      'work': 'Trabalho',
      'fitness': 'Academia',
      'academic': 'Faculdade'
    };
    
    return translations[category] || category;
  };
  
  const translatePriority = (priority: string): string => {
    const translations: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa'
    };
    
    return translations[priority] || priority;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
          <CardDescription>
            Personalize como e quando receber notificações sobre suas tarefas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled">Notificações</Label>
              <Switch
                id="notifications-enabled"
                checked={preferences.enabled}
                onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Horário de Silêncio</Label>
              <div className="flex items-center gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="quiet-start">Início</Label>
                  <Input
                    type="time"
                    id="quiet-start"
                    value={preferences.quietHoursStart}
                    onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="quiet-end">Fim</Label>
                  <Input
                    type="time"
                    id="quiet-end"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Categorias</h3>
            <div className="space-y-2">
              {Object.keys(preferences.categories).map((category) => (
                <div key={category} className="flex items-center justify-between">
                  <Label htmlFor={`category-${category}`}>{translateCategory(category)}</Label>
                  <Switch
                    id={`category-${category}`}
                    checked={preferences.categories[category]}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Prioridades</h3>
            <div className="space-y-2">
              {Object.keys(preferences.priorities).map((priority) => (
                <div key={priority} className="flex items-center justify-between">
                  <Label htmlFor={`priority-${priority}`}>{translatePriority(priority)}</Label>
                  <Switch
                    id={`priority-${priority}`}
                    checked={preferences.priorities[priority]}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notificações Avançadas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="location-based">Baseadas em Localização</Label>
                <Switch
                  id="location-based"
                  checked={preferences.locationBased}
                  onCheckedChange={(checked) => updatePreferences({ locationBased: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="context-aware">Contextuais</Label>
                <Switch
                  id="context-aware"
                  checked={preferences.contextAware}
                  onCheckedChange={(checked) => updatePreferences({ contextAware: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Intensidade das Notificações</Label>
                  <span className="text-sm">
                    {preferences.intensity === 'low' ? 'Baixa' : 
                     preferences.intensity === 'medium' ? 'Média' : 'Alta'}
                  </span>
                </div>
                <Slider
                  value={[
                    preferences.intensity === 'low' ? 0 : 
                    preferences.intensity === 'medium' ? 50 : 100
                  ]}
                  onValueChange={(values) => {
                    const value = values[0];
                    let intensity: 'low' | 'medium' | 'high' = 'medium';
                    if (value < 33) intensity = 'low';
                    else if (value > 66) intensity = 'high';
                    updatePreferences({ intensity });
                  }}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Modo Foco</CardTitle>
          <CardDescription>
            Evite distrações durante períodos de alta concentração.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Duração do Modo Foco</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[focusDuration]}
                  onValueChange={(values) => setFocusDuration(values[0])}
                  max={120}
                  min={5}
                  step={5}
                  className="flex-1"
                />
                <span className="w-16 text-right">{focusDuration} min</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              {isFocusModeActive ? (
                <Button variant="destructive" onClick={disableFocusMode}>
                  Desativar Modo Foco
                </Button>
              ) : (
                <Button variant="default" onClick={() => enableFocusMode(focusDuration)}>
                  Ativar Modo Foco
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
