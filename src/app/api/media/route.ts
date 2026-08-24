import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MCU_SEED_DATA } from '@/lib/seed/mcu-seed';
import { DCU_SEED_DATA } from '@/lib/seed/dcu-seed';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const universe = searchParams.get('universe') === 'dcu' ? 'dcu' : 'mcu';
  const fallbackSeed = universe === 'mcu' ? MCU_SEED_DATA : DCU_SEED_DATA;

  try {
    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('franchise_media')
        .select('*')
        .eq('universe', universe)
        .order('release_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ media: data, source: 'supabase' });
      }
    }
  } catch (err: any) {
    console.warn('Supabase fetch error in GET /api/media:', err.message);
  }

  return NextResponse.json({ media: fallbackSeed, source: 'seed' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    let supabaseResult = null;

    if (supabase) {
      const { data, error } = await supabase.from('franchise_media').upsert([body], { onConflict: 'id' }).select();
      if (error) {
        console.warn('Supabase insert error:', error.message);
      } else {
        supabaseResult = data;
      }
    }

    // Also update local seed file if running locally
    try {
      const universe = body.universe || 'mcu';
      const fileName = universe === 'mcu' ? 'mcu-seed.ts' : 'dcu-seed.ts';
      const varName = universe === 'mcu' ? 'MCU_SEED_DATA' : 'DCU_SEED_DATA';
      const targetPath = path.join(process.cwd(), 'src', 'lib', 'seed', fileName);
      
      const currentSeed = universe === 'mcu' ? [...MCU_SEED_DATA] : [...DCU_SEED_DATA];
      const idx = currentSeed.findIndex((item) => item.id === body.id);
      if (idx >= 0) {
        currentSeed[idx] = body;
      } else {
        currentSeed.push(body);
      }
      currentSeed.sort((a, b) => a.release_order - b.release_order);

      const content = `import { FranchiseMedia } from "../types";\n\nexport const ${varName}: FranchiseMedia[] = ` + JSON.stringify(currentSeed, null, 2) + `;\n`;
      fs.writeFileSync(targetPath, content, 'utf8');
    } catch {}

    return NextResponse.json({ success: true, data: supabaseResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let supabaseResult = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('franchise_media')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.warn('Supabase update error:', error.message);
      } else {
        supabaseResult = data;
      }
    }

    return NextResponse.json({ success: true, data: supabaseResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing media ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      await supabase.from('franchise_media').delete().eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
