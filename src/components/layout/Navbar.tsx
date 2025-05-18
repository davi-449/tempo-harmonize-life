
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, CheckIcon, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModeToggle } from './ModeToggle';

interface NavbarProps {
  onNewTask: () => void;
}

export default function Navbar({ onNewTask }: NavbarProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header
      className={`sticky top-0 z-10 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md shadow-sm' 
          : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">TempoApp</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            size="sm"
            onClick={onNewTask}
            className="hidden sm:flex items-center"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Task
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNewTask}
            className="sm:hidden"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative rounded-full h-8 w-8 p-0">
                <span className="sr-only">Open user menu</span>
                <div className="rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center h-full w-full">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
