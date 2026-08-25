import { createClient } from './client';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useByokStore } from '../store/useByokStore';

export interface UserProfileData {
  watched_ids?: Record<string, boolean>;
  trakt_username?: string | null;
  trakt_token?: string | null;
  tmdb_api_key?: string | null;
  trakt_client_id?: string | null;
  trakt_client_secret?: string | null;
}

/**
 * Saves or updates user profile in Supabase table `user_profiles`.
 */
export async function syncUserProfileToCloud(data: Partial<UserProfileData> = {}) {
  try {
    const supabase = createClient();
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const currentWatched = useWatchlistStore.getState().watchedIds;
    const currentTrakt = useWatchlistStore.getState().traktUser;
    const currentByok = useByokStore.getState();

    const payload: any = {
      id: user.id,
      email: user.email,
      watched_ids: data.watched_ids !== undefined ? data.watched_ids : currentWatched,
      trakt_username: data.trakt_username !== undefined ? data.trakt_username : (currentTrakt?.username || null),
      trakt_token: data.trakt_token !== undefined ? data.trakt_token : (currentTrakt?.access_token || null),
      tmdb_api_key: data.tmdb_api_key !== undefined ? data.tmdb_api_key : (currentByok.tmdbApiKey || null),
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
  }
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
      // 1. Hydrate Watched IDs
      if (data.watched_ids && typeof data.watched_ids === 'object') {
        const store = useWatchlistStore.getState();
        const mergedWatched = { ...store.watchedIds, ...data.watched_ids };
        localStorage.setItem('multiverse_tracker_watched_v1', JSON.stringify(mergedWatched));
        useWatchlistStore.setState({ watchedIds: mergedWatched });
      }

      // 2. Hydrate Trakt Account
      if (data.trakt_username && data.trakt_token) {
        // Preserve any existing client_id from localStorage (set during OAuth)
        let existingClientId: string | undefined;
        try {
          const raw = localStorage.getItem('multiverse_tracker_trakt_user_v1');
          if (raw) {
            const existing = JSON.parse(raw);
            existingClientId = existing?.client_id;
          }
        } catch {}

        const traktUser = {
          username: data.trakt_username,
          name: data.trakt_username,
          access_token: data.trakt_token,
          expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000,
          client_id: existingClientId || process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
        };
        useWatchlistStore.getState().setTraktUser(traktUser);
      } else if (data.trakt_username) {
        // Read-only username connect — no real token
        const traktUser = {
          username: data.trakt_username,
          name: data.trakt_username,
          access_token: `token_user_${data.trakt_username}`,
          expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000,
        };
        useWatchlistStore.getState().setTraktUser(traktUser);
      }

      // 3. Hydrate TMDB BYOK Key
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
