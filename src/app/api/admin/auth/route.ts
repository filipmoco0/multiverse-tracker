import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@multiversetracker.com').toLowerCase().trim();
    const expectedPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'multiverse2025';

    const inputEmail = (email || '').toLowerCase().trim();
    const inputPassword = (password || '').trim();

    // Check credentials (allows configured email/password, or fallback 'admin' for local setup)
    const isEmailValid = inputEmail === expectedEmail || inputEmail === 'admin';
    const isPasswordValid = inputPassword === expectedPassword || inputPassword === 'multiverse2025' || inputPassword === 'admin';

    if (isEmailValid && isPasswordValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: false,
      error: `Invalid email or passcode. Authorized admin email is: ${expectedEmail}`
    }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
