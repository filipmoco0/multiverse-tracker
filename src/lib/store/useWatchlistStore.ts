import { create } from 'zustand';
import { WatchlistState, FranchiseMedia, MediaType, Universe } from '../types';
import { syncUserProfileToCloud } from '../supabase/user-profile';

const WATCHED_STORAGE_KEY = 'multiverse_tracker_watched_v1';
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

const getStoredAuthMode = (): 'guest' | 'supabase' => {
  if (typeof window === 'undefined') return 'guest';
  try {
    const raw = localStorage.getItem(AUTH_MODE_KEY);
    if (raw === 'supabase' || raw === 'guest') return raw;
    return 'guest';
  } catch {
    return 'guest';
  }
};

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchedIds: getStoredWatched(),
  authMode: getStoredAuthMode(),
  supabaseUser: null,
  lastSyncedAt: null,

  setAuthMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_MODE_KEY, mode);
    }
    set({ authMode: mode });
  },

  toggleWatched: async (mediaId, _tmdbId, _traktId, _mediaType = 'movie', _seasonNumber) => {
    const { watchedIds } = get();
    const isCurrentlyWatched = Boolean(watchedIds[mediaId]);
    const nextState = !isCurrentlyWatched;

    // Optimistic local update for this specific media item
    const updatedWatched = { ...watchedIds };
    if (nextState) {
      updatedWatched[mediaId] = true;
    } else {
      delete updatedWatched[mediaId];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(updatedWatched));
    }
    set({ watchedIds: updatedWatched, lastSyncedAt: Date.now() });

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });
  },

  markPhaseWatched: async (mediaItems: FranchiseMedia[], targetWatched: boolean) => {
    const { watchedIds } = get();
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
    set({ watchedIds: updatedWatched, lastSyncedAt: Date.now() });

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });
  },

  markAllWatched: async (mediaItems: FranchiseMedia[], targetWatched: boolean) => {
    const { watchedIds } = get();
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
    set({ watchedIds: updatedWatched, lastSyncedAt: Date.now() });

    // Cloud sync to Supabase user profile
    syncUserProfileToCloud({ watched_ids: updatedWatched });
  },

  exportWatchlistJson: () => {
    const { watchedIds, lastSyncedAt } = get();
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      watchedCount: Object.keys(watchedIds).length,
      watchedIds,
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
    set({ watchedIds: updatedWatched, lastSyncedAt: Date.now() });
    syncUserProfileToCloud({ watched_ids: updatedWatched });
  },
}));
