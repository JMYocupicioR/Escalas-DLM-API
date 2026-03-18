/**
 * Hook para estado de autenticación con Supabase.
 * Expone sesión, carga y método de cerrar sesión.
 */
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/api/config/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (!cancelled) {
          setSession(s);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Auth getSession error:', err);
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSession(session);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setLoading(false);
  };

  return { session, loading, signOut, isAuthenticated: !!session?.user };
}
