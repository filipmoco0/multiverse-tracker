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
    if (item.traktId) idObject.trakt = Number(item.traktId);
    if (item.tmdbId) idObject.tmdb = Number(item.tmdbId);

    const bodyData: Record<string, unknown[]> = {};

    if (item.mediaType === 'movie' || item.mediaType === 'special') {
      bodyData.movies = [{ ids: idObject }];
    } else {
      if (item.seasonNumber) {
        const seasonsArr: number[] = Array.isArray(item.seasonNumber) ? item.seasonNumber : [Number(item.seasonNumber)];
        if (action === 'add') {
          bodyData.shows = [
            {
              ids: idObject,
              seasons: seasonsArr.map((num) => ({
                number: num,
                watched_at: new Date().toISOString(),
              })),
            },
          ];
        } else {
          bodyData.shows = [
            {
              ids: idObject,
              seasons: seasonsArr.map((num) => ({
                number: num,
              })),
            },
          ];
        }
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
