import { useQuery } from '@tanstack/react-query';
import { getScaleById } from '@/api/scales';
import { Scale } from '@/types/scale';

export const useScaleDetails = (id: string) => {
  return useQuery<Scale, Error>({
    queryKey: ['scale', id],
    queryFn: async () => {
      // Since our static data is not in a real API, we'll simulate an async fetch.
      // In a real app, getScaleById would perform a network request.
      const { scalesById } = await import('@/data/_scales');
      
      const scale = scalesById[id];

      if (scale) {
        return Promise.resolve(scale);
      } else {
        return Promise.reject(new Error('Scale not found'));
      }
    },
    enabled: !!id, // The query will not run until the id is available
  });
};
