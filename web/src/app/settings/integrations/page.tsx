'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Puzzle, 
  Search, 
  Check, 
  Settings, 
  RefreshCw, 
  ExternalLink,
  MessageSquare,
  Github,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: 'collaboration' | 'development' | 'design' | 'productivity';
  status: 'connected' | 'disconnected';
  icon: any;
  color: string;
  features: string[];
}

export default function IntegrationsSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncInterval, setSyncInterval] = useState('15');
  const [autoAssign, setAutoAssign] = useState(true);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send task updates and AI risk notifications to your channels.',
      longDescription: 'Connect Stroovo to your Slack workspace to centralize communication. Keep your team aligned by posting task updates, status changes, and critical AI risk alerts directly into target channels.',
      category: 'collaboration',
      status: 'connected',
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-600 border-orange-200',
      features: ['Channel notifications', 'Slash commands (/stroovo)', 'Daily standup digests'],
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Sync pull requests and commits with tasks automatically.',
      longDescription: 'Link Stroovo tasks to your GitHub repositories. When a branch or pull request is created with a task ID, Stroovo automatically updates the task status, logs the commit history, and alerts team members.',
      category: 'development',
      status: 'connected',
      icon: Github,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      features: ['PR sync', 'Commit tracking', 'Auto-completion on merge'],
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync task due dates and project milestones directly.',
      longDescription: 'Integrate your professional calendar with your project schedules. Automatically export task due dates and sprint milestones, and view your schedule from within the Stroovo planner.',
      category: 'productivity',
      status: 'disconnected',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      features: ['2-way sync', 'Milestone highlights', 'Conflict detection'],
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Import issues and sync development tasks in real-time.',
      longDescription: 'Bridge the gap between enterprise tracking and developer workspaces. Keep issues and tasks synchronized, import backlogs, and run hybrid sprints across Jira and Stroovo.',
      category: 'development',
      status: 'disconnected',
      icon: Layers,
      color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      features: ['Issue importing', 'Custom field mapping', 'Sprint synchronization'],
    },
  ]);

  const categories = [
    { id: 'all', label: 'All Integrations' },
    { id: 'collaboration', label: 'Collaboration' },
    { id: 'development', label: 'Development' },
    { id: 'productivity', label: 'Productivity' },
  ];

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setWebhookUrl(integration.id === 'slack' ? 'https://hooks.slack.com/services/YOUR_WORKSPACE/YOUR_CHANNEL/YOUR_TOKEN' : '');
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIntegrations(prev => prev.map(item => {
      if (item.id === selectedIntegration.id) {
        return { ...item, status: 'connected' };
      }
      return item;
    }));
    
    setLoading(false);
    setIsConfigOpen(false);
    toast.success(`${selectedIntegration.name} integrated successfully!`);
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) return;
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIntegrations(prev => prev.map(item => {
      if (item.id === integration.id) {
        return { ...item, status: 'disconnected' };
      }
      return item;
    }));
    
    setLoading(false);
    toast.success(`${integration.name} disconnected.`);
  };

  const filteredIntegrations = integrations.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-[#FBFBFD]">
      <Sidebar />

      <main className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Puzzle size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Integrations</h1>
              <p className="text-xs text-gray-500">Connect third-party services to enhance workspace productivity</p>
            </div>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl w-full mx-auto space-y-8">
          
          {/* Main Title & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">App Directory</h2>
              <p className="text-gray-500 mt-1">Supercharge your project workflows with automated tool integrations.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search integrations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Categories Tab */}
          <div className="flex gap-2 border-b border-gray-200 pb-px">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all relative ${
                  selectedCategory === cat.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIntegrations.map(item => {
              const IconComponent = item.icon;
              const isConnected = item.status === 'connected';

              return (
                <div 
                  key={item.id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
                    isConnected ? 'border-indigo-200' : 'border-gray-200'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                        <IconComponent size={24} />
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isConnected 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {isConnected ? (
                          <>
                            <CheckCircle2 size={12} />
                            Connected
                          </>
                        ) : 'Not Connected'}
                      </span>
                    </div>

                    {/* Name & Short Desc */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6">{item.description}</p>

                    {/* Key Features Bullet List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">FEATURES INCLUDE</p>
                      {item.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <Check size={12} className="text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                    {isConnected ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConnect(item)}
                          className="flex items-center gap-1.5 text-gray-600 border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium"
                        >
                          <Settings size={14} />
                          Configure
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnect(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-medium ml-auto rounded-lg"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleConnect(item)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium px-4 flex items-center gap-1.5"
                      >
                        Connect
                        <ArrowRight size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coming Soon Alert Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Request Custom Integrations</h3>
              <p className="text-sm text-gray-600 mt-1">Need to sync data with a specific proprietary software? Get in touch with our solutions engineers to build bespoke webhook integrations.</p>
              <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mt-3 flex items-center gap-1">
                Contact Enterprise Support <ExternalLink size={14} />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Integration Configuration Modal */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
          {selectedIntegration && (
            <>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2.5 text-white">
                    {selectedIntegration.name} Integration
                  </DialogTitle>
                  <p className="text-indigo-100 text-sm mt-1">{selectedIntegration.longDescription}</p>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                {selectedIntegration.id === 'slack' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url" className="font-semibold text-gray-700 text-sm">Incoming Webhook URL</Label>
                    <Input 
                      id="webhook-url"
                      placeholder="e.g. https://hooks.slack.com/services/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="focus-visible:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500">Configure webhooks in your Slack app dashboard and paste the target channel webhook URL above.</p>
                  </div>
                )}

                {selectedIntegration.id !== 'slack' && (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center space-y-3">
                    <Sliders className="w-8 h-8 text-indigo-500 mx-auto" />
                    <p className="text-sm text-gray-600">Connect to authorization scope via secure OAuth protocol authentication flow.</p>
                  </div>
                )}

                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Auto-Assign Sync</h4>
                      <p className="text-xs text-gray-500">Match external users to Stroovo team members by email</p>
                    </div>
                    <button onClick={() => setAutoAssign(!autoAssign)}>
                      {autoAssign ? (
                        <ToggleRight className="w-8 h-8 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">Sync Frequency</h4>
                      <p className="text-xs text-gray-500">Interval duration to query for modifications</p>
                    </div>
                    <select 
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none"
                    >
                      <option value="5">Every 5m</option>
                      <option value="15">Every 15m</option>
                      <option value="60">Every 1h</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsConfigOpen(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
