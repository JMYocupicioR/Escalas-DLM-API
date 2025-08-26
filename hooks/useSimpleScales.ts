import { useState, useEffect } from 'react';

interface Scale {
  id: string;
  name: string;
  description: string;
  category: string;
  specialty?: string;
  [key: string]: any;
}

export function useSimpleScales() {
  const [scales, setScales] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScales = async () => {
      try {
        console.log('🔧 useSimpleScales: Starting to load scales...');
        
        const { scalesById } = await import('@/data/_scales');
        console.log('🔧 useSimpleScales: Import successful');
        console.log('🔧 useSimpleScales: scalesById keys:', Object.keys(scalesById));
        
        const scalesArray = Object.values(scalesById);
        console.log('🔧 useSimpleScales: Converted to array, length:', scalesArray.length);
        
        if (scalesArray.length > 0) {
          console.log('🔧 useSimpleScales: First scale:', scalesArray[0]);
          console.log('🔧 useSimpleScales: Last scale:', scalesArray[scalesArray.length - 1]);
        }
        
        setScales(scalesArray);
        setLoading(false);
        
        console.log('🔧 useSimpleScales: Scales loaded successfully, total:', scalesArray.length);
      } catch (err) {
        console.error('🔧 useSimpleScales: Error loading scales:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadScales();
  }, []);

  return {
    scales,
    loading,
    error,
    totalScales: scales.length
  };
}
