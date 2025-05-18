
import { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import TaskForm from '../tasks/TaskForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNewTask={() => setIsTaskFormOpen(true)} />
      
      <motion.main 
        className="flex-1 container mx-auto px-4 py-6 mb-16"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      
      <BottomNavigation onAddTask={() => setIsTaskFormOpen(true)} />
      <TaskForm isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} />
    </div>
  );
}
