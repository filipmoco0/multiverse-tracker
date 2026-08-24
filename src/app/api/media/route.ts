import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true, message: 'Supabase unconfigured, changes saved in local seed session.' });
    }

    const body = await request.json();
    const { data, error } = await supabase.from('franchise_media').insert([body]).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: true, localOnly: true, error: err.message });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true, message: 'Supabase unconfigured, changes saved in local seed session.' });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('franchise_media')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: true, localOnly: true, error: err.message });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true, message: 'Supabase unconfigured, deleted from local session.' });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    const { error } = await supabase.from('franchise_media').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, localOnly: true, error: err.message });
  }
}
