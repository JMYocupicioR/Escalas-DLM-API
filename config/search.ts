export const SEARCH_CONFIG = {
  // Auto-update settings
  AUTO_UPDATE: {
    ENABLED: true,
    INTERVAL: 30000, // 30 seconds
    ENABLE_LOGGING: __DEV__, // Only in development
  },
  
  // Search settings
  SEARCH: {
    MAX_SUGGESTIONS: 4,
    MAX_CATEGORY_SUGGESTIONS: 2,
    DEBOUNCE_DELAY: 300, // milliseconds
    MIN_QUERY_LENGTH: 1,
  },
  
  // Categories for search
  CATEGORIES: [
    'Funcional', 'Neurológica', 'Cognitiva', 'Dolor', 'Cardiovascular', 
    'Respiratoria', 'Psiquiátrica', 'Geriátrica', 'Rehab', 'Rehabilitación',
    'Medicina Física', 'Traumatología', 'Neurología', 'Geriatría', 'Osteoartritis', 'Rodilla'
  ],
  
  // Search fields to include
  SEARCH_FIELDS: ['name', 'description', 'category', 'specialty'] as const,
  
  // Recent suggestions
  RECENT: {
    MAX_ITEMS: 3,
    ENABLED: true,
  },
  
  // Debug settings
  DEBUG: {
    ENABLED: __DEV__,
    LOG_SEARCH_QUERIES: true,
    LOG_SCALE_UPDATES: true,
    LOG_SUGGESTIONS: true,
  }
};

export type SearchField = typeof SEARCH_CONFIG.SEARCH_FIELDS[number];
