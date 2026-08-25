import { useByokStore } from '../store/useByokStore';

export const TRAKT_API_URL = 'https://api.trakt.tv';
const DEFAULT_TRAKT_KEY = '5a6ddbfaea8f5a6fa58dfc924bc01c23f66085a539bc2b5c00e66c6b4129b8c0';
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MultiverseTracker/1.0';

export function getEffectiveTraktClientId(): string {
  if (typeof window !== 'undefined') {
    // First try BYOK store
    const byokKey = useByokStore.getState().traktClientId;
    if (byokKey) return byokKey;

    // Then try the client_id stored alongside the OAuth token
    // This ensures the Client ID always matches the app that issued the token
    try {
      const raw = localStorage.getItem('multiverse_tracker_trakt_user_v1');
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.client_id) return user.client_id;
      }
    } catch {}
  }
  return process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || DEFAULT_TRAKT_KEY;
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
