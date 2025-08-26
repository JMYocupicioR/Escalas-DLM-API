import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { scales as initialScales, scalesById as initialScalesById } from '@/data/_scales';
import type { Scale } from '@/types/scale';

interface ScalesState {
  scales: Scale[];
  scalesById: Record<string, Scale>;
  recentlyCreated: string[];
  
  // Actions
  addScale: (scale: Scale) => void;
  updateScale: (id: string, updates: Partial<Scale>) => void;
  removeScale: (id: string) => void;
  getScaleById: (id: string) => Scale | undefined;
  searchScales: (query: string) => Scale[];
  getScalesByCategory: (category: string) => Scale[];
  getScalesBySpecialty: (specialty: string) => Scale[];
  addToRecentlyCreated: (id: string) => void;
  refreshScales: () => void;
  
  // Computed getters
  getAllCategories: () => string[];
  getAllSpecialties: () => string[];
  getPopularScales: () => Scale[];
  getTotalScalesCount: () => number;
}

export const useScalesStore = create<ScalesState>()(
  persist(
    (set, get) => ({
      scales: initialScales,
      scalesById: initialScalesById,
      recentlyCreated: [],

      addScale: (scale: Scale) => {
        set((state) => {
          const newScales = [...state.scales, scale];
          const newScalesById = { ...state.scalesById, [scale.id]: scale };
          
          return {
            scales: newScales,
            scalesById: newScalesById,
            recentlyCreated: [scale.id, ...state.recentlyCreated.slice(0, 9)], // Keep last 10
          };
        });
      },

      updateScale: (id: string, updates: Partial<Scale>) => {
        set((state) => {
          const existingScale = state.scalesById[id];
          if (!existingScale) return state;

          const updatedScale = { ...existingScale, ...updates };
          const newScales = state.scales.map(scale => 
            scale.id === id ? updatedScale : scale
          );
          const newScalesById = { ...state.scalesById, [id]: updatedScale };

          return {
            scales: newScales,
            scalesById: newScalesById,
          };
        });
      },

      removeScale: (id: string) => {
        set((state) => {
          const newScales = state.scales.filter(scale => scale.id !== id);
          const newScalesById = { ...state.scalesById };
          delete newScalesById[id];

          return {
            scales: newScales,
            scalesById: newScalesById,
            recentlyCreated: state.recentlyCreated.filter(scaleId => scaleId !== id),
          };
        });
      },

      getScaleById: (id: string) => {
        return get().scalesById[id];
      },

      searchScales: (query: string) => {
        const { scales } = get();
        if (!query.trim()) return scales;

        const searchTerm = query.toLowerCase();
        return scales.filter(scale => 
          scale.name.toLowerCase().includes(searchTerm) ||
          scale.description.toLowerCase().includes(searchTerm) ||
          scale.category.toLowerCase().includes(searchTerm) ||
          (scale.specialty && scale.specialty.toLowerCase().includes(searchTerm)) ||
          (scale.tags && scale.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      },

      getScalesByCategory: (category: string) => {
        const { scales } = get();
        return scales.filter(scale => 
          scale.category.toLowerCase() === category.toLowerCase()
        );
      },

      getScalesBySpecialty: (specialty: string) => {
        const { scales } = get();
        return scales.filter(scale => 
          scale.specialty && scale.specialty.toLowerCase() === specialty.toLowerCase()
        );
      },

      addToRecentlyCreated: (id: string) => {
        set((state) => ({
          recentlyCreated: [id, ...state.recentlyCreated.filter(scaleId => scaleId !== id).slice(0, 9)],
        }));
      },

      refreshScales: () => {
        // Force re-read from initial data if needed
        set({
          scales: [...initialScales],
          scalesById: { ...initialScalesById },
        });
      },

      // Computed getters
      getAllCategories: () => {
        const { scales } = get();
        const categories = [...new Set(scales.map(scale => scale.category))];
        return categories.sort();
      },

      getAllSpecialties: () => {
        const { scales } = get();
        const specialties = [...new Set(
          scales
            .map(scale => scale.specialty)
            .filter(Boolean) as string[]
        )];
        return specialties.sort();
      },

      getPopularScales: () => {
        const { scales } = get();
        return scales
          .filter(scale => scale.popular)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 10);
      },

      getTotalScalesCount: () => {
        return get().scales.length;
      },
    }),
    {
      name: 'scales-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          try {
            return localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            localStorage.setItem(name, value);
          } catch {
            // Silent fail
          }
        },
        removeItem: (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Silent fail
          }
        },
      })),
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version < 1) {
          // Migration logic for version upgrades
          return {
            ...persistedState,
            recentlyCreated: persistedState.recentlyCreated || [],
          };
        }
        return persistedState;
      },
    }
  )
);

// Selector hooks for optimized re-renders
export const useScalesCount = () => useScalesStore((state) => state.getTotalScalesCount());
export const useAllCategories = () => useScalesStore((state) => state.getAllCategories());
export const useAllSpecialties = () => useScalesStore((state) => state.getAllSpecialties());
export const usePopularScales = () => useScalesStore((state) => state.getPopularScales());
export const useRecentlyCreatedScales = () => useScalesStore((state) => 
  state.recentlyCreated.map(id => state.scalesById[id]).filter(Boolean)
);

// Action hooks
export const useScaleActions = () => useScalesStore((state) => ({
  addScale: state.addScale,
  updateScale: state.updateScale,
  removeScale: state.removeScale,
  refreshScales: state.refreshScales,
  addToRecentlyCreated: state.addToRecentlyCreated,
}));

// Search hooks
export const useScaleSearch = () => useScalesStore((state) => ({
  searchScales: state.searchScales,
  getScalesByCategory: state.getScalesByCategory,
  getScalesBySpecialty: state.getScalesBySpecialty,
  getScaleById: state.getScaleById,
}));