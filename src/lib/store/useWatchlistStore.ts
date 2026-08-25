import { create } from 'zustand';
import { WatchlistState, TraktUser, FranchiseMedia, MediaType, Universe } from '../types';
import { syncTraktHistory, fetchTraktWatchedItems } from '../trakt/client';
import { syncUserProfileToCloud } from '../supabase/user-profile';
import { MCU_SEED_DATA } from '../seed/mcu-seed';
import { DCU_SEED_DATA } from '../seed/dcu-seed';
import { extractSeasonRange } from '../utils/season';

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

  toggleWatched: async (mediaId, tmdbId, traktId, mediaType = 'movie', seasonNumber) => {
    const { watchedIds, traktUser, authMode } = get();
    const isCurrentlyWatched = Boolean(watchedIds[mediaId]);
    const nextState = !isCurrentlyWatched;

    // Optimistic local update for this specific media item
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
        let effectiveSeasons = seasonNumber;
        if (effectiveSeasons === undefined && mediaType === 'show') {
          const allMedia = [...MCU_SEED_DATA, ...DCU_SEED_DATA];
          const target = allMedia.find((m) => m.id === mediaId);
          if (target) {
            const parsed = extractSeasonRange(target.title);
            if (parsed.length > 0) effectiveSeasons = parsed;
          }
        }

        await syncTraktHistory(
          traktUser.access_token,
          nextState ? 'add' : 'remove',
          { tmdbId, traktId, mediaType, seasonNumber: effectiveSeasons }
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
          const parsed = item.media_type === 'show' ? extractSeasonRange(item.title) : [];
          await syncTraktHistory(
            traktUser.access_token,
            targetWatched ? 'add' : 'remove',
            {
              tmdbId: item.tmdb_id,
              traktId: item.trakt_id,
              mediaType: item.media_type,
              seasonNumber: parsed.length > 0 ? parsed : undefined,
            }
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
          const parsed = item.media_type === 'show' ? extractSeasonRange(item.title) : [];
          await syncTraktHistory(
            traktUser.access_token,
            targetWatched ? 'add' : 'remove',
            {
              tmdbId: item.tmdb_id,
              traktId: item.trakt_id,
              mediaType: item.media_type,
              seasonNumber: parsed.length > 0 ? parsed : undefined,
            }
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
      const { movies, shows } = await fetchTraktWatchedItems(traktUser.access_token, traktUser.username);
      const { watchedIds } = get();
      const mergedWatched = { ...watchedIds };

      // Build complete media lookup indexes
      const allMedia = [...MCU_SEED_DATA, ...DCU_SEED_DATA];
      const tmdbMap = new Map<number, string[]>();
      const traktMap = new Map<number, string[]>();
      const titleMap = new Map<string, string[]>();

      allMedia.forEach((item) => {
        if (item.media_type === 'movie' || item.media_type === 'special') {
          if (item.tmdb_id) {
            const arr = tmdbMap.get(item.tmdb_id) || [];
            arr.push(item.id);
            tmdbMap.set(item.tmdb_id, arr);
          }
          if (item.trakt_id) {
            const arr = traktMap.get(item.trakt_id) || [];
            arr.push(item.id);
            traktMap.set(item.trakt_id, arr);
          }
          const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const arr = titleMap.get(cleanTitle) || [];
          arr.push(item.id);
          titleMap.set(cleanTitle, arr);
        }
      });

      // Match Watched Movies
      (movies || []).forEach((m: any) => {
        const movie = m.movie || m;
        const tmdbId = movie.ids?.tmdb ? Number(movie.ids.tmdb) : null;
        const traktId = movie.ids?.trakt ? Number(movie.ids.trakt) : null;
        const cleanTitle = movie.title ? String(movie.title).toLowerCase().replace(/[^a-z0-9]/g, '') : '';

        if (tmdbId && tmdbMap.has(tmdbId)) {
          tmdbMap.get(tmdbId)?.forEach((id) => { mergedWatched[id] = true; });
        }
        if (traktId && traktMap.has(traktId)) {
          traktMap.get(traktId)?.forEach((id) => { mergedWatched[id] = true; });
        }
        if (cleanTitle && titleMap.has(cleanTitle)) {
          titleMap.get(cleanTitle)?.forEach((id) => { mergedWatched[id] = true; });
        }
      });

      // Match Watched Shows with per-season precision
      (shows || []).forEach((s: any) => {
        const show = s.show || s;
        const tmdbId = show.ids?.tmdb ? Number(show.ids.tmdb) : null;
        const traktId = show.ids?.trakt ? Number(show.ids.trakt) : null;
        const cleanTitle = show.title ? String(show.title).toLowerCase().replace(/[^a-z0-9]/g, '') : '';

        // Extract seasons watched for this show from Trakt
        const watchedSeasonSet = new Set<number>();
        if (Array.isArray(s.seasons)) {
          s.seasons.forEach((seasonObj: any) => {
            if (typeof seasonObj.number === 'number') {
              if (
                (seasonObj.episodes && seasonObj.episodes.length > 0) ||
                seasonObj.completed ||
                (seasonObj.plays && seasonObj.plays > 0)
              ) {
                watchedSeasonSet.add(seasonObj.number);
              } else {
                watchedSeasonSet.add(seasonObj.number);
              }
            }
          });
        }

        // Find candidate items in allMedia
        const candidateItems = allMedia.filter((item) => {
          if (item.media_type !== 'show') return false;
          if (tmdbId && item.tmdb_id === tmdbId) return true;
          if (traktId && item.trakt_id === traktId) return true;
          const itemClean = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanTitle && (itemClean.includes(cleanTitle) || cleanTitle.includes(itemClean))) return true;
          return false;
        });

        candidateItems.forEach((item) => {
          const itemSeasons = extractSeasonRange(item.title);
          if (itemSeasons.length > 0) {
            // Only mark watched if at least one of this item's specific seasons was watched on Trakt
            const isMatch = itemSeasons.some((sn) => watchedSeasonSet.has(sn));
            if (isMatch) {
              mergedWatched[item.id] = true;
            }
          } else {
            // Limited series or show without explicit "Season X" in title
            if (watchedSeasonSet.size > 0 || (s.plays && s.plays > 0)) {
              mergedWatched[item.id] = true;
            }
          }
        });
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(mergedWatched));
      }

      set({
        watchedIds: mergedWatched,
        lastSyncedAt: Date.now(),
      });
      syncUserProfileToCloud({ watched_ids: mergedWatched });
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
