import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const DEFAULT_TMDB_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdb_id');
  const mediaType = searchParams.get('media_type') || 'movie';
  const customApiKey = searchParams.get('api_key');
  const region = (searchParams.get('region') || 'US').toUpperCase();

  if (!tmdbId) {
    return NextResponse.json({ error: 'tmdb_id is required' }, { status: 400 });
  }

  const apiKey = customApiKey || process.env.NEXT_PUBLIC_TMDB_API_KEY || DEFAULT_TMDB_KEY;
  const endpointType = mediaType === 'show' ? 'tv' : 'movie';

  try {
    const [videosRes, providersRes] = await Promise.all([
      fetch(`${TMDB_API_BASE}/${endpointType}/${tmdbId}/videos?api_key=${apiKey}`, {
        next: { revalidate: 86400 }, // Cache 24 hours
      }),
      fetch(`${TMDB_API_BASE}/${endpointType}/${tmdbId}/watch/providers?api_key=${apiKey}`, {
        next: { revalidate: 86400 }, // Cache 24 hours
      }),
    ]);

    let trailerKey: string | null = null;
    let trailerName: string | null = null;

    if (videosRes.ok) {
      const videoData = await videosRes.json();
      const results = (videoData.results || []).filter(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );

      // Prioritize official trailer > any trailer > official teaser
      const bestVideo =
        results.find((v: any) => v.official && v.type === 'Trailer') ||
        results.find((v: any) => v.type === 'Trailer') ||
        results.find((v: any) => v.official && v.type === 'Teaser') ||
        results[0];

      if (bestVideo) {
        trailerKey = bestVideo.key;
        trailerName = bestVideo.name;
      }
    }

    const providersData: {
      flatrate: { name: string; logo: string }[];
      rent: { name: string; logo: string }[];
      buy: { name: string; logo: string }[];
      justWatchLink: string | null;
    } = {
      flatrate: [],
      rent: [],
      buy: [],
      justWatchLink: null,
    };

    if (providersRes.ok) {
      const pData = await providersRes.json();
      const results = pData.results || {};
      
      // Look for requested region first, then US, then first available country
      const regionData = results[region] || results['US'] || results['HR'] || results['GB'] || Object.values(results)[0] || null;

      if (regionData) {
        providersData.justWatchLink = regionData.link || null;

        if (Array.isArray(regionData.flatrate)) {
          providersData.flatrate = regionData.flatrate.map((p: any) => ({
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
          }));
        }

        if (Array.isArray(regionData.rent)) {
          providersData.rent = regionData.rent.map((p: any) => ({
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
          }));
        }

        if (Array.isArray(regionData.buy)) {
          providersData.buy = regionData.buy.map((p: any) => ({
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
          }));
        }
      }
    }

    return NextResponse.json(
      {
        tmdbId,
        trailerKey,
        trailerName,
        providers: providersData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error: any) {
    console.error('TMDB details fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}
