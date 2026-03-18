/**
 * Store para el Modo Invitado.
 * Permite a los usuarios usar la app sin autenticarse,
 * con funcionalidad limitada (sin acceso a pacientes ni guardado).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GuestState {
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      isGuest: false,
      enterGuestMode: () => set({ isGuest: true }),
      exitGuestMode: () => set({ isGuest: false }),
    }),
    {
      name: '@guest_mode',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
