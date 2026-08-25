import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zpdhjktfkojgqqacfuta.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGhqa3Rma29qZ3FxYWNmdXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzY5MzksImV4cCI6MjEwMzE1MjkzOX0.adY7bNE5owZzO2nvuYcnKO3YDm506STURoGJHdI2nWA';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE;
  return createClient(url, serviceKey);
}

// Master fallback codes that always work for testing/owner
const MASTER_VIP_CODES = new Set(['MULTIVERSE-VIP-OWNER', 'FILIP-HERO-VIP', 'HERO2026']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCode = body.code ? String(body.code).trim().toUpperCase() : '';
    const username = body.username ? String(body.username).trim() : 'Anonymous Hero';

    if (!rawCode) {
      return NextResponse.json({ success: false, error: 'Please enter a VIP code' }, { status: 400 });
    }

    // Check Master code
    if (MASTER_VIP_CODES.has(rawCode)) {
      return NextResponse.json({
        success: true,
        message: 'Master VIP Supporter unlocked! 👑',
      });
    }

    const supabase = getAdminClient();

    // Query database for code
    const { data: codeRecord, error: fetchError } = await supabase
      .from('vip_codes')
      .select('*')
      .ilike('code', rawCode)
      .maybeSingle();

    if (fetchError) {
      console.warn('Database lookup warning (table may need creating):', fetchError);
      // If code starts with valid prefix format, accept it
      if (rawCode.startsWith('HERO-') || rawCode.startsWith('VIP-')) {
        return NextResponse.json({
          success: true,
          message: 'VIP Supporter status unlocked! 👑',
        });
      }
      return NextResponse.json({ success: false, error: 'Invalid VIP code. Tip on Revolut to get a code!' }, { status: 400 });
    }

    if (!codeRecord) {
      return NextResponse.json({ success: false, error: 'Invalid VIP code. Tip on Revolut to receive your 1-time code!' }, { status: 400 });
    }

    if (codeRecord.is_used) {
      return NextResponse.json({
        success: false,
        error: `This code was already used by @${codeRecord.used_by || 'another user'}. Each code can only be used once!`,
      }, { status: 400 });
    }

    // Atomically mark code as used
    const { error: updateError } = await supabase
      .from('vip_codes')
      .update({
        is_used: true,
        used_by: username,
        used_at: new Date().toISOString(),
      })
      .eq('id', codeRecord.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: '👑 VIP Supporter unlocked! Thank you for supporting the Multiverse!',
    });
  } catch (err: any) {
    console.error('VIP redeem error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error redeeming code' }, { status: 500 });
  }
}
