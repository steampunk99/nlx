import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useNotificationSound } from '@/hooks/notifications/useNotificationSound';
import { useNotificationPreferences } from '@/hooks/notifications/useNotificationPreferences';
import { 
  Bell,
  AlertTriangle,
  DollarSign,
  Users,
  Handshake,
  Package,
  Bell as BellDefault,
  Filter,
  Settings,
  Volume2,
  VolumeX,
  BellOff,
  Trash2,
  CheckCheck,
  CreditCard,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const defaultNotificationTypes = [
  { type: 'ALL', label: 'All Notifications' },
  { type: 'SYSTEM_ALERT', label: 'System Alerts' },
  { type: 'COMMISSION_EARNED', label: 'Commission' },
  { type: 'NEW_USER', label: 'New Users' },
  { type: 'NEW_REFERRAL', label: 'Referrals' },
  { type: 'PACKAGE_PURCHASE', label: 'Packages' }
];

const defaultNotificationColors = {
  SYSTEM_ALERT: 'bg-red-100 text-red-800',
  COMMISSION_EARNED: 'bg-green-100 text-green-800',
  NEW_USER: 'bg-blue-100 text-blue-800',
  NEW_REFERRAL: 'bg-blue-100 text-blue-800',
  PACKAGE_PURCHASE: 'bg-purple-100 text-purple-800'
};

const defaultIcons = {
  SYSTEM_ALERT: AlertTriangle,
  COMMISSION_EARNED: DollarSign,
  NEW_USER: Users,
  NEW_REFERRAL: Handshake,
  PACKAGE_PURCHASE: Package,
  PAYMENT: DollarSign,
  WITHDRAWAL: CreditCard,
  COMMISSION: Gift,
  PACKAGE: Package
};

export function NotificationBell({ 
  className,
  notificationTypes = defaultNotificationTypes,
  getNotificationColor = (type) => defaultNotificationColors[type] || 'bg-gray-100 text-gray-800',
  getNotificationIcon = (type) => {
    const IconComponent = defaultIcons[type] || BellDefault;
    return <IconComponent className="h-5 w-5" />;
  }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL');
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const playSound = useNotificationSound();
  const { preferences, toggleSound, toggleDesktopNotifications } = useNotificationPreferences();
  
  const {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    isLoading,
    pagination,
    page,
    setPage
  } = useNotifications();

  // Play sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCount && preferences.soundEnabled) {
      playSound();
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount, playSound, preferences.soundEnabled]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    selectedType === 'ALL' ? true : notification.type.includes(selectedType)
  );

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  return (
    <div className="relative" ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("relative p-2", className)}>
            <Bell className={cn(
              "h-6 w-6 transition-all",
              unreadCount > 0 && "animate-bounce"
            )} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[380px]">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {notificationTypes.map(({ type, label }) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "cursor-pointer",
                        selectedType === type && "bg-accent"
                      )}
                    >
                      {getNotificationIcon(type)}
                      <span className="ml-2">{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={toggleSound}>
                    {preferences.soundEnabled ? (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Disable Sound
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Enable Sound
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleDesktopNotifications}>
                    {preferences.desktopEnabled ? (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        Disable Desktop Notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4 mr-2" />
                        Enable Desktop Notifications
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {selectedType === 'ALL' 
                  ? 'No notifications' 
                  : `No ${selectedType.toLowerCase().replace('_', ' ')} notifications`}
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([date, notifications]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-accent/50 px-4 py-2 text-sm font-medium">
                    {date}
                  </div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors',
                        !notification.isRead && 'bg-accent/20'
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-full',
                          getNotificationColor(notification.type)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={cn(
                              "font-semibold",
                              getNotificationColor(notification.type).split(' ')[1] || 'text-gray-900'
                            )}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-1",
                            getNotificationColor(notification.type).split(' ')[1] || 'text-gray-600'
                          )}>
                            {notification.message}
                          </p>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              'mt-2',
                              getNotificationColor(notification.type)
                            )}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t">
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page => page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page => page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
