import { useState, useEffect } from 'react';
import { Bell, X, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns';
import type { Visit, Property, Lead } from '@/features/core/types';

interface Notification {
  id: string;
  type: 'upcoming_visit' | 'overdue_visit' | 'reminder' | 'status_change';
  title: string;
  message: string;
  timestamp: Date;
  visit?: Visit;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationBadgeProps {
  visits: Visit[];
  properties: Property[];
  leads: Lead[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationBadge({
  visits,
  properties,
  leads,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate notifications based on visits
  useEffect(() => {
    const now = new Date();
    const generatedNotifications: Notification[] = [];

    visits.forEach(visit => {
      const visitDate = new Date(visit.when);
      const minutesUntil = differenceInMinutes(visitDate, now);
      
      const property = properties.find(p => p.id === visit.propertyId);
      const lead = leads.find(l => l.id === visit.leadId);

      // Upcoming visit notifications (within next 2 hours)
      if (visit.status === 'scheduled' && minutesUntil > 0 && minutesUntil <= 120) {
        generatedNotifications.push({
          id: `upcoming-${visit.id}`,
          type: 'upcoming_visit',
          title: 'Upcoming Visit',
          message: `Visit with ${lead?.name || 'Unknown'} in ${minutesUntil} minutes`,
          timestamp: now,
          visit,
          isRead: false,
          priority: minutesUntil <= 30 ? 'high' : 'medium'
        });
      }

      // Overdue visit notifications
      if (visit.status === 'scheduled' && minutesUntil < -30) {
        generatedNotifications.push({
          id: `overdue-${visit.id}`,
          type: 'overdue_visit',
          title: 'Overdue Visit',
          message: `Visit with ${lead?.name || 'Unknown'} was scheduled ${Math.abs(minutesUntil)} minutes ago`,
          timestamp: visitDate,
          visit,
          isRead: false,
          priority: 'high'
        });
      }

      // Reminder notifications
      if (visit.reminderMins && visit.status === 'scheduled') {
        const reminderTime = new Date(visitDate.getTime() - (visit.reminderMins * 60 * 1000));
        const minutesSinceReminder = differenceInMinutes(now, reminderTime);
        
        if (minutesSinceReminder >= 0 && minutesSinceReminder <= 60) {
          generatedNotifications.push({
            id: `reminder-${visit.id}`,
            type: 'reminder',
            title: 'Visit Reminder',
            message: `Reminder: Visit with ${lead?.name || 'Unknown'} at ${property?.title || 'Unknown Property'}`,
            timestamp: reminderTime,
            visit,
            isRead: false,
            priority: 'medium'
          });
        }
      }
    });

    // Sort by priority and timestamp
    generatedNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setNotifications(generatedNotifications.slice(0, 10)); // Limit to 10 notifications
  }, [visits, properties, leads]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upcoming_visit':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue_visit':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-yellow-600" />;
      case 'status_change':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatNotificationTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isTomorrow(timestamp)) {
      return 'Tomorrow';
    } else {
      return format(timestamp, 'MMM dd');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="solid" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                  getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                onClick={() => {
                  if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.visit && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(notification.visit.when), 'MMM dd, HH:mm')}
                          </div>
                          {notification.visit.propertyId && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {properties.find(p => p.id === notification.visit!.propertyId)?.title || 'Unknown'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNotificationTime(notification.timestamp)}
                    </span>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}