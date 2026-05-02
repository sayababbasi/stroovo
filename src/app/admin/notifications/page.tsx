'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Send, 
  Users, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Target, 
  Clock, 
  Filter,
  Search,
  Plus,
  X,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  channels: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
    inApp: boolean;
  };
  scheduledTime?: string;
  link?: string;
  metadata?: Record<string, any>;
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'INFO',
    priority: 'MEDIUM',
    channels: {
      email: true,
      whatsapp: false,
      push: true,
      inApp: true
    }
  });

  const notificationTypes = [
    { value: 'INFO', label: 'Information', icon: Info, color: 'blue' },
    { value: 'WARNING', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
    { value: 'SUCCESS', label: 'Success', icon: CheckCircle, color: 'green' },
    { value: 'ERROR', label: 'Error', icon: AlertTriangle, color: 'red' },
    { value: 'TASK_ASSIGNED', label: 'Task Assigned', icon: Target, color: 'purple' },
    { value: 'TASK_COMPLETED', label: 'Task Completed', icon: CheckCircle, color: 'green' },
    { value: 'DEADLINE_NEAR', label: 'Deadline Near', icon: Clock, color: 'orange' },
    { value: 'RISK_DETECTED', label: 'Risk Detected', icon: AlertTriangle, color: 'red' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'gray' },
    { value: 'MEDIUM', label: 'Medium', color: 'blue' },
    { value: 'HIGH', label: 'High', color: 'orange' },
    { value: 'URGENT', label: 'Urgent', color: 'red' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchSentNotifications();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, fetch from API
      const mockUsers: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'ADMIN', department: 'Engineering', isActive: true },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'MANAGER', department: 'Marketing', isActive: true },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', department: 'Sales', isActive: true },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'USER', department: 'Engineering', isActive: false },
        { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'MANAGER', department: 'Engineering', isActive: true }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentNotifications = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockSent = [
        {
          id: '1',
          title: 'System Maintenance',
          message: 'Scheduled maintenance tonight at 11 PM',
          type: 'INFO',
          priority: 'HIGH',
          recipients: 150,
          sentAt: '2024-01-15T10:30:00Z',
          status: 'SENT'
        },
        {
          id: '2',
          title: 'New Feature Release',
          message: 'Check out our new dashboard features',
          type: 'SUCCESS',
          priority: 'MEDIUM',
          recipients: 200,
          sentAt: '2024-01-14T14:20:00Z',
          status: 'SENT'
        }
      ];
      setSentNotifications(mockSent);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const sendNotification = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one recipient');
      return;
    }

    if (!formData.title || !formData.message) {
      alert('Please fill in title and message');
      return;
    }

    setSending(true);
    try {
      const promises = Array.from(selectedUsers).map(userId => {
        return fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: formData.type,
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            userId,
            tenantId: 'tenant-456', // Mock tenant ID
            link: formData.link,
            metadata: formData.metadata
          })
        });
      });

      await Promise.all(promises);
      
      // Refresh sent notifications
      await fetchSentNotifications();
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'INFO',
        priority: 'MEDIUM',
        channels: {
          email: true,
          whatsapp: false,
          push: true,
          inApp: true
        }
      });
      setSelectedUsers(new Set());
      setShowPreview(false);
      
      alert(`Notification sent to ${selectedUsers.size} users successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-gray-600 bg-gray-50';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'URGENT': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'text-blue-600 bg-blue-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'ERROR': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-60">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Send Notifications
              </h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recipients */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recipients
                  </h2>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedUsers.size} selected
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Select All */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </label>
                  <span className="text-sm text-gray-500">
                    {filteredUsers.length} users
                  </span>
                </div>

                {/* Users List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedUsers.has(user.id)
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-xs text-gray-500">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Message Composition */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Message Composition
                </h2>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter notification title"
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter notification message"
                  />
                </div>

                {/* Type and Priority */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Channels */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Channels
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, email: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.whatsapp}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, whatsapp: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">WhatsApp</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.push}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, push: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Push</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.inApp}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, inApp: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">In-App</span>
                    </label>
                  </div>
                </div>

                {/* Link */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.link || ''}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPreview(true)}
                    disabled={!formData.title || !formData.message || selectedUsers.size === 0}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Preview
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFormData({
                        title: '',
                        message: '',
                        type: 'INFO',
                        priority: 'MEDIUM',
                        channels: {
                          email: true,
                          whatsapp: false,
                          push: true,
                          inApp: true
                        }
                      })}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear
                    </button>

                    <button
                      onClick={sendNotification}
                      disabled={sending || selectedUsers.size === 0 || !formData.title || !formData.message}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send to {selectedUsers.size} users
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Sent Notifications */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Sent</h3>
                <div className="space-y-3">
                  {sentNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Sent to {notification.recipients} users</span>
                        <span>{new Date(notification.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Notification Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                      {formData.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(formData.type)}`}>
                      {formData.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
                  <p className="text-gray-600 mb-3">{formData.message}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>Recipients:</span>
                    <span className="font-medium">{selectedUsers.size} users</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Channels:</span>
                    {formData.channels.email && <Mail className="w-4 h-4" />}
                    {formData.channels.whatsapp && <MessageSquare className="w-4 h-4" />}
                    {formData.channels.push && <Smartphone className="w-4 h-4" />}
                    {formData.channels.inApp && <Bell className="w-4 h-4" />}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      sendNotification();
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
