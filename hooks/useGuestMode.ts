/**
 * Hook de conveniencia para el Modo Invitado.
 * Combina useAuthSession + useGuestStore para exponer
 * permisos derivados de forma sencilla.
 */
import { useAuthSession } from '@/hooks/useAuthSession';
import { useGuestStore } from '@/store/guestStore';

export function useGuestMode() {
  const { session, loading, signOut, isAuthenticated } = useAuthSession();
  const { isGuest, enterGuestMode, exitGuestMode } = useGuestStore();

  return {
    /** True cuando el usuario entró sin cuenta */
    isGuest,
    /** True cuando hay sesión activa de Supabase */
    isAuthenticated,
    /** Verdadero si la sesión aún se está cargando */
    loading,
    /** Sesión de Supabase (null en modo invitado) */
    session,

    // Permisos derivados
    /** Puede acceder al módulo de pacientes */
    canAccessPatients: isAuthenticated && !isGuest,
    /** Puede guardar evaluaciones en BD */
    canSave: isAuthenticated && !isGuest,
    /** Puede ver perfil médico */
    canViewProfile: isAuthenticated && !isGuest,

    // Acciones
    enterGuestMode,
    exitGuestMode,
    signOut,
  };
}
