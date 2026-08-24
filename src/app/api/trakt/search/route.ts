import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'movie' | 'show' | 'all'
  const year = searchParams.get('year');

  const customKey = request.headers.get('x-tmdb-api-key') || searchParams.get('api_key');
  const apiKey = customKey || process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    let endpoint = 'multi';
    if (type === 'movie') endpoint = 'movie';
    if (type === 'show') endpoint = 'tv';

    let url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
    if (year && endpoint === 'movie') url += `&primary_release_year=${year}`;
    if (year && endpoint === 'tv') url += `&first_air_date_year=${year}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const results = (data.results || [])
        .filter((item: any) => endpoint !== 'multi' || item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => {
          const itemType = endpoint === 'movie' ? 'movie' : endpoint === 'tv' ? 'show' : item.media_type === 'tv' ? 'show' : 'movie';
          return {
            title: item.title || item.name,
            media_type: itemType,
            release_date: item.release_date || item.first_air_date,
            tmdb_id: item.id,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            overview: item.overview,
            vote_average: item.vote_average,
          };
        });
      return NextResponse.json({ results, byokUsed: Boolean(customKey) });
    }
  } catch (e) {
    console.warn('TMDB search error:', e);
  }

  // Fallback search against built-in seed dataset
  const { MCU_SEED_DATA } = await import('@/lib/seed/mcu-seed');
  const { DCU_SEED_DATA } = await import('@/lib/seed/dcu-seed');
  const allSeed = [...MCU_SEED_DATA, ...DCU_SEED_DATA];

  const qLower = query.toLowerCase();
  const matched = allSeed
    .filter((m) => {
      if (type && type !== 'all' && m.media_type !== type) return false;
      return m.title.toLowerCase().includes(qLower) || m.phase_or_chapter.toLowerCase().includes(qLower);
    })
    .map((m) => ({
      title: m.title,
      media_type: m.media_type,
      release_date: m.release_date,
      tmdb_id: m.tmdb_id,
      trakt_id: m.trakt_id,
      poster_path: m.poster_path,
      overview: m.overview,
      phase_or_chapter: m.phase_or_chapter,
      universe: m.universe,
    }));

  return NextResponse.json({ results: matched, fallback: true });
}
