'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Mail, 
  MessageSquare, 
  Smartphone,
  ExternalLink,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deliveryStatus: {
    email: string;
    whatsapp: string;
    push: string;
    inApp: string;
  };
}

interface NotificationCenterProps {
  userId: string;
  tenantId: string;
}

export default function NotificationCenter({ userId, tenantId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications/list?userId=${userId}&tenantId=${tenantId}&limit=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          userId
        })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          markAll: true
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setSelectedNotifications(new Set());
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/read?notificationId=${notificationId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSelectedNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      window.open(notification.link, '_blank');
    }
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LOW':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Info className="w-4 h-4" />;
      case 'LOW':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <Mail className="w-4 h-4" />;
      case 'TASK_COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'DEADLINE_NEAR':
        return <AlertTriangle className="w-4 h-4" />;
      case 'RISK_DETECTED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'USER_MENTIONED':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'FAILED':
        return <X className="w-3 h-3 text-red-500" />;
      case 'PENDING':
        return <div className="w-3 h-3 border-2 border-gray-400 rounded-full" />;
      default:
        return <div className="w-3 h-3 border-2 border-gray-400 rounded-full" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'HIGH' || notification.priority === 'URGENT';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('/settings/notifications', '_blank')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
            </button>
            
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'high'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              High Priority
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 text-sm">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'high' ? 'No high priority notifications' : 
                   'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-sm font-medium text-gray-900 truncate ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h4>
                          
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(notification.priority)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                          </div>
                          
                          {notification.link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Delivery Status */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {getDeliveryStatusIcon(notification.deliveryStatus.email)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-gray-400" />
                            {getDeliveryStatusIcon(notification.deliveryStatus.whatsapp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-gray-400" />
                            {getDeliveryStatusIcon(notification.deliveryStatus.push)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {selectedNotifications.size > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectedNotifications.forEach(id => markAsRead(id));
                      setSelectedNotifications(new Set());
                    }}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    Mark as read
                  </button>
                  <button
                    onClick={() => {
                      selectedNotifications.forEach(id => deleteNotification(id));
                      setSelectedNotifications(new Set());
                    }}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
