import { createBrowserClient } from '@supabase/ssr';
import { FranchiseMedia } from '../types';
import { MCU_SEED_DATA } from '../seed/mcu-seed';
import { DCU_SEED_DATA } from '../seed/dcu-seed';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Fetch media tracklist for a given universe from Supabase with fallback to curated seed dataset.
 */
export async function getFranchiseMedia(universe: 'mcu' | 'dcu'): Promise<FranchiseMedia[]> {
  const seed = universe === 'mcu' ? MCU_SEED_DATA : DCU_SEED_DATA;
  
  if (!isSupabaseConfigured) {
    return seed;
  }

  try {
    const supabase = createClient();
    if (!supabase) return seed;

    const { data, error } = await supabase
      .from('franchise_media')
      .select('*')
      .eq('universe', universe)
      .order('release_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Using curated seed fallback for', universe, error?.message);
      return seed;
    }

    return data as FranchiseMedia[];
  } catch (err) {
    console.warn('Supabase fetch error, using seed data:', err);
    return seed;
  }
}
