
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNavigation from './BottomNavigation';
import { AnimatePresence, motion } from 'framer-motion';

export interface AppLayoutProps {
  children: ReactNode;
  onNewTask?: () => void;
}

const AppLayout = ({ children, onNewTask }: AppLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onNewTask={onNewTask || (() => {})} />
      
      <AnimatePresence mode="wait">
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 pt-6 pb-24 md:pb-12 grow"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <BottomNavigation />
      
      <Toaster />
    </div>
  );
};

export default AppLayout;
