import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favorites: string[];
  addFavorite: (scaleId: string) => void;
  removeFavorite: (scaleId: string) => void;
  toggleFavorite: (scaleId: string) => void;
  isFavorite: (scaleId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (scaleId: string) => {
        const { favorites } = get();
        if (!favorites.includes(scaleId)) {
          set({ favorites: [...favorites, scaleId] });
        }
      },

      removeFavorite: (scaleId: string) => {
        const { favorites } = get();
        set({ favorites: favorites.filter(id => id !== scaleId) });
      },

      toggleFavorite: (scaleId: string) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(scaleId)) {
          removeFavorite(scaleId);
        } else {
          addFavorite(scaleId);
        }
      },

      isFavorite: (scaleId: string) => {
        const { favorites } = get();
        return favorites.includes(scaleId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
