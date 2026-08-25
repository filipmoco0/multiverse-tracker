import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TRAKT_KEY = '5a6ddbfaea8f5a6fa58dfc924bc01c23f66085a539bc2b5c00e66c6b4129b8c0';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const token = searchParams.get('token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const customClientId = searchParams.get('client_id');

  if (!username && !token) {
    return NextResponse.json({ error: 'Username or Token is required' }, { status: 400 });
  }

  const clientId = customClientId || process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || DEFAULT_TRAKT_KEY;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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

    const movies = moviesRes.ok ? await moviesRes.json() : [];
    const shows = showsRes.ok ? await showsRes.json() : [];

    return NextResponse.json({ movies, shows });
  } catch (err: any) {
    console.error('Trakt sync server error:', err);
    return NextResponse.json({ error: err.message, movies: [], shows: [] }, { status: 500 });
  }
}
