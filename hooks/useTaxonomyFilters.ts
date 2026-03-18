/**
 * @file hooks/useTaxonomyFilters.ts
 * @description Hook para cargar y cachear las dimensiones de taxonomía médica desde Supabase.
 * Proporciona datos para filtros en la pantalla de búsqueda de escalas.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/api/config/supabase';

export interface TaxonomyItem {
  id: string;
  name_es: string;
  name_en: string;
  description?: string;
  display_order?: number;
}

export interface TaxonomyFilterState {
  categoryId: string | null;
  specialtyId: string | null;
  scaleTypeId: string | null;
  populationId: string | null;
  bodySystemId: string | null;
}

export interface TaxonomyData {
  categories: TaxonomyItem[];
  specialties: TaxonomyItem[];
  scaleTypes: TaxonomyItem[];
  populations: TaxonomyItem[];
  bodySystems: TaxonomyItem[];
  loading: boolean;
  error: string | null;
}

// ── Module-level cache to avoid re-fetching on every mount ──────────────────
let _cached: Omit<TaxonomyData, 'loading' | 'error'> | null = null;
let _fetchPromise: Promise<void> | null = null;

function emptyData(): Omit<TaxonomyData, 'loading' | 'error'> {
  return {
    categories: [],
    specialties: [],
    scaleTypes: [],
    populations: [],
    bodySystems: [],
  };
}

export function useTaxonomyFilters(): TaxonomyData {
  const [state, setState] = useState<TaxonomyData>({
    ...(_cached ?? emptyData()),
    loading: !_cached,
    error: null,
  });

  useEffect(() => {
    // Already cached → nothing to do
    if (_cached) {
      setState({ ..._cached, loading: false, error: null });
      return;
    }

    // Reuse an in-flight request if one exists
    if (!_fetchPromise) {
      _fetchPromise = Promise.all([
        supabase
          .from('medical_categories')
          .select('id, name_es, name_en, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('medical_specialties')
          .select('id, name_es, name_en, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('scale_types')
          .select('id, name_es, name_en, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('target_populations')
          .select('id, name_es, name_en, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('body_systems')
          .select('id, name_es, name_en, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]).then(([cats, specs, types, pops, sys]) => {
        _cached = {
          categories: (cats.data ?? []) as TaxonomyItem[],
          specialties: (specs.data ?? []) as TaxonomyItem[],
          scaleTypes: (types.data ?? []) as TaxonomyItem[],
          populations: (pops.data ?? []) as TaxonomyItem[],
          bodySystems: (sys.data ?? []) as TaxonomyItem[],
        };
      }).catch((err) => {
        console.error('[useTaxonomyFilters] Error loading taxonomy:', err);
        // Don't cache on error so we can retry later
        _fetchPromise = null;
        throw err;
      });
    }

    _fetchPromise
      .then(() => {
        setState({ ...(_cached ?? emptyData()), loading: false, error: null });
      })
      .catch((err) => {
        setState({
          ...emptyData(),
          loading: false,
          error: 'No se pudieron cargar los filtros de taxonomía.',
        });
      });
  }, []);

  return state;
}

/** Reset the taxonomy cache (useful for dev / testing). */
export function clearTaxonomyCache() {
  _cached = null;
  _fetchPromise = null;
}
