
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
    
    // Hide welcome screen after animation
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (showWelcome) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center bg-background"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="rounded-full bg-primary/10 p-6 mb-4"
          >
            <Calendar className="h-16 w-16 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            <span className="text-primary">Tempo</span>App
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-muted-foreground"
          >
            Gerencie seu tempo, aumente sua produtividade
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 flex justify-end">
        <ModeToggle />
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 py-12">
        {/* App Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md text-center md:text-left md:mr-12 mb-12 md:mb-0"
        >
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            <span className="text-primary">Tempo</span>App
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Centralize suas tarefas, gerencie seu tempo e aumente sua produtividade com nossa solução intuitiva de gestão de tarefas.
          </p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-semibold">Rastreamento de Tarefas</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Organize tarefas por categorias: pessoal, trabalho, fitness e acadêmico.
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-semibold">Insights de Produtividade</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Analise sua produtividade com métricas visuais e tendências.
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-semibold">Notificações Inteligentes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Seja lembrado de tarefas importantes no momento certo.
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-semibold">Sincronização Multi-dispositivo</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Acesse suas tarefas de qualquer dispositivo, a qualquer hora.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Auth Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <AuthForm />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>© 2025 TempoApp. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
