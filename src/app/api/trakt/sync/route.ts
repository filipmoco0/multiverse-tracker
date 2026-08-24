import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || 'dummy_client_id';

  try {
    const headers = {
      'Content-Type': 'application/json',
      'trakt-api-version': '2',
      'trakt-api-key': clientId,
    };

    const [moviesRes, showsRes] = await Promise.all([
      fetch(`https://api.trakt.tv/users/${encodeURIComponent(username)}/watched/movies`, { headers }),
      fetch(`https://api.trakt.tv/users/${encodeURIComponent(username)}/watched/shows`, { headers }),
    ]);

    const movies = moviesRes.ok ? await moviesRes.json() : [];
    const shows = showsRes.ok ? await showsRes.json() : [];

    return NextResponse.json({ movies, shows });
  } catch (err: any) {
    console.error('Trakt public sync error:', err);
    return NextResponse.json({ error: err.message, movies: [], shows: [] }, { status: 500 });
  }
}
