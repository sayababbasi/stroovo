"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, TrendingUp, Filter, ChevronDown, ChevronUp,
  FileText, Users, MessageSquare, Folder, Hash, Calendar, User,
  Tag, ArrowRight, ExternalLink, Sparkles, Zap, BarChart2,
  Settings, RefreshCw, Command, Keyboard
} from 'lucide-react';
import { SearchResult, SearchFilters } from '@/lib/search/global-search';

interface GlobalSearchProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  teamId,
  isOpen,
  onClose,
  onResultClick
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load popular searches
  useEffect(() => {
    if (isOpen) {
      loadPopularSearches();
    }
  }, [isOpen, teamId]);

  // Search with debouncing
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query, 0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedTypes, filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This would be handled by parent component
        }
      }
      
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadPopularSearches = async () => {
    try {
      // Mock popular searches - would fetch from API
      setPopularSearches([
        'documentation',
        'bug fixes',
        'feature requests',
        'meeting notes',
        'project timeline'
      ]);
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  const performSearch = async (searchQuery: string, searchOffset: number = 0) => {
    if (!teamId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        teamId,
        limit: '20',
        offset: searchOffset.toString(),
        sortBy: 'relevance',
        sortOrder: 'desc'
      });

      // Add filters
      if (selectedTypes.length > 0) {
        params.append('type', selectedTypes.join(','));
      }
      
      if (filters.spaceId) {
        params.append('spaceId', filters.spaceId);
      }
      
      if (filters.author) {
        params.append('author', filters.author);
      }
      
      if (filters.status) {
        params.append('status', filters.status.join(','));
      }
      
      if (filters.priority) {
        params.append('priority', filters.priority.join(','));
      }
      
      if (filters.dateRange) {
        params.append('dateStart', filters.dateRange.start);
        params.append('dateEnd', filters.dateRange.end);
      }

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (searchOffset === 0) {
          setResults(data.results);
        } else {
          setResults(prev => [...prev, ...data.results]);
        }
        
        setTotalResults(data.total);
        setHasMore(data.results.length === 20 && data.results.length + searchOffset < data.total);
        setOffset(searchOffset + data.results.length);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = () => {
    if (!loading && hasMore) {
      performSearch(query, offset);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedTypes([]);
    setQuery('');
    setResults([]);
    setOffset(0);
  };

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task': return <FileText className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'space': return <Folder className="w-4 h-4" />;
      case 'list': return <Hash className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get result color
  const getResultColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      case 'team': return 'text-purple-600 bg-purple-100';
      case 'space': return 'text-orange-600 bg-orange-100';
      case 'list': return 'text-indigo-600 bg-indigo-100';
      case 'message': return 'text-pink-600 bg-pink-100';
      case 'file': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const resultTypes = [
    { id: 'task', label: 'Tasks', icon: getResultIcon('task') },
    { id: 'user', label: 'Users', icon: getResultIcon('user') },
    { id: 'team', label: 'Teams', icon: getResultIcon('team') },
    { id: 'space', label: 'Spaces', icon: getResultIcon('space') },
    { id: 'list', label: 'Lists', icon: getResultIcon('list') },
    { id: 'message', label: 'Messages', icon: getResultIcon('message') },
    { id: 'file', label: 'Files', icon: getResultIcon('file') }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="max-w-4xl mx-auto mt-20 bg-white rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, users, messages, files..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Keyboard className="w-3 h-3" />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                ⌘K
              </kbd>
              <span>to search, ESC to close</span>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Type Filters */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Content Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {resultTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => handleTypeToggle(type.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            selectedTypes.includes(type.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {type.icon}
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear all filters
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Save filter preset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
            {loading && query.length >= 2 && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500">Searching...</p>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">No results found for "{query}"</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Try:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Checking spelling</li>
                    <li>• Using different keywords</li>
                    <li>• Removing filters</li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="p-6">
                {/* Popular Searches */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map(search => (
                      <button
                        key={search}
                        onClick={() => handleSuggestionClick(search)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Search Tips
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Use quotes for exact phrases: "project deadline"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Combine terms with AND/OR: documentation AND review</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Exclude terms with -: meeting -standup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Use filters to narrow down results</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!loading && results.length > 0 && (
              <div className="divide-y divide-gray-100">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Found {totalResults} results for "{query}"
                    {totalResults > 20 && ` (showing first ${offset})`}
                  </p>
                </div>
                
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getResultColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                          <span className="text-xs text-gray-500 capitalize">{result.type}</span>
                          {result.relevanceScore > 0 && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-500">
                                {Math.round(result.relevanceScore)}% match
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {result.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        
                        {/* Highlights */}
                        {result.highlights.length > 0 && (
                          <div className="mb-2">
                            {result.highlights.map((highlight, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-600"
                                dangerouslySetInnerHTML={{ __html: highlight }}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.metadata.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{result.metadata.assignee.name}</span>
                            </div>
                          )}
                          
                          {result.metadata.status && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              <span>{result.metadata.status}</span>
                            </div>
                          )}
                          
                          {result.metadata.priority && (
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                result.metadata.priority === 'HIGH' ? 'bg-red-500' :
                                result.metadata.priority === 'MEDIUM' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`} />
                              <span>{result.metadata.priority}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(result.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Load More */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <button
                      onClick={loadMoreResults}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More Results'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
