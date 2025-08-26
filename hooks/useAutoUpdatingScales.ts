import { useState, useCallback, useEffect, useRef } from 'react';
import { DEV_CONFIG } from '@/config/development';

interface Scale {
  id: string;
  name: string;
  description: string;
  category: string;
  specialty?: string;
  [key: string]: any;
}

interface UseAutoUpdatingScalesOptions {
  updateInterval?: number; // milliseconds
  enableAutoUpdate?: boolean;
  enableLogging?: boolean;
}

export function useAutoUpdatingScales(options: UseAutoUpdatingScalesOptions = {}) {
  const {
    updateInterval = DEV_CONFIG.SCALES.AUTO_UPDATE_INTERVAL,
    enableAutoUpdate = true,
    enableLogging = DEV_CONFIG.SCALES.ENABLE_LOGGING
  } = options;

  const [scales, setScales] = useState<Scale[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousScalesRef = useRef<string>('');

  const log = useCallback((message: string) => {
    if (enableLogging) {
      console.log(`[useAutoUpdatingScales] ${message}`);
    }
  }, [enableLogging]);

  // Import scales dynamically to get latest data
  const updateScales = useCallback(async (force = false) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      log('Starting scales update...');
      
      // Import scales data
      const { scalesById } = await import('@/data/_scales');
      log(`Imported scalesById with ${Object.keys(scalesById).length} keys`);
      
      const currentScales = Object.values(scalesById) as Scale[];
      log(`Converted to array with ${currentScales.length} scales`);
      
      // Log first few scales for debugging
      if (currentScales.length > 0) {
        log(`First scale: ${currentScales[0].id} - ${currentScales[0].name}`);
        log(`Last scale: ${currentScales[currentScales.length - 1].id} - ${currentScales[currentScales.length - 1].name}`);
      }
      
      // Create a hash of current scales for comparison
      const currentHash = JSON.stringify(
        currentScales.map(s => ({ id: s.id, name: s.name, category: s.category })).sort((a, b) => a.id.localeCompare(b.id))
      );
      
      // Check if scales have actually changed
      const hasChanged = force || 
        scales.length !== currentScales.length || 
        currentHash !== previousScalesRef.current;
      
      log(`Has changed: ${hasChanged} (force: ${force}, length diff: ${scales.length !== currentScales.length}, hash diff: ${currentHash !== previousScalesRef.current})`);
      
      if (hasChanged) {
        setScales(currentScales);
        setLastUpdate(Date.now());
        previousScalesRef.current = currentHash;
        
        log(`Scales updated: ${currentScales.length} scales available`);
        
        // Log new scales if any
        if (scales.length > 0) {
          const newScaleIds = currentScales
            .filter(current => !scales.find(existing => existing.id === current.id))
            .map(s => s.id);
          
          if (newScaleIds.length > 0) {
            log(`New scales detected: ${newScaleIds.join(', ')}`);
          }
        }
      } else {
        log('No changes detected in scales');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      log(`Error updating scales: ${errorMessage}`);
      
      // En desarrollo, mostrar más detalles del error
      if (__DEV__) {
        console.error('Detailed error in useAutoUpdatingScales:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      }
    } finally {
      setIsUpdating(false);
    }
  }, [scales, log]);

  // Force update function for manual refresh
  const forceUpdate = useCallback(() => {
    log('Manual update requested');
    updateScales(true);
  }, [updateScales, log]);

  // Get scale by ID
  const getScaleById = useCallback((id: string): Scale | undefined => {
    return scales.find(scale => scale.id === id);
  }, [scales]);

  // Search scales with multiple criteria
  const searchScales = useCallback((query: string): Scale[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = scales.filter(scale => 
      scale.name.toLowerCase().includes(searchTerm) ||
      scale.description.toLowerCase().includes(searchTerm) ||
      scale.category.toLowerCase().includes(searchTerm) ||
      (scale.specialty && scale.specialty.toLowerCase().includes(searchTerm))
    );
    
    // Log search results in development
    if (__DEV__ && DEV_CONFIG.SCALES.DEBUG_SEARCH) {
      log(`Search for "${query}" returned ${results.length} results`);
    }
    
    return results;
  }, [scales, log]);

  // Get scales by category
  const getScalesByCategory = useCallback((category: string): Scale[] => {
    return scales.filter(scale => 
      scale.category.toLowerCase().includes(category.toLowerCase())
    );
  }, [scales]);

  // Get scales by specialty
  const getScalesBySpecialty = useCallback((specialty: string): Scale[] => {
    return scales.filter(scale => 
      scale.specialty && scale.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }, [scales]);

  // Update scales on mount and periodically
  useEffect(() => {
    log('Hook mounted, starting initial update...');
    updateScales();
    
    if (enableAutoUpdate) {
      log(`Setting up periodic updates every ${updateInterval}ms`);
      const interval = setInterval(() => {
        log('Periodic update triggered');
        updateScales();
      }, updateInterval);
      
      return () => {
        log('Cleaning up interval');
        clearInterval(interval);
      };
    }
  }, [updateScales, enableAutoUpdate, updateInterval, log]);

  // Listen for file changes in development (optional)
  useEffect(() => {
    if (__DEV__ && enableAutoUpdate) {
      log('Development mode: periodic updates enabled');
      log(`Update interval: ${updateInterval}ms`);
    }
  }, [enableAutoUpdate, updateInterval, log]);

  return {
    scales,
    lastUpdate,
    isUpdating,
    error,
    forceUpdate,
    getScaleById,
    searchScales,
    getScalesByCategory,
    getScalesBySpecialty,
    totalScales: scales.length,
    hasScales: scales.length > 0
  };
}
