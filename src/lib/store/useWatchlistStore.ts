import { create } from 'zustand';
import { WatchlistState, TraktUser, FranchiseMedia, MediaType, Universe } from '../types';
import { syncTraktHistory, fetchTraktWatchedItems } from '../trakt/client';

const WATCHED_STORAGE_KEY = 'multiverse_tracker_watched_v1';
const TRAKT_USER_KEY = 'multiverse_tracker_trakt_user_v1';
const AUTH_MODE_KEY = 'multiverse_tracker_auth_mode_v1';

const getStoredWatched = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(WATCHED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getStoredTraktUser = (): TraktUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TRAKT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredAuthMode = (): 'guest' | 'trakt' | 'supabase' => {
  if (typeof window === 'undefined') return 'guest';
  try {
    const raw = localStorage.getItem(AUTH_MODE_KEY);
    if (raw === 'trakt' || raw === 'supabase' || raw === 'guest') return raw;
    return 'guest';
  } catch {
    return 'guest';
  }
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchedIds: getStoredWatched(),
  authMode: getStoredAuthMode(),
  traktUser: getStoredTraktUser(),
  supabaseUser: null,
  isSyncing: false,
  lastSyncedAt: null,

  setAuthMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_MODE_KEY, mode);
    }
    set({ authMode: mode });
  },

  setTraktUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(TRAKT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_MODE_KEY, 'trakt');
      } else {
        localStorage.removeItem(TRAKT_USER_KEY);
      }
    }
    set({ traktUser: user, authMode: user ? 'trakt' : 'guest' });
  },

  toggleWatched: async (mediaId, tmdbId, traktId, mediaType = 'movie') => {
    const { watchedIds, traktUser, authMode } = get();
    const isCurrentlyWatched = Boolean(watchedIds[mediaId]);
    const nextState = !isCurrentlyWatched;

    // Optimistic local update
    const updatedWatched = { ...watchedIds, [mediaId]: nextState };
    if (!nextState) {
      delete updatedWatched[mediaId];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
    }
    set({ watchedIds: updatedWatched });

    // Sync with Trakt if authenticated with a real token
    if (authMode === 'trakt' && traktUser?.access_token && !traktUser.access_token.startsWith('token_user_')) {
      try {
        await syncTraktHistory(
          traktUser.access_token,
          nextState ? 'add' : 'remove',
          { tmdbId, traktId, mediaType }
        );
      } catch (err) {
        console.error('Failed to sync toggle with Trakt:', err);
      }
    }
  },

  markPhaseWatched: async (mediaItems: FranchiseMedia[], targetWatched: boolean) => {
    const { watchedIds, traktUser, authMode } = get();
    const updatedWatched = { ...watchedIds };

    for (const item of mediaItems) {
      if (targetWatched) {
        updatedWatched[item.id] = true;
      } else {
        delete updatedWatched[item.id];
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
    }
    set({ watchedIds: updatedWatched });

    // Sync to Trakt if connected with real OAuth token
    if (authMode === 'trakt' && traktUser?.access_token && !traktUser.access_token.startsWith('token_user_')) {
      for (const item of mediaItems) {
        try {
          await syncTraktHistory(
            traktUser.access_token,
            targetWatched ? 'add' : 'remove',
            { tmdbId: item.tmdb_id, traktId: item.trakt_id, mediaType: item.media_type }
          );
        } catch (e) {
          console.warn('Error syncing item in phase:', e);
        }
      }
    }
  },

  markAllWatched: async (mediaItems: FranchiseMedia[], targetWatched: boolean) => {
    const { watchedIds } = get();
    const updatedWatched = targetWatched
      ? { ...watchedIds, ...Object.fromEntries(mediaItems.map((m) => [m.id, true])) }
      : { ...watchedIds };

    if (!targetWatched) {
      mediaItems.forEach((m) => {
        delete updatedWatched[m.id];
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
    }
    set({ watchedIds: updatedWatched });
  },

  syncWithTrakt: async () => {
    const { traktUser } = get();
    if (!traktUser) return;

    set({ isSyncing: true });
    try {
      let movies: any[] = [];
      let shows: any[] = [];

      if (traktUser.access_token && !traktUser.access_token.startsWith('token_user_')) {
        // Authenticated OAuth sync
        const res = await fetchTraktWatchedItems(traktUser.access_token);
        movies = res.movies;
        shows = res.shows;
      } else if (traktUser.username) {
        // Public username fetch
        const res = await fetch(`/api/trakt/sync?username=${encodeURIComponent(traktUser.username)}`);
        if (res.ok) {
          const data = await res.json();
          movies = data.movies || [];
          shows = data.shows || [];
        }
      }

      const { watchedIds } = get();
      const newWatched = { ...watchedIds };

      // Map trakt IDs and TMDB IDs from movies
      const traktMovieIds = new Set(movies.map((m: any) => m.movie?.ids?.trakt).filter(Boolean));
      const tmdbMovieIds = new Set(movies.map((m: any) => m.movie?.ids?.tmdb).filter(Boolean));

      // Map trakt IDs and TMDB IDs from shows
      const traktShowIds = new Set(shows.map((s: any) => s.show?.ids?.trakt).filter(Boolean));
      const tmdbShowIds = new Set(shows.map((s: any) => s.show?.ids?.tmdb).filter(Boolean));

      const { MCU_SEED_DATA } = await import('../seed/mcu-seed');
      const { DCU_SEED_DATA } = await import('../seed/dcu-seed');
      const allMedia = [...MCU_SEED_DATA, ...DCU_SEED_DATA];

      allMedia.forEach((media) => {
        const isWatchedInTrakt =
          (media.trakt_id && (traktMovieIds.has(media.trakt_id) || traktShowIds.has(media.trakt_id))) ||
          (media.tmdb_id && (tmdbMovieIds.has(media.tmdb_id) || tmdbShowIds.has(media.tmdb_id)));

        if (isWatchedInTrakt) {
          newWatched[media.id] = true;
        }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(newWatched));
      }

      set({ watchedIds: newWatched, lastSyncedAt: Date.now() });
    } catch (err) {
      console.error('Trakt synchronization error:', err);
    } finally {
      set({ isSyncing: false });
    }
  },

  exportWatchlistJson: () => {
    const { watchedIds, authMode } = get();
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      authMode,
      watchedIds,
    }, null, 2);
  },

  importWatchlistJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.watchedIds === 'object') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(parsed.watchedIds));
        }
        set({ watchedIds: parsed.watchedIds });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import watchlist JSON:', e);
      return false;
    }
  },

  resetProgress: (universe?: Universe) => {
    const { watchedIds } = get();
    if (!universe) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(WATCHED_STORAGE_KEY);
      }
      set({ watchedIds: {} });
    } else {
      const updatedWatched = { ...watchedIds };
      Object.keys(updatedWatched).forEach((key) => {
        if (key.startsWith(universe)) {
          delete updatedWatched[key];
        }
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
      }
      set({ watchedIds: updatedWatched });
    }
  },
}));
