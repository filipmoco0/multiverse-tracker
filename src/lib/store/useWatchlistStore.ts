import { create } from 'zustand';
import { WatchlistState, TraktUser, FranchiseMedia, MediaType, Universe } from '../types';
import { syncTraktHistory, fetchTraktWatchedItems } from '../trakt/client';
import { syncUserProfileToCloud } from '../supabase/user-profile';

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
    syncUserProfileToCloud({ trakt_username: user?.username || null, trakt_token: user?.access_token || null });
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

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });

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

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });

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

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });

    if (authMode === 'trakt' && traktUser?.access_token && !traktUser.access_token.startsWith('token_user_')) {
      for (const item of mediaItems) {
        try {
          await syncTraktHistory(
            traktUser.access_token,
            targetWatched ? 'add' : 'remove',
            { tmdbId: item.tmdb_id, traktId: item.trakt_id, mediaType: item.media_type }
          );
        } catch (e) {
          console.warn('Error syncing all items:', e);
        }
      }
    }
  },

  syncWithTrakt: async () => {
    const { traktUser } = get();
    if (!traktUser) return;

    set({ isSyncing: true });

    try {
      // 1. If OAuth token exists, fetch watched items
      if (traktUser.access_token && !traktUser.access_token.startsWith('token_user_')) {
        const { movies, shows } = await fetchTraktWatchedItems(traktUser.access_token);
        const { watchedIds } = get();
        const mergedWatched = { ...watchedIds };

        // Auto-match tmdb ids from trakt response
        movies.forEach((m: any) => {
          if (m.movie?.ids?.tmdb) mergedWatched[`mcu-tmdb-${m.movie.ids.tmdb}`] = true;
        });
        shows.forEach((s: any) => {
          if (s.show?.ids?.tmdb) mergedWatched[`mcu-tmdb-${s.show.ids.tmdb}`] = true;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(mergedWatched));
        }

        set({
          watchedIds: mergedWatched,
          lastSyncedAt: Date.now(),
        });
        syncUserProfileToCloud({ watched_ids: mergedWatched });
      } else {
        // Instant username connection
        set({ lastSyncedAt: Date.now() });
      }
    } catch (error) {
      console.error('Trakt synchronization failed:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  exportWatchlistJson: () => {
    const { watchedIds, traktUser, lastSyncedAt } = get();
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      watchedCount: Object.keys(watchedIds).length,
      watchedIds,
      traktUser: traktUser ? { username: traktUser.username } : null,
      lastSyncedAt,
    };
    return JSON.stringify(backupData, null, 2);
  },

  importWatchlistJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.watchedIds === 'object') {
        if (typeof window !== 'undefined') {
          localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(parsed.watchedIds));
        }
        set({
          watchedIds: parsed.watchedIds,
          lastSyncedAt: Date.now(),
        });
        syncUserProfileToCloud({ watched_ids: parsed.watchedIds });
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
    let updatedWatched: Record<string, boolean> = {};

    if (universe) {
      // Clear only specific universe prefix
      Object.keys(watchedIds).forEach((id) => {
        if (!id.startsWith(universe)) {
          updatedWatched[id] = watchedIds[id];
        }
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
    }
    set({ watchedIds: updatedWatched });
    syncUserProfileToCloud({ watched_ids: updatedWatched });
  },
}));
