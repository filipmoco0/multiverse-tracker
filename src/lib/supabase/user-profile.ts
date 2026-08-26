import { createClient } from './client';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useByokStore } from '../store/useByokStore';
import { useSettingsStore, AppSettings } from '../store/useSettingsStore';

export interface UserProfileData {
  watched_ids?: Record<string, boolean>;
  tmdb_api_key?: string | null;
  settings?: Partial<AppSettings>;
}

let syncTimeout: NodeJS.Timeout | null = null;
let pendingWatchedIds: Record<string, boolean> | null = null;
let pendingSettings: Partial<AppSettings> | null = null;
let activeRealtimeChannel: any = null;

export function setActiveRealtimeChannel(channel: any) {
  activeRealtimeChannel = channel;
}

export function broadcastWatchedUpdate(watchedIds: Record<string, boolean>) {
  if (activeRealtimeChannel) {
    try {
      activeRealtimeChannel.send({
        type: 'broadcast',
        event: 'watched_update',
        payload: { watchedIds },
      });
    } catch {}
  }
}

export function broadcastSettingsUpdate(settings: Partial<AppSettings>) {
  if (activeRealtimeChannel) {
    try {
      activeRealtimeChannel.send({
        type: 'broadcast',
        event: 'settings_update',
        payload: { settings },
      });
    } catch {}
  }
}

/**
 * Saves or updates user profile in Supabase table `user_profiles` with debouncing.
 */
export async function syncUserProfileToCloud(data: Partial<UserProfileData> = {}) {
  if (data.watched_ids !== undefined) {
    // Sanitize to only keys with truthy values
    const clean: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(data.watched_ids)) {
      if (v && k !== '__settings__') clean[k] = true;
    }
    pendingWatchedIds = clean;
    // Broadcast immediately over websocket to all connected devices in real time
    broadcastWatchedUpdate(clean);
  }

  if (data.settings !== undefined) {
    pendingSettings = data.settings;
    broadcastSettingsUpdate(data.settings);
  }

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const currentWatched =
        pendingWatchedIds !== null
          ? pendingWatchedIds
          : useWatchlistStore.getState().watchedIds;
      const currentByok = useByokStore.getState();
      const currentSettings =
        pendingSettings !== null
          ? pendingSettings
          : useSettingsStore.getState();

      const sanitizedWatched: Record<string, any> = {};
      for (const [k, v] of Object.entries(currentWatched)) {
        if (v && k !== '__settings__') sanitizedWatched[k] = true;
      }
      sanitizedWatched['__settings__'] = {
        showMarathonStats: currentSettings.showMarathonStats,
        showTrailersAndStreaming: currentSettings.showTrailersAndStreaming,
        enableConfetti: currentSettings.enableConfetti,
        greyscaleUnwatched: currentSettings.greyscaleUnwatched,
        hideOneShots: currentSettings.hideOneShots,
        hideSpecials: currentSettings.hideSpecials,
      };

      const payload: any = {
        id: user.id,
        email: user.email,
        watched_ids: sanitizedWatched,
        tmdb_api_key:
          data.tmdb_api_key !== undefined
            ? data.tmdb_api_key
            : (currentByok.tmdbApiKey || null),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Cloud sync user profile warning:', error.message);
      }
    } catch (err) {
      console.warn('Cloud sync error:', err);
    } finally {
      pendingWatchedIds = null;
      pendingSettings = null;
    }
  }, 250);
}

/**
 * Loads user profile from Supabase and hydrates stores on login.
 */
export async function loadUserProfileFromCloud(userId: string) {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Load user profile warning:', error.message);
      return null;
    }

    if (data) {
      // 1. Hydrate Watched IDs and App Settings from authoritative cloud profile
      if (data.watched_ids && typeof data.watched_ids === 'object') {
        const cleanWatched: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(data.watched_ids)) {
          if (k === '__settings__' && typeof v === 'object' && v !== null) {
            useSettingsStore.setState(v as any);
          } else if (v) {
            cleanWatched[k] = true;
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('multiverse_tracker_watched_v1', JSON.stringify(cleanWatched));
        }
        useWatchlistStore.setState({ watchedIds: cleanWatched, lastSyncedAt: Date.now() });
      }

      // 2. Hydrate TMDB BYOK Key
      if (data.tmdb_api_key) {
        useByokStore.getState().setTmdbApiKey(data.tmdb_api_key);
      }

      return data;
    } else {
      // If profile does not exist yet, initialize it with current state
      await syncUserProfileToCloud();
    }
  } catch (err) {
    console.warn('Load user profile fatal error:', err);
  }
  return null;
}
