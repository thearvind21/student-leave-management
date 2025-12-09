
import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationsContext";
import { Notification } from "@/services/supabaseService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const NotificationItem = ({ 
  notification, 
  onMarkAsRead
}: { 
  notification: Notification, 
  onMarkAsRead: (id: string) => void 
}) => {
  return (
    <div
      className={`
        p-4 border-b last:border-b-0 
        ${notification.is_read ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50 transition-colors cursor-pointer
      `}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        </div>
        {!notification.is_read && (
          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
        <SheetFooter className="pt-2 border-t mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
