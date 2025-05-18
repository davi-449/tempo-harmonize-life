
import AppLayout from "@/components/layout/AppLayout";
import WeeklyCalendar from "@/components/calendar/WeeklyCalendar";
import HealthProductivityCorrelation from "@/components/health/HealthProductivityCorrelation";
import { useAuth } from "@/context/AuthContext";
import { getTokens } from "@/services/googleAuth";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has Google integration
  const hasGoogleIntegration = user && getTokens(user.id) !== null;
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <WeeklyCalendar />
        
        {hasGoogleIntegration ? (
          <HealthProductivityCorrelation />
        ) : (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Activity className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Correlacione saúde e produtividade</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Conecte sua conta Google para sincronizar dados de saúde do Google Fit e descobrir como seu bem-estar físico afeta sua produtividade.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/settings')}
                >
                  Conectar Google Fit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
