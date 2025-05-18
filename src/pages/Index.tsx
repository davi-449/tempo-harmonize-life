
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { ModeToggle } from '@/components/layout/ModeToggle';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
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
        <div className="w-full max-w-md text-center md:text-left md:mr-12 mb-12 md:mb-0">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            <span className="text-primary">Tempo</span>App
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Centralize your tasks, manage your time, and boost your productivity with our intuitive task management solution.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold">Task Tracking</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Organize tasks by categories: personal, work, fitness, and academic.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold">Productivity Insights</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Analyze your productivity with visual metrics and trends.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold">Smart Notifications</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get reminded of important tasks at the right time.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold">Cross-Device Sync</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Access your tasks from any device, anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>© 2025 TempoApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
