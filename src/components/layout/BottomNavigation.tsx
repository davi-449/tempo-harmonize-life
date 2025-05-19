
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Plus, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onAddTask: () => void;
}

export default function BottomNavigation({ onAddTask }: BottomNavigationProps) {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border z-50">
      <div className="container mx-auto flex items-center justify-around h-16">
        <Link 
          to="/dashboard" 
          className={cn(
            "flex flex-col items-center p-2 text-xs",
            location.pathname === '/dashboard' 
              ? "text-kairos-blue-deep dark:text-kairos-purple" 
              : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Início</span>
        </Link>
        
        <Link 
          to="/calendar" 
          className={cn(
            "flex flex-col items-center p-2 text-xs",
            location.pathname === '/calendar' 
              ? "text-kairos-blue-deep dark:text-kairos-purple" 
              : "text-muted-foreground"
          )}
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span>Calendário</span>
        </Link>
        
        <button 
          onClick={onAddTask}
          className="flex flex-col items-center justify-center bg-gradient-blue-purple text-white rounded-full h-14 w-14 -mt-6 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </button>
        
        <Link 
          to="/analytics" 
          className={cn(
            "flex flex-col items-center p-2 text-xs",
            location.pathname === '/analytics' 
              ? "text-kairos-blue-deep dark:text-kairos-purple" 
              : "text-muted-foreground"
          )}
        >
          <BarChart2 className="h-5 w-5 mb-1" />
          <span>Análise</span>
        </Link>
        
        <Link 
          to="/settings" 
          className={cn(
            "flex flex-col items-center p-2 text-xs",
            location.pathname === '/settings' 
              ? "text-kairos-blue-deep dark:text-kairos-purple" 
              : "text-muted-foreground"
          )}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span>Perfil</span>
        </Link>
      </div>
    </div>
  );
}
