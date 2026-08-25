import { useByokStore } from '../store/useByokStore';

export const TRAKT_API_URL = 'https://api.trakt.tv';
const DEFAULT_TRAKT_KEY = '5a6ddbfaea8f5a6fa58dfc924bc01c23f66085a539bc2b5c00e66c6b4129b8c0';
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MultiverseTracker/1.0';

export function getEffectiveTraktClientId(): string {
  if (typeof window !== 'undefined') {
    const byokKey = useByokStore.getState().traktClientId;
    if (byokKey) return byokKey;
  }
  return process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || DEFAULT_TRAKT_KEY;
}

export async function fetchTraktWatchedItems(token?: string | null, username?: string | null) {
  const clientId = getEffectiveTraktClientId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': BROWSER_USER_AGENT,
    'trakt-api-version': '2',
    'trakt-api-key': clientId,
    Accept: 'application/json',
  };

  if (token && !token.startsWith('token_user_')) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    let moviesEndpoint = `${TRAKT_API_URL}/sync/watched/movies`;
    let showsEndpoint = `${TRAKT_API_URL}/sync/watched/shows`;

    // If no real token, use public user watched endpoints
    if (!token || token.startsWith('token_user_')) {
      if (username) {
        if (typeof window !== 'undefined') {
          try {
            const res = await fetch(`/api/trakt/sync?username=${encodeURIComponent(username)}`);
            if (res.ok) {
              const data = await res.json();
              return { movies: data.movies || [], shows: data.shows || [] };
            }
          } catch (e) {
            console.warn('Server proxy sync fallback:', e);
          }
        }
        moviesEndpoint = `${TRAKT_API_URL}/users/${encodeURIComponent(username)}/watched/movies`;
        showsEndpoint = `${TRAKT_API_URL}/users/${encodeURIComponent(username)}/watched/shows`;
      } else {
        return { movies: [], shows: [] };
      }
    }

    const [moviesRes, showsRes] = await Promise.all([
      fetch(moviesEndpoint, { headers }),
      fetch(showsEndpoint, { headers }),
    ]);

    const movies = moviesRes.ok ? await moviesRes.json() : [];
    const shows = showsRes.ok ? await showsRes.json() : [];

    return { movies, shows };
  } catch (err) {
    console.error('Failed to fetch Trakt watched history:', err);
    return { movies: [], shows: [] };
  }
}

export async function syncTraktHistory(
  token: string,
  action: 'add' | 'remove',
  item: { tmdbId?: number | null; traktId?: number | null; mediaType: 'movie' | 'show' | 'special' }
) {
  const clientId = getEffectiveTraktClientId();
  const endpoint = action === 'add' ? '/sync/history' : '/sync/history/remove';

  const bodyData: Record<string, unknown[]> = {};
  const idObject: Record<string, number> = {};
  if (item.traktId) idObject.trakt = item.traktId;
  if (item.tmdbId) idObject.tmdb = item.tmdbId;

  if (item.mediaType === 'movie' || item.mediaType === 'special') {
    bodyData.movies = [{ ids: idObject }];
  } else {
    bodyData.shows = [{ ids: idObject }];
  }

  const res = await fetch(`${TRAKT_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': BROWSER_USER_AGENT,
      'trakt-api-version': '2',
      'trakt-api-key': clientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn(`Trakt history sync warning (${res.status}):`, errText);
  }

  return res.ok;
}
