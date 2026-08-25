import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TRAKT_KEY = '5a6ddbfaea8f5a6fa58dfc924bc01c23f66085a539bc2b5c00e66c6b4129b8c0';
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MultiverseTracker/1.0';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, item, clientId: customClientId } = body;

    if (!token || token.startsWith('token_user_')) {
      return NextResponse.json({ error: 'OAuth token required for syncing history' }, { status: 401 });
    }

    if (!item) {
      return NextResponse.json({ error: 'Item data is required' }, { status: 400 });
    }

    const clientId = customClientId || process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || DEFAULT_TRAKT_KEY;
    const endpoint = action === 'add' ? '/sync/history' : '/sync/history/remove';

    const idObject: Record<string, number> = {};
    if (item.traktId && !isNaN(Number(item.traktId))) idObject.trakt = Number(item.traktId);
    if (item.tmdbId && !isNaN(Number(item.tmdbId))) idObject.tmdb = Number(item.tmdbId);

    if (Object.keys(idObject).length === 0) {
      return NextResponse.json({ error: 'No valid TMDB or Trakt ID provided for media item' }, { status: 400 });
    }

    const TMDB_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';

    const getSeasonEpisodeNumbers = async (tmdbId: number, seasonNum: number): Promise<number[]> => {
      try {
        const tmdbRes = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}`
        );
        if (tmdbRes.ok) {
          const tmdbData = await tmdbRes.json();
          if (Array.isArray(tmdbData.episodes) && tmdbData.episodes.length > 0) {
            return tmdbData.episodes
              .map((ep: any) => ep.episode_number || ep.number)
              .filter((n: any) => typeof n === 'number' && n > 0);
          }
        }
      } catch (e) {
        console.warn('TMDB season episodes fetch warning:', e);
      }
      return Array.from({ length: 24 }, (_, i) => i + 1);
    };

    const bodyData: Record<string, unknown[]> = {};

    if (item.mediaType === 'movie' || item.mediaType === 'special') {
      bodyData.movies = [{ ids: idObject }];
    } else {
      if (item.seasonNumber && item.tmdbId) {
        const seasonsArr: number[] = Array.isArray(item.seasonNumber)
          ? item.seasonNumber
          : [Number(item.seasonNumber)];

        const seasonsWithEpisodes = await Promise.all(
          seasonsArr.map(async (seasonNum) => {
            const eps = await getSeasonEpisodeNumbers(Number(item.tmdbId), seasonNum);
            if (action === 'add') {
              return {
                number: seasonNum,
                episodes: eps.map((epNum) => ({
                  number: epNum,
                  watched_at: new Date().toISOString(),
                })),
              };
            } else {
              return {
                number: seasonNum,
                episodes: eps.map((epNum) => ({
                  number: epNum,
                })),
              };
            }
          })
        );

        bodyData.shows = [
          {
            ids: idObject,
            seasons: seasonsWithEpisodes,
          },
        ];
      } else {
        bodyData.shows = [{ ids: idObject }];
      }
    }

    const traktRes = await fetch(`https://api.trakt.tv${endpoint}`, {
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

    const resData = await traktRes.json().catch(() => ({}));
    if (!traktRes.ok) {
      console.warn('Trakt API error response:', traktRes.status, resData);
      return NextResponse.json({ error: resData, status: traktRes.status }, { status: traktRes.status });
    }

    return NextResponse.json({ success: true, data: resData });
  } catch (err: any) {
    console.error('Server error in /api/trakt/history:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
