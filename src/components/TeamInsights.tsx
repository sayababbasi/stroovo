"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, AlertTriangle, Users, Target, BarChart2,
  RefreshCw, Download, Share2, Filter, ChevronDown, ChevronUp,
  Lightbulb, Activity, Clock, CheckCircle, XCircle, AlertCircle,
  Info, Zap, Shield, Eye, Settings, Calendar, ArrowUp, ArrowDown,
  Minus
} from 'lucide-react';
import { TeamInsight, WorkloadAnalysis, PerformanceTrend, RiskDetection } from '@/lib/ai/team-insights';

interface TeamInsightsProps {
  teamId: string;
  currentUserRole: string;
}

const TeamInsights: React.FC<TeamInsightsProps> = ({ teamId, currentUserRole }) => {
  const [insights, setInsights] = useState<TeamInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<TeamInsight | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Check permissions for AI insights
  const canViewInsights = currentUserRole !== 'VIEWER';

  // Fetch insights
  useEffect(() => {
    if (!canViewInsights) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/team-insights?teamId=${teamId}`);
        if (response.ok) {
          const insightsData = await response.json();
          setInsights(insightsData);
        } else {
          throw new Error('Failed to fetch insights');
        }
      } catch (error) {
        console.error('Error fetching team insights:', error);
        setError('Failed to load team insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [teamId, canViewInsights]);

  // Refresh insights
  const refreshInsights = async () => {
    if (!canViewInsights) return;

    setLoading(true);
    try {
      const response = await fetch('/api/team-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId })
      });

      if (response.ok) {
        const insightsData = await response.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || insight.severity === filterSeverity;
    return matchesType && matchesSeverity;
  });

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'WORKLOAD_BALANCE': return <Users className="w-5 h-5" />;
      case 'PERFORMANCE_TREND': return <TrendingUp className="w-5 h-5" />;
      case 'RISK_DETECTION': return <AlertTriangle className="w-5 h-5" />;
      case 'COLLABORATION_PATTERN': return <Users className="w-5 h-5" />;
      case 'PRODUCTIVITY_METRIC': return <BarChart2 className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  // Get insight color
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'WORKLOAD_BALANCE': return 'text-blue-600 bg-blue-100';
      case 'PERFORMANCE_TREND': return 'text-green-600 bg-green-100';
      case 'RISK_DETECTION': return 'text-red-600 bg-red-100';
      case 'COLLABORATION_PATTERN': return 'text-purple-600 bg-purple-100';
      case 'PRODUCTIVITY_METRIC': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'DOWN': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'STABLE': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // Toggle insight expansion
  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  // Get insight statistics
  const getInsightStats = () => {
    const stats = {
      total: insights.length,
      critical: insights.filter(i => i.severity === 'CRITICAL').length,
      high: insights.filter(i => i.severity === 'HIGH').length,
      medium: insights.filter(i => i.severity === 'MEDIUM').length,
      low: insights.filter(i => i.severity === 'LOW').length
    };
    return stats;
  };

  if (!canViewInsights) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Insights Not Available</h3>
        <p className="text-sm text-gray-500">You don't have permission to view team insights</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Team Insights</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {insights.length} insights
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshInsights}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(getInsightStats()).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${key === 'total' ? 'bg-blue-500' : getSeverityColor(key.toUpperCase())}`} />
              <div className="text-lg font-semibold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 capitalize">{key === 'total' ? 'Total' : key}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="WORKLOAD_BALANCE">Workload Balance</option>
            <option value="PERFORMANCE_TREND">Performance Trend</option>
            <option value="RISK_DETECTION">Risk Detection</option>
            <option value="COLLABORATION_PATTERN">Collaboration Pattern</option>
            <option value="PRODUCTIVITY_METRIC">Productivity Metric</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No insights available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{insight.title}</h3>
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(insight.severity)}`} />
                            <span className="text-xs text-gray-500 capitalize">{insight.severity}</span>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                          {/* Quick Stats */}
                          {insight.data && (
                            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                              {insight.data.currentVelocity && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  <span>Velocity: {insight.data.currentVelocity}</span>
                                </div>
                              )}
                              {insight.data.avgCompletionTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Avg Time: {insight.data.avgCompletionTime.toFixed(1)}d</span>
                                </div>
                              )}
                              {insight.data.overloadedMembers && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{insight.data.overloadedMembers.length} overloaded</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Recommendations */}
                          {insight.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                <Lightbulb className="w-3 h-3" />
                                <span>Recommendations</span>
                              </div>
                              <ul className="space-y-1">
                                {insight.recommendations.slice(0, expandedInsights.has(insight.id) ? undefined : 2).map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>

                              {insight.recommendations.length > 2 && (
                                <button
                                  onClick={() => toggleInsightExpansion(insight.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  {expandedInsights.has(insight.id) ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      Show less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      Show {insight.recommendations.length - 2} more
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedInsight(insight)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getInsightColor(selectedInsight.type)}`}>
                      {getInsightIcon(selectedInsight.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedInsight.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(selectedInsight.severity)}`} />
                        <span className="text-sm text-gray-500 capitalize">{selectedInsight.severity}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedInsight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedInsight.description}</p>
                  </div>

                  {selectedInsight.data && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedInsight.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedInsight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamInsights;
