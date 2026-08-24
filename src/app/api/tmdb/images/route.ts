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
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/images?api_key=${apiKey}&include_image_language=en,null`
    );

    if (!res.ok) {
      // If language filter fails, try without language filter
      const fallbackRes = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/images?api_key=${apiKey}`
      );
      if (!fallbackRes.ok) {
        return NextResponse.json({ posters: [], byokUsed: Boolean(customKey) });
      }
      const data = await fallbackRes.json();
      const posters = (data.posters || []).map((p: any) => ({
        url: `https://image.tmdb.org/t/p/w500${p.file_path}`,
        width: p.width,
        height: p.height,
        vote_average: p.vote_average,
        language: p.iso_639_1,
      }));
      return NextResponse.json({ posters, byokUsed: Boolean(customKey) });
    }

    const data = await res.json();
    const posters = (data.posters || []).map((p: any) => ({
      url: `https://image.tmdb.org/t/p/w500${p.file_path}`,
      width: p.width,
      height: p.height,
      vote_average: p.vote_average,
      language: p.iso_639_1,
    }));

    return NextResponse.json({ posters, byokUsed: Boolean(customKey) });
  } catch (err: any) {
    console.error('TMDB images fetch error:', err);
    return NextResponse.json({ error: err.message, posters: [], byokUsed: Boolean(customKey) }, { status: 500 });
  }
}
