import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;

  if (!clientId) {
    // If Trakt Client ID is not configured, redirect back to landing with friendly note
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'trakt_not_configured');
    return NextResponse.redirect(url);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/trakt/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'multiverse_tracker_state',
  });

  return NextResponse.redirect(`https://trakt.tv/oauth/authorize?${params.toString()}`);
}
