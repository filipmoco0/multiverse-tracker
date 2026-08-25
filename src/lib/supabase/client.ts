import { createBrowserClient } from '@supabase/ssr';
import { FranchiseMedia } from '../types';
import { MCU_SEED_DATA } from '../seed/mcu-seed';
import { DCU_SEED_DATA } from '../seed/dcu-seed';

const DEFAULT_SUPABASE_URL = 'https://zpdhjktfkojgqqacfuta.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGhqa3Rma29qZ3FxYWNmdXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzY5MzksImV4cCI6MjEwMzE1MjkzOX0.adY7bNE5owZzO2nvuYcnKO3YDm506STURoGJHdI2nWA';

export const isSupabaseConfigured = true;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}

/**
 * Fetch media tracklist for a given universe from Supabase with fallback to curated seed dataset.
 */
export async function getFranchiseMedia(universe: 'mcu' | 'dcu'): Promise<FranchiseMedia[]> {
  const seed = universe === 'mcu' ? MCU_SEED_DATA : DCU_SEED_DATA;

  try {
    const supabase = createClient();
    if (!supabase) return seed;

    const { data, error } = await supabase
      .from('franchise_media')
      .select('*')
      .eq('universe', universe)
      .order('release_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return seed;
    }

    // Merge Supabase entries while guaranteeing master canonical chronological order from seed
    return seed.map((seedItem) => {
      const dbItem = data.find((d: any) => d.id === seedItem.id);
      if (!dbItem) return seedItem;
      return {
        ...seedItem,
        poster_path: dbItem.poster_path || seedItem.poster_path,
        is_released: dbItem.is_released !== undefined ? dbItem.is_released : seedItem.is_released,
        chronological_order: seedItem.chronological_order,
      };
    });
  } catch (err) {
    return seed;
  }
}
