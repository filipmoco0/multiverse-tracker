import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const customKey = request.headers.get('x-tmdb-api-key') || searchParams.get('api_key');
  const apiKey = customKey || process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';

  try {
    let results: any[] = [];

    if (type === 'movie' || type === 'all') {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
      );
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        const movies = (movieData.results || []).slice(0, 10).map((m: any) => ({
          title: m.title,
          media_type: 'movie',
          tmdb_id: m.id,
          release_date: m.release_date || null,
          overview: m.overview || null,
          poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          vote_average: m.vote_average,
        }));
        results.push(...movies);
      }
    }

    if (type === 'show' || type === 'all') {
      const tvRes = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
      );
      if (tvRes.ok) {
        const tvData = await tvRes.json();
        const shows = (tvData.results || []).slice(0, 10).map((s: any) => ({
          title: s.name,
          media_type: 'show',
          tmdb_id: s.id,
          release_date: s.first_air_date || null,
          overview: s.overview || null,
          poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
          vote_average: s.vote_average,
        }));
        results.push(...shows);
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('TMDB Search error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
