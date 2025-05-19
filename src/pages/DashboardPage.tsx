
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/components/dashboard/Dashboard";
import { Dialog } from "@/components/ui/dialog";
import TaskForm from "@/components/tasks/TaskForm";

const DashboardPage = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  const handleNewTask = () => {
    setIsNewTaskDialogOpen(true);
  };

  return (
    <AppLayout onNewTask={handleNewTask}>
      <Dashboard />
      
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <TaskForm 
          isOpen={isNewTaskDialogOpen} 
          onClose={() => setIsNewTaskDialogOpen(false)} 
        />
      </Dialog>
    </AppLayout>
  );
};

export default DashboardPage;
