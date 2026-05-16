import { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  getItemKey?: (index: number) => string;
}

interface VirtualizedItem {
  index: number;
  key: string;
  style: React.CSSProperties;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const { itemHeight, containerHeight, overscan = 5, getItemKey } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  // Apply overscan
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  // Generate virtualized items
  const virtualizedItems: VirtualizedItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualizedItems.push({
      index: i,
      key: getItemKey ? getItemKey(i) : i.toString(),
      style: {
        position: 'absolute' as const,
        top: i * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    });
  }

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (scrollElementRef.current) {
      setScrollTop(scrollElementRef.current.scrollTop);
    }
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = items.length * itemHeight;
    }
  }, [items.length, itemHeight]);

  return {
    virtualizedItems,
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    scrollElementRef,
    handleScroll,
    scrollToItem,
    scrollToTop,
    scrollToBottom
  };
}

// Hook for lazy loading data
interface LazyLoadOptions<T> {
  fetcher: (page: number, limit: number) => Promise<T[]>;
  pageSize?: number;
  threshold?: number;
  initialPage?: number;
}

export function useLazyLoad<T>({
  fetcher,
  pageSize = 20,
  threshold = 0.8,
  initialPage = 1
}: LazyLoadOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || loading || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const newItems = await fetcher(page, pageSize);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => {
          // Deduplicate by id to prevent duplicate keys
          const existingIds = new Set(prev.map((item: any) => item.id));
          const uniqueNew = newItems.filter((item: any) => !existingIds.has(item.id));
          return [...prev, ...uniqueNew];
        });
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetcher, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, [initialPage]);

  const refresh = useCallback(() => {
    reset();
  }, [reset]);

  // Initial load or refresh
  useEffect(() => {
    if (items.length === 0 && hasMore && !loading) {
      loadMore();
    }
  }, [items.length, hasMore, loading, loadMore]);

  // Intersection observer for infinite scroll
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, loading, hasMore, threshold]);



  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refresh,
    observerRef
  };
}

// Hook for debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for cached data fetching
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }
}

export const dataCache = new DataCache();

// Hook for cached API calls
export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedData = dataCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      dataCache.set(key, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T[],
  updateFn: (items: T[]) => Promise<T[]>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with initial data when it changes
  useEffect(() => {
    setData(initialData);
    setOptimisticData(initialData);
  }, [initialData]);

  const update = useCallback(async (updater: (current: T[]) => T[]) => {
    setLoading(true);
    setError(null);

    // Apply optimistic update
    const optimisticResult = updater(data);
    setOptimisticData(optimisticResult);

    try {
      const result = await updateFn(optimisticResult);
      setData(result);
      setOptimisticData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      // Revert optimistic update
      setOptimisticData(data);
    } finally {
      setLoading(false);
    }
  }, [data, updateFn]);

  const reset = useCallback(() => {
    setData(initialData);
    setOptimisticData(initialData);
    setError(null);
  }, [initialData]);

  return {
    data: optimisticData,
    loading,
    error,
    update,
    reset
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    
    // Log render performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTime}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // TODO: Send performance metrics to analytics
    }
  });

  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: any[]) => {
      const start = Date.now();
      const result = fn(...args);
      const end = Date.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}.${functionName} took ${end - start}ms`);
      }
      
      return result;
    }) as T;
  }, [componentName]);

  return {
    measureFunction
  };
}
