'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  Shield, 
  Zap, 
  Filter,
  Save,
  X
} from 'lucide-react';

interface NotificationChannel {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationRule {
  id: string;
  name: string;
  event: string;
  condition: Record<string, any>;
  action: string;
  channels: string[];
  enabled: boolean;
}

interface NotificationSettings {
  channels: NotificationChannel;
  userRules: NotificationRule[];
  tenantRules: NotificationRule[];
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'rules'>('channels');

  // Mock user data - in real app, get from auth context
  const userId = 'user-123';
  const tenantId = 'tenant-456';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/notifications/settings?userId=${userId}&tenantId=${tenantId}`);
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tenantId,
          channels: settings.channels,
          rules: settings.userRules
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateChannel = (channel: keyof NotificationChannel, value: boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: value
      }
    });
  };

  const addRule = (rule: NotificationRule) => {
    if (!settings) return;

    setSettings({
      ...settings,
      userRules: [...settings.userRules, rule]
    });
    setShowRuleBuilder(false);
  };

  const updateRule = (updatedRule: NotificationRule) => {
    if (!settings) return;

    setSettings({
      ...settings,
      userRules: settings.userRules.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      )
    });
    setEditingRule(null);
  };

  const deleteRule = (ruleId: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      userRules: settings.userRules.filter(rule => rule.id !== ruleId)
    });
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tenantId,
          ruleId,
          enabled
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        if (settings) {
          setSettings({
            ...settings,
            userRules: settings.userRules.map(rule => 
              rule.id === ruleId ? { ...rule, enabled } : rule
            )
          });
        }
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-60 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notification settings...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-60 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Failed to load notification settings</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-60">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Notification Settings
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex px-8">
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'channels'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Channels
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rules'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Rules
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'channels' ? (
            <ChannelSettings 
              channels={settings.channels} 
              onUpdate={updateChannel}
            />
          ) : (
            <RuleSettings
              userRules={settings.userRules}
              tenantRules={settings.tenantRules}
              onAdd={() => setShowRuleBuilder(true)}
              onEdit={setEditingRule}
              onDelete={deleteRule}
              onToggle={toggleRule}
            />
          )}
        </div>

        {/* Rule Builder Modal */}
        {(showRuleBuilder || editingRule) && (
          <RuleBuilderModal
            rule={editingRule}
            onClose={() => {
              setShowRuleBuilder(false);
              setEditingRule(null);
            }}
            onSave={editingRule ? updateRule : addRule}
          />
        )}
      </main>
    </div>
  );
}

// Channel Settings Component
function ChannelSettings({ 
  channels, 
  onUpdate 
}: { 
  channels: NotificationChannel; 
  onUpdate: (channel: keyof NotificationChannel, value: boolean) => void;
}) {
  const channelOptions = [
    {
      key: 'email' as keyof NotificationChannel,
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      color: 'blue'
    },
    {
      key: 'whatsapp' as keyof NotificationChannel,
      label: 'WhatsApp Notifications',
      description: 'Get updates on WhatsApp',
      icon: MessageSquare,
      color: 'green'
    },
    {
      key: 'push' as keyof NotificationChannel,
      label: 'Push Notifications',
      description: 'Browser push notifications',
      icon: Smartphone,
      color: 'purple'
    },
    {
      key: 'inApp' as keyof NotificationChannel,
      label: 'In-App Notifications',
      description: 'Show notifications within the app',
      icon: Bell,
      color: 'orange'
    }
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Channels</h2>
        <p className="text-gray-600">
          Choose how you want to receive notifications. You can enable or disable each channel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channelOptions.map((option) => {
          const IconComponent = option.icon;
          const isEnabled = channels[option.key];

          return (
            <div
              key={option.key}
              className={`bg-white border rounded-xl p-6 transition-all duration-200 ${
                isEnabled 
                  ? 'border-purple-300 shadow-sm' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${option.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 text-${option.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => onUpdate(option.key, !isEnabled)}
                  className="p-1"
                >
                  {isEnabled ? (
                    <ToggleRight className="w-6 h-6 text-purple-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              <div className={`text-sm ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Settings */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Smart Timing
        </h3>
        <p className="text-gray-600 mb-4">
          AI will optimize when to send notifications based on your activity patterns and preferences.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                defaultValue="09:00"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                defaultValue="17:00"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiet Hours
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                defaultValue="22:00"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                defaultValue="07:00"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rule Settings Component
function RuleSettings({
  userRules,
  tenantRules,
  onAdd,
  onEdit,
  onDelete,
  onToggle
}: {
  userRules: NotificationRule[];
  tenantRules: NotificationRule[];
  onAdd: () => void;
  onEdit: (rule: NotificationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, enabled: boolean) => void;
}) {
  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Rules</h2>
          <p className="text-gray-600">
            Create custom rules to control when and how you receive notifications.
          </p>
        </div>
        
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* User Rules */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Your Custom Rules
        </h3>
        
        {userRules.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No custom rules created yet</p>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Rule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                isCustom={true}
                onEdit={() => onEdit(rule)}
                onDelete={() => onDelete(rule.id)}
                onToggle={(enabled) => onToggle(rule.id, enabled)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tenant Rules */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Workspace Rules
        </h3>
        
        <div className="space-y-4">
          {tenantRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              isCustom={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggle={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Rule Card Component
function RuleCard({
  rule,
  isCustom,
  onEdit,
  onDelete,
  onToggle
}: {
  rule: NotificationRule;
  isCustom: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const getEventLabel = (event: string) => {
    return event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getChannelLabel = (channel: string) => {
    return channel.charAt(0).toUpperCase() + channel.slice(1);
  };

  return (
    <div className={`bg-white border rounded-xl p-6 transition-all duration-200 ${
      rule.enabled ? 'border-purple-300 shadow-sm' : 'border-gray-200 opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{rule.name}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {rule.enabled ? 'Active' : 'Inactive'}
            </span>
            {isCustom && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Custom
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            When <strong>{getEventLabel(rule.event)}</strong> occurs, send notification via{' '}
            {rule.channels.map(getChannelLabel).join(', ')}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Action: {rule.action}</span>
            {rule.condition && Object.keys(rule.condition).length > 0 && (
              <span>Conditions: {Object.keys(rule.condition).length}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCustom && (
            <>
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => onToggle(!rule.enabled)}
            className="p-1"
          >
            {rule.enabled ? (
              <ToggleRight className="w-6 h-6 text-purple-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Rule Builder Modal Component
function RuleBuilderModal({
  rule,
  onClose,
  onSave
}: {
  rule: NotificationRule | null;
  onClose: () => void;
  onSave: (rule: NotificationRule) => void;
}) {
  const [formData, setFormData] = useState<NotificationRule>(
    rule || {
      id: '',
      name: '',
      event: 'TASK_ASSIGNED',
      condition: {},
      action: 'SEND_EMAIL',
      channels: ['email'],
      enabled: true
    }
  );

  const events = [
    'TASK_ASSIGNED',
    'TASK_COMPLETED',
    'DEADLINE_NEAR',
    'RISK_DETECTED',
    'PROJECT_CREATED',
    'USER_MENTIONED'
  ];

  const actions = [
    'SEND_EMAIL',
    'SEND_WHATSAPP',
    'SEND_PUSH',
    'SEND_ALL'
  ];

  const channelOptions = [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'push', label: 'Push' },
    { value: 'inApp', label: 'In-App' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {rule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., High Priority Task Alerts"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Trigger
            </label>
            <select
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {events.map((event) => (
                <option key={event} value={event}>
                  {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Channels
            </label>
            <div className="space-y-2">
              {channelOptions.map((channel) => (
                <label key={channel.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes(channel.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          channels: [...formData.channels, channel.value]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          channels: formData.channels.filter(c => c !== channel.value)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{channel.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
