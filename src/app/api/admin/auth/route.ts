import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'filipmoco04@gmail.com').toLowerCase().trim();
    const expectedPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dagvoj-4hojpu-nercaB';

    const inputEmail = (email || '').toLowerCase().trim();
    const inputPassword = (password || '').trim();

    // Check credentials against primary and fallback configured email & password
    const isEmailValid = inputEmail === expectedEmail || inputEmail === 'filipmoco04@gmail.com' || inputEmail === 'admin';
    const isPasswordValid = inputPassword === expectedPassword || inputPassword === 'dagvoj-4hojpu-nercaB';

    if (isEmailValid && isPasswordValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: false,
      error: `Invalid admin email or passcode. Authorized admin email: ${expectedEmail}`
    }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
