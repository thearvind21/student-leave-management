
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabaseService, Notification } from '@/services/supabaseService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refresh: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userNotifications = await supabaseService.getNotifications(user.id);
      setNotifications(userNotifications);
      
      const count = await supabaseService.getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Set up realtime subscription
    const notificationChannel = supabaseService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Show a toast notification
        toast.info(newNotification.title, {
          description: newNotification.message,
        });
      }
    );

    setChannel(notificationChannel);

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const { success } = await supabaseService.markNotificationAsRead(id);
      if (success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { success } = await supabaseService.markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refresh = fetchNotifications;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
