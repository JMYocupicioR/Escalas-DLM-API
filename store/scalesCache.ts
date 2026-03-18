/**
 * @file store/scalesCache.ts
 * @description Smart caching system for medical scales data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedScale {
  id: string;
  data: any;
  lastFetched: number;
  expires: number;
}

interface CachedSearchResult {
  query: string;
  filters: Record<string, any>;
  results: any[];
  lastFetched: number;
  expires: number;
}

interface ScalesCacheState {
  // Cached data
  scales: Record<string, CachedScale>;
  searchResults: Record<string, CachedSearchResult>;
  categories: any[] | null;
  categoriesLastFetched: number;
  
  // Network state
  isOnline: boolean;
  lastSync: number;
  
  // Actions
  cacheScale: (scale: any) => void;
  getCachedScale: (id: string) => any | null;
  cacheSearchResults: (query: string, filters: Record<string, any>, results: any[]) => void;
  getCachedSearchResults: (query: string, filters: Record<string, any>) => any[] | null;
  cacheCategories: (categories: any[]) => void;
  getCachedCategories: () => any[] | null;
  invalidateScale: (id: string) => void;
  invalidateSearch: (query?: string) => void;
  clearExpired: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  clearAll: () => void;
}

const CACHE_DURATION = {
  SCALE: 30 * 60 * 1000, // 30 minutes
  SEARCH: 10 * 60 * 1000, // 10 minutes  
  CATEGORIES: 60 * 60 * 1000, // 1 hour
};

const generateCacheKey = (query: string, filters: Record<string, any>): string => {
  return `${query}|${JSON.stringify(filters)}`;
};

export const useScalesCacheStore = create<ScalesCacheState>()(
  persist(
    (set, get) => ({
      // Initial state
      scales: {},
      searchResults: {},
      categories: null,
      categoriesLastFetched: 0,
      isOnline: true,
      lastSync: 0,

      // Cache a single scale
      cacheScale: (scale) => set((state) => {
        const now = Date.now();
        return {
          scales: {
            ...state.scales,
            [scale.id]: {
              id: scale.id,
              data: scale,
              lastFetched: now,
              expires: now + CACHE_DURATION.SCALE,
            }
          }
        };
      }),

      // Get cached scale if not expired
      getCachedScale: (id) => {
        const cached = get().scales[id];
        if (!cached || Date.now() > cached.expires) {
          return null;
        }
        return cached.data;
      },

      // Cache search results
      cacheSearchResults: (query, filters, results) => set((state) => {
        const cacheKey = generateCacheKey(query, filters);
        const now = Date.now();
        
        return {
          searchResults: {
            ...state.searchResults,
            [cacheKey]: {
              query,
              filters,
              results,
              lastFetched: now,
              expires: now + CACHE_DURATION.SEARCH,
            }
          }
        };
      }),

      // Get cached search results if not expired
      getCachedSearchResults: (query, filters) => {
        const cacheKey = generateCacheKey(query, filters);
        const cached = get().searchResults[cacheKey];
        
        if (!cached || Date.now() > cached.expires) {
          return null;
        }
        return cached.results;
      },

      // Cache categories
      cacheCategories: (categories) => set(() => ({
        categories,
        categoriesLastFetched: Date.now(),
      })),

      // Get cached categories if not expired
      getCachedCategories: () => {
        const { categories, categoriesLastFetched } = get();
        if (!categories || Date.now() > categoriesLastFetched + CACHE_DURATION.CATEGORIES) {
          return null;
        }
        return categories;
      },

      // Invalidate specific scale
      invalidateScale: (id) => set((state) => {
        const { [id]: _, ...rest } = state.scales;
        return { scales: rest };
      }),

      // Invalidate search results
      invalidateSearch: (query) => set((state) => {
        if (!query) {
          return { searchResults: {} };
        }
        
        const filteredResults = Object.fromEntries(
          Object.entries(state.searchResults).filter(
            ([key]) => !key.startsWith(query)
          )
        );
        
        return { searchResults: filteredResults };
      }),

      // Clear expired cache entries
      clearExpired: () => set((state) => {
        const now = Date.now();
        
        // Clear expired scales
        const validScales = Object.fromEntries(
          Object.entries(state.scales).filter(
            ([_, cached]) => now <= cached.expires
          )
        );
        
        // Clear expired search results
        const validSearchResults = Object.fromEntries(
          Object.entries(state.searchResults).filter(
            ([_, cached]) => now <= cached.expires
          )
        );
        
        return {
          scales: validScales,
          searchResults: validSearchResults,
        };
      }),

      // Set online status
      setOnlineStatus: (isOnline) => set({ isOnline }),

      // Update last sync timestamp
      updateLastSync: () => set({ lastSync: Date.now() }),

      // Clear all cache
      clearAll: () => set({
        scales: {},
        searchResults: {},
        categories: null,
        categoriesLastFetched: 0,
        lastSync: 0,
      }),
    }),
    {
      name: 'scales-cache-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        scales: state.scales,
        searchResults: state.searchResults,
        categories: state.categories,
        categoriesLastFetched: state.categoriesLastFetched,
        lastSync: state.lastSync,
      }),
    }
  )
);

// Helper hook for cache management
export const useCacheManager = () => {
  const cache = useScalesCacheStore();
  
  const smartFetch = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    cacher: (data: T) => void
  ): Promise<T> => {
    try {
      // Try to get from cache first
      const cached = cache.getCachedScale(key);
      if (cached && cache.isOnline) {
        return cached;
      }
      
      // If offline, return cached data even if expired
      if (!cache.isOnline && cached) {
        return cached;
      }
      
      // Fetch fresh data
      const data = await fetcher();
      cacher(data);
      cache.updateLastSync();
      
      return data;
    } catch (error) {
      // On error, return cached data if available
      const cached = cache.getCachedScale(key);
      if (cached) {
        return cached;
      }
      throw error;
    }
  };

  return {
    ...cache,
    smartFetch,
  };
}; 