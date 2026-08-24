export const TRAKT_API_URL = 'https://api.trakt.tv';

export function getTraktAuthUrl(redirectUri: string): string {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'trakt_oauth_multiverse',
  });
  return `https://trakt.tv/oauth/authorize?${params.toString()}`;
}

export async function exchangeTraktCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
  const clientSecret = process.env.TRAKT_CLIENT_SECRET || '';

  const res = await fetch(`${TRAKT_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Trakt token exchange failed: ${errorText}`);
  }

  return res.json();
}

export async function getTraktUserProfile(token: string) {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
  const res = await fetch(`${TRAKT_API_URL}/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': clientId,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Trakt profile');
  }

  return res.json();
}

export async function fetchTraktWatchedItems(token: string) {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': clientId,
    Authorization: `Bearer ${token}`,
  };

  const [moviesRes, showsRes] = await Promise.all([
    fetch(`${TRAKT_API_URL}/sync/watched/movies`, { headers }),
    fetch(`${TRAKT_API_URL}/sync/watched/shows`, { headers }),
  ]);

  const movies = moviesRes.ok ? await moviesRes.json() : [];
  const shows = showsRes.ok ? await showsRes.json() : [];

  return { movies, shows };
}

export async function syncTraktHistory(
  token: string,
  action: 'add' | 'remove',
  item: { tmdbId?: number | null; traktId?: number | null; mediaType: 'movie' | 'show' | 'special' }
) {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
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
      'trakt-api-version': '2',
      'trakt-api-key': clientId,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn(`Trakt sync error (${action}):`, err);
  }

  return res.ok;
}
