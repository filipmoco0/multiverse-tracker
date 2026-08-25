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

    return data.map((d: any) => ({
      id: String(d.id),
      universe: d.universe,
      title: d.title,
      media_type: d.media_type,
      release_order: Number(d.release_order) || 1,
      chronological_order:
        d.chronological_order !== null && d.chronological_order !== undefined && d.chronological_order !== ''
          ? Number(d.chronological_order)
          : null,
      phase_or_chapter: d.phase_or_chapter || (universe === 'mcu' ? 'Phase 1' : 'Chapter 1'),
      trakt_id: d.trakt_id ? Number(d.trakt_id) : null,
      tmdb_id: d.tmdb_id ? Number(d.tmdb_id) : null,
      poster_path: d.poster_path || null,
      is_released: Boolean(d.is_released),
      release_date: d.release_date || null,
      overview: d.overview || null,
      seasons: d.seasons ? Number(d.seasons) : undefined,
      episodes: d.episodes ? Number(d.episodes) : undefined,
    }));
  } catch (err) {
    return seed;
  }
}
