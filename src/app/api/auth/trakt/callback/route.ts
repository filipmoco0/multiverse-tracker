import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=trakt_auth_cancelled', request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
  const clientSecret = process.env.TRAKT_CLIENT_SECRET;
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/trakt/callback`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Trakt token exchange error:', errText);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userRes = await fetch('https://api.trakt.tv/users/me', {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': clientId || '',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let username = 'TraktUser';
    let avatar = '';
    if (userRes.ok) {
      const userData = await userRes.json();
      username = userData.user?.username || userData.username || 'TraktUser';
      avatar = userData.user?.images?.avatar?.full || '';
    }

    const traktUserData = JSON.stringify({
      username,
      avatar,
      access_token: accessToken,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in || 7776000) * 1000,
    });

    // Return HTML page that syncs to localStorage and redirects to /select
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating with Trakt...</title>
          <style>
            body { background: #0c0d14; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; border: 3px solid #000; background: #161824; padding: 30px; box-shadow: 6px 6px 0px #000; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Trakt Connected Successfully!</h2>
            <p>Syncing your Multiverse watchlist...</p>
          </div>
          <script>
            try {
              localStorage.setItem('multiverse_tracker_trakt_user_v1', ${JSON.stringify(traktUserData)});
              localStorage.setItem('multiverse_tracker_auth_mode_v1', 'trakt');
            } catch (e) {
              console.error(e);
            }
            window.location.href = '/select';
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('Trakt OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
