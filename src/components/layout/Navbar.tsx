
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, CheckIcon, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';
import NotificationsMenu from '../notifications/NotificationsMenu';
import { useNotifications } from '@/context/NotificationsContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavbarProps {
  onNewTask: () => void;
}

export default function Navbar({ onNewTask }: NavbarProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        scrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-sm' 
          : 'bg-background'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Calendar className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xl">TempoApp</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            size="sm"
            onClick={onNewTask}
            className="hidden sm:flex items-center hover:scale-105 transition-transform"
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova Tarefa
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotificationsClick}
            className="relative hover:scale-105 transition-transform"
            aria-label="Notificações"
          >
            <NotificationsMenu />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Button>
          
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative rounded-full h-8 w-8 p-0 hover:scale-105 transition-transform">
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center h-full w-full">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
