
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Check, Trash } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Header from "../components/Header";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import MobileFooter from "@/components/MobileFooter";

const Notifications = () => {
  const { data: notifications, isLoading, error } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      document.title = `FI Investments | Benachrichtigungen (${notifications.filter(n => !n.read).length})`;
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
    toast.success("Alle Benachrichtigungen als gelesen markiert");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return <div className="bg-green-100 p-2 rounded-full"><Bell size={20} className="text-green-600" /></div>;
      case "product_update":
        return <div className="bg-blue-100 p-2 rounded-full"><Bell size={20} className="text-blue-600" /></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full"><Bell size={20} className="text-gray-600" /></div>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d. MMMM yyyy, HH:mm", { locale: de });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <main className="pt-16 pb-24 px-4 flex-grow">
        <div className="space-y-6">
          <section className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-fi-gold mr-3">
                <ArrowLeft size={24} />
              </Link>
              <h1 className="text-2xl font-semibold">Benachrichtigungen</h1>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="flex items-center text-sm"
              >
                <Check className="mr-1 h-4 w-4" />
                Alle als gelesen markieren
              </Button>
            )}
          </section>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4 flex-grow">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              Fehler beim Laden der Benachrichtigungen
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                    notification.read ? 'border-transparent' : 'border-fi-gold'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Als gelesen markieren
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {notification.action_url && (
                    <div className="mt-3 pl-14">
                      <Link 
                        to={notification.action_url} 
                        className="text-fi-gold hover:underline text-sm"
                      >
                        Mehr anzeigen
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <section className="bg-white rounded-lg p-8 shadow-sm text-center space-y-4">
              <Bell size={40} className="mx-auto text-gray-400" />
              <p className="text-center text-gray-500">
                Keine Benachrichtigungen vorhanden.
              </p>
              <p className="text-sm text-gray-400">
                Neue Benachrichtigungen werden hier angezeigt.
              </p>
            </section>
          )}
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Notifications;
