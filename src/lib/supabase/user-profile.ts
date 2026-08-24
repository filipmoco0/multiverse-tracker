import { createClient } from './client';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useByokStore } from '../store/useByokStore';

export interface UserProfileData {
  watched_ids?: Record<string, boolean>;
  trakt_username?: string | null;
  trakt_token?: string | null;
  tmdb_api_key?: string | null;
}

/**
 * Saves or updates user profile in Supabase table `user_profiles`.
 */
export async function syncUserProfileToCloud(data: Partial<UserProfileData>) {
  try {
    const supabase = createClient();
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const payload: any = {
      id: user.id,
      email: user.email,
      updated_at: new Date().toISOString(),
      ...data,
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
        // Merge with any local progress
        const mergedWatched = { ...store.watchedIds, ...data.watched_ids };
        localStorage.setItem('multiverse_tracker_watched_v1', JSON.stringify(mergedWatched));
        useWatchlistStore.setState({ watchedIds: mergedWatched });
      }

      // 2. Hydrate Trakt Account
      if (data.trakt_username) {
        const traktUser = {
          username: data.trakt_username,
          name: data.trakt_username,
          access_token: data.trakt_token || `token_user_${data.trakt_username}`,
          expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000,
        };
        useWatchlistStore.getState().setTraktUser(traktUser);
      }

      // 3. Hydrate TMDB BYOK Key
      if (data.tmdb_api_key) {
        useByokStore.getState().setTmdbApiKey(data.tmdb_api_key);
      }

      return data;
    }
  } catch (err) {
    console.warn('Load user profile fatal error:', err);
  }
  return null;
}
