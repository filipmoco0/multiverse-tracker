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

  const clientId = cookieId || process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || '';
  const clientSecret = cookieSecret || process.env.TRAKT_CLIENT_SECRET || '';
  // Must match what was sent in the login step — use same origin
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/trakt/callback`;

  // Return a client-side browser page to perform the token exchange directly from the user's home IP (bypassing Cloudflare datacenter IP blocks)
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connecting Trakt.tv...</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0b10;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #141624;
      border: 4px solid #000;
      box-shadow: 8px 8px 0px 0px #000;
      padding: 2.5rem;
      max-width: 440px;
      width: 90%;
      text-align: center;
    }
    .badge {
      background: #E62429;
      color: #fff;
      font-weight: 900;
      font-size: 0.8rem;
      padding: 4px 12px;
      display: inline-block;
      border: 2px solid #000;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid #333;
      border-top: 4px solid #ffb703;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 1.5rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .title {
      font-size: 1.4rem;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .status {
      font-size: 0.85rem;
      color: #a1a1aa;
      line-height: 1.4;
    }
    .error-box {
      display: none;
      background: #450a0a;
      border: 2px solid #dc2626;
      color: #fca5a5;
      padding: 1rem;
      margin-top: 1rem;
      font-size: 0.8rem;
      text-align: left;
    }
    .btn {
      display: none;
      margin-top: 1.25rem;
      background: #ffb703;
      color: #000;
      font-weight: 800;
      border: 2px solid #000;
      padding: 0.6rem 1.2rem;
      cursor: pointer;
      text-transform: uppercase;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Trakt.tv Sync</div>
    <div class="title" id="heading">Finalizing Connection</div>
    <div class="spinner" id="loader"></div>
    <div class="status" id="msg">Authenticating with your Trakt profile...</div>
    <div class="error-box" id="errBox"></div>
    <a href="/select" class="btn" id="btnContinue">Continue to Watchlist</a>
    <a href="/" class="btn" id="btnBack">Return Home</a>
  </div>

  <script>
    (async function() {
      const code = ${JSON.stringify(code)};
      let clientId = ${JSON.stringify(clientId)};
      let clientSecret = ${JSON.stringify(clientSecret)};
      const redirectUri = ${JSON.stringify(redirectUri)};

      // Check localStorage for BYOK if server didn't have it
      try {
        const byokRaw = localStorage.getItem('multiverse_byok_keys_storage');
        if (byokRaw) {
          const byokParsed = JSON.parse(byokRaw);
          if (byokParsed.state) {
            if (!clientId && byokParsed.state.traktClientId) clientId = byokParsed.state.traktClientId;
            if (!clientSecret && byokParsed.state.traktClientSecret) clientSecret = byokParsed.state.traktClientSecret;
          }
        }
      } catch(e) {}

      const msgEl = document.getElementById('msg');
      const errBox = document.getElementById('errBox');
      const loader = document.getElementById('loader');
      const btnBack = document.getElementById('btnBack');
      const btnContinue = document.getElementById('btnContinue');
      const heading = document.getElementById('heading');

      try {
        // 1. Exchange code for access token directly from user's browser (no Cloudflare IP block)
        const tokenRes = await fetch('https://api.trakt.tv/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          throw new Error('Trakt Token Exchange Failed: ' + errText);
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresIn = tokenData.expires_in || 7776000;

        // 2. Fetch User Profile
        msgEl.innerText = 'Fetching user profile...';
        const userRes = await fetch('https://api.trakt.tv/users/me', {
          headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': clientId,
            'Authorization': 'Bearer ' + accessToken
          }
        });

        let username = 'TraktUser';
        let avatar = '';
        if (userRes.ok) {
          const userData = await userRes.json();
          username = userData.user?.username || userData.username || 'TraktUser';
          avatar = userData.user?.images?.avatar?.full || '';
        }

        const traktUserObj = {
          username: username,
          name: username,
          avatar: avatar,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Date.now() + (expiresIn * 1000),
          client_id: clientId
        };

        // 3. Save to localStorage
        localStorage.setItem('multiverse_tracker_trakt_user_v1', JSON.stringify(traktUserObj));
        localStorage.setItem('multiverse_tracker_auth_mode_v1', 'trakt');

        // 4. Update UI & redirect
        heading.innerText = 'Connected @' + username + '!';
        msgEl.innerText = 'Trakt authenticated successfully. Launching your watchlist...';
        loader.style.display = 'none';
        btnContinue.style.display = 'inline-block';

        setTimeout(function() {
          window.location.href = '/select';
        }, 800);

      } catch(err) {
        loader.style.display = 'none';
        heading.innerText = 'Connection Error';
        msgEl.innerText = 'Could not finalize Trakt authorization.';
        errBox.innerText = err.message || 'Unknown error occurred.';
        errBox.style.display = 'block';
        btnBack.style.display = 'inline-block';
      }
    })();
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
}
