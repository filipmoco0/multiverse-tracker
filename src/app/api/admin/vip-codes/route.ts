import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zpdhjktfkojgqqacfuta.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGhqa3Rma29qZ3FxYWNmdXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzY5MzksImV4cCI6MjEwMzE1MjkzOX0.adY7bNE5owZzO2nvuYcnKO3YDm506STURoGJHdI2nWA';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE;
  return createClient(url, serviceKey);
}

function generateRandomCode(): string {
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  const universes = ['MCU', 'DCU', 'HERO', 'STARK', 'WAYNE'];
  const tag = universes[Math.floor(Math.random() * universes.length)];
  return `VIP-${num}-${tag}`;
}

// GET: Fetch all VIP codes
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('vip_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ codes: [] });
    }

    return NextResponse.json({ codes: data || [] });
  } catch (err: any) {
    return NextResponse.json({ codes: [] });
  }
}

// POST: Generate N new VIP codes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = Math.min(Math.max(Number(body.count) || 5, 1), 50);

    const newCodes = Array.from({ length: count }, () => ({
      code: generateRandomCode(),
      is_used: false,
      created_at: new Date().toISOString(),
    }));

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('vip_codes')
      .insert(newCodes)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      generated: data || newCodes,
      message: `Generated ${count} new single-use VIP codes!`,
    });
  } catch (err: any) {
    console.error('Failed to generate codes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
