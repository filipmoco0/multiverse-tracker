import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('id');
  const mediaType = searchParams.get('type') === 'show' ? 'tv' : 'movie';

  // Priority: Custom BYOK Header > Query Param > Environment Variable
  const customKey = request.headers.get('x-tmdb-api-key') || searchParams.get('api_key');
  const apiKey = customKey || process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing TMDB ID' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB ID ${tmdbId} not found in ${mediaType} category` }, { status: 404 });
    }

    const data = await res.json();
    const result = {
      title: data.title || data.name,
      media_type: mediaType === 'tv' ? 'show' : 'movie',
      tmdb_id: data.id,
      release_date: data.release_date || data.first_air_date || null,
      overview: data.overview || null,
      poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      status: data.status,
      tagline: data.tagline,
      vote_average: data.vote_average,
      byokUsed: Boolean(customKey),
    };

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error('TMDB direct lookup error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
