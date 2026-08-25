import { useByokStore } from '../store/useByokStore';
import { TRAKT_CLIENT_ID } from './config';

export const TRAKT_API_URL = 'https://api.trakt.tv';

export function getEffectiveTraktClientId(): string {
  if (typeof window !== 'undefined') {
    // First try BYOK store
    const byokKey = useByokStore.getState().traktClientId;
    if (byokKey) return byokKey;

    // Then try the client_id stored alongside the OAuth token
    try {
      const raw = localStorage.getItem('multiverse_tracker_trakt_user_v1');
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.client_id) return user.client_id;
      }
    } catch {}
  }
  return TRAKT_CLIENT_ID;
}

export async function fetchTraktWatchedItems(token?: string | null, username?: string | null) {
  const clientId = getEffectiveTraktClientId();

  try {
    const params = new URLSearchParams();
    if (token && !token.startsWith('token_user_')) {
      params.set('token', token);
    }
    if (username) {
      params.set('username', username);
    }
    if (clientId) {
      params.set('client_id', clientId);
    }

    const res = await fetch(`/api/trakt/sync?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { movies: data.movies || [], shows: data.shows || [] };
    }
    return { movies: [], shows: [], error: data.error || `Sync failed (${res.status})` };
  } catch (err: any) {
    console.error('Failed to fetch Trakt watched history via server proxy:', err);
    return { movies: [], shows: [], error: err.message };
  }
}

export async function syncTraktHistory(
  token: string,
  action: 'add' | 'remove',
  item: {
    tmdbId?: number | null;
    traktId?: number | null;
    mediaType: 'movie' | 'show' | 'special';
    seasonNumber?: number | number[] | null;
  }
) {
  // If item has no TMDB or Trakt ID (e.g. unreleased/unannounced project), skip gracefully
  if (!item.tmdbId && !item.traktId) {
    return { skipped: true };
  }

  const clientId = getEffectiveTraktClientId();

  const res = await fetch('/api/trakt/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      action,
      item,
      clientId,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data.error === 'string'
      ? data.error
      : JSON.stringify(data.error || data);
    throw new Error(`Trakt sync failed (${res.status}): ${msg}`);
  }

  return data;
}
