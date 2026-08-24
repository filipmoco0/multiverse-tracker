import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error || !code) {
    const errorMsg = errorDescription || error || 'Trakt authorization was cancelled';
    return NextResponse.redirect(new URL(`/?error=trakt_auth_cancelled&reason=${encodeURIComponent(errorMsg)}`, request.url));
  }

  const cookieId = request.cookies.get('trakt_byok_id')?.value;
  const cookieSecret = request.cookies.get('trakt_byok_secret')?.value;

  const clientId = cookieId || process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
  const clientSecret = cookieSecret || process.env.TRAKT_CLIENT_SECRET;
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
      return NextResponse.redirect(
        new URL(`/?error=token_exchange_failed&reason=${encodeURIComponent('Trakt returned: ' + errText + '. Make sure Redirect URI in your Trakt App matches ' + redirectUri)}`, request.url)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 7776000; // 90 days in seconds

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
      refresh_token: refreshToken,
      expires_at: Date.now() + expiresIn * 1000,
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trakt Authentication Successful</title>
          <style>
            body {
              background: #0c0d14;
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #141624;
              border: 3px solid #000;
              box-shadow: 6px 6px 0px #000;
              padding: 2rem;
              text-align: center;
              max-width: 400px;
            }
            .badge {
              background: #E62429;
              color: white;
              padding: 4px 12px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">TRAKT CONNECTED</div>
            <h2>Welcome, @${username}!</h2>
            <p>Your Trakt.tv account has been authenticated. Redirecting back to your multiverse watchlist...</p>
          </div>
          <script>
            try {
              localStorage.setItem('multiverse_tracker_trakt_user_v1', ${JSON.stringify(traktUserData)});
              localStorage.setItem('multiverse_tracker_auth_mode_v1', 'trakt');
            } catch(e) {}
            setTimeout(() => {
              window.location.href = '/select';
            }, 1000);
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    // Clear temporary BYOK cookies
    response.cookies.delete('trakt_byok_id');
    response.cookies.delete('trakt_byok_secret');

    return response;
  } catch (err: any) {
    console.error('Trakt OAuth callback fatal error:', err);
    return NextResponse.redirect(new URL(`/?error=trakt_callback_error&reason=${encodeURIComponent(err.message)}`, request.url));
  }
}
