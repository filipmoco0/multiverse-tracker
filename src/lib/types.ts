export type Universe = 'mcu' | 'dcu';
export type MediaType = 'movie' | 'show' | 'special';

export interface FranchiseMedia {
  id: string;
  universe: Universe;
  title: string;
  media_type: MediaType;
  release_order: number;
  chronological_order: number | null;
  phase_or_chapter: string;
  trakt_id?: number | null;
  tmdb_id?: number | null;
  poster_path?: string | null;
  is_released: boolean;
  release_date?: string | null;
  overview?: string | null;
  seasons?: number | null;
  episodes?: number | null;
  created_at?: string;
}

export type OrderMode = 'release' | 'chronological';
export type TypeFilter = 'all' | 'movie' | 'show' | 'special';
export type StatusFilter = 'all' | 'watched' | 'unwatched';

export interface TraktUser {
  username: string;
  name?: string;
  avatar?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  client_id?: string;
}

export interface WatchlistState {
  // Mapping of media id (or tmdb/trakt id string) -> boolean (watched)
  watchedIds: Record<string, boolean>;
  // Auth state
  authMode: 'guest' | 'trakt' | 'supabase';
  traktUser: TraktUser | null;
  supabaseUser: { id: string; email: string } | null;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  
  // Actions
  toggleWatched: (mediaId: string, tmdbId?: number | null, traktId?: number | null, mediaType?: MediaType, seasonNumber?: number | number[] | null) => Promise<void>;
  markPhaseWatched: (mediaItems: FranchiseMedia[], watched: boolean) => Promise<void>;
  markAllWatched: (mediaItems: FranchiseMedia[], watched: boolean) => Promise<void>;
  setAuthMode: (mode: 'guest' | 'trakt' | 'supabase') => void;
  setTraktUser: (user: TraktUser | null) => void;
  syncWithTrakt: () => Promise<void>;
  exportWatchlistJson: () => string;
  importWatchlistJson: (jsonString: string) => boolean;
  resetProgress: (universe?: Universe) => void;
}

export interface PhaseStats {
  phase: string;
  total: number;
  watched: number;
  percentage: number;
}
