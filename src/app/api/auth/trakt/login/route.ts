import { NextRequest, NextResponse } from 'next/server';
import { TRAKT_CLIENT_ID, TRAKT_CLIENT_SECRET } from '@/lib/trakt/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paramClientId = searchParams.get('client_id');
  const paramClientSecret = searchParams.get('client_secret');

  const clientId = paramClientId || TRAKT_CLIENT_ID;
  const clientSecret = paramClientSecret || TRAKT_CLIENT_SECRET;

  // Use request origin so it works on both Vercel URL and production domain.
  // Both must be registered as redirect URIs in the Trakt app settings.
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/trakt/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state: 'multiverse_tracker_state',
  });

  const response = NextResponse.redirect(`https://trakt.tv/oauth/authorize?${params.toString()}`);

  // Set short-lived cookies for BYOK credentials during OAuth flow
  if (paramClientId) {
    response.cookies.set('trakt_byok_id', paramClientId, { maxAge: 600, path: '/', sameSite: 'lax' });
  }
  if (paramClientSecret) {
    response.cookies.set('trakt_byok_secret', paramClientSecret, { maxAge: 600, path: '/', sameSite: 'lax' });
  }

  return response;
}
