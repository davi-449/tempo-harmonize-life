
import AppLayout from "@/components/layout/AppLayout";
import NotificationsCenter from "@/components/notifications/NotificationsCenter";

const NotificationsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Central de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas notificações e alertas em um só lugar.
          </p>
        </div>
        
        <NotificationsCenter />
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
