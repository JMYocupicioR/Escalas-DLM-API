import { QueryClient } from '@tanstack/react-query';

// Configuración por defecto para React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Claves de caché predefinidas para consultas
export const queryKeys = {
  scales: {
    all: ['scales'],
    single: (id: string) => ['scales', id],
    byCategory: (category: string) => ['scales', 'category', category],
    bySpecialty: (specialty: string) => ['scales', 'specialty', specialty],
    recent: ['scales', 'recent'],
    popular: ['scales', 'popular'],
  },
  assessments: {
    all: ['assessments'],
    byPatient: (patientId: string) => ['assessments', 'patient', patientId],
    byScale: (scaleId: string) => ['assessments', 'scale', scaleId],
  },
  user: {
    preferences: ['user', 'preferences'],
    favorites: ['user', 'favorites'],
  },
};