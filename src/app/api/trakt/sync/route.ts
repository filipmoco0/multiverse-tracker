import { NextRequest, NextResponse } from 'next/server';
import { TRAKT_CLIENT_ID, TRAKT_USER_AGENT } from '@/lib/trakt/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const token = searchParams.get('token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const customClientId = searchParams.get('client_id');

  if (!username && !token) {
    return NextResponse.json({ error: 'Username or Token is required' }, { status: 400 });
  }

  const clientId = customClientId || TRAKT_CLIENT_ID;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': TRAKT_USER_AGENT,
      'trakt-api-version': '2',
      'trakt-api-key': clientId,
    };

    let moviesUrl = '';
    let showsUrl = '';

    if (token && !token.startsWith('token_user_')) {
      headers.Authorization = `Bearer ${token}`;
      moviesUrl = 'https://api.trakt.tv/sync/watched/movies';
      showsUrl = 'https://api.trakt.tv/sync/watched/shows';
    } else if (username) {
      moviesUrl = `https://api.trakt.tv/users/${encodeURIComponent(username)}/watched/movies`;
      showsUrl = `https://api.trakt.tv/users/${encodeURIComponent(username)}/watched/shows`;
    }

    const [moviesRes, showsRes] = await Promise.all([
      fetch(moviesUrl, { headers }),
      fetch(showsUrl, { headers }),
    ]);

    let movies = [];
    let shows = [];
    let errorDetail = null;

    if (moviesRes.ok) {
      movies = await moviesRes.json();
    } else {
      errorDetail = `Movies API returned ${moviesRes.status}`;
    }

    if (showsRes.ok) {
      shows = await showsRes.json();
    } else {
      errorDetail = (errorDetail ? errorDetail + ', ' : '') + `Shows API returned ${showsRes.status}`;
    }

    if (!moviesRes.ok && !showsRes.ok) {
      const errStatus = moviesRes.status === 403 || showsRes.status === 403 ? 403 : (moviesRes.status || 400);
      return NextResponse.json(
        {
          error: `Trakt API ${errStatus} Forbidden/Unauthorized. Please verify your Trakt Client ID in Settings.`,
          movies: [],
          shows: [],
        },
        { status: errStatus }
      );
    }

    return NextResponse.json({ movies, shows });
  } catch (err: any) {
    console.error('Trakt sync server error:', err);
    return NextResponse.json({ error: err.message, movies: [], shows: [] }, { status: 500 });
  }
}
