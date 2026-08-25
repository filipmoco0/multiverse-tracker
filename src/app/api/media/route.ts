import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MCU_SEED_DATA } from '@/lib/seed/mcu-seed';
import { DCU_SEED_DATA } from '@/lib/seed/dcu-seed';

function sanitizeMediaItem(item: any): any {
  return {
    id: String(item.id),
    universe: item.universe === 'dcu' ? 'dcu' : 'mcu',
    title: String(item.title || '').trim(),
    media_type: item.media_type || 'movie',
    release_order: Number(item.release_order) || 1,
    chronological_order:
      item.chronological_order !== null &&
      item.chronological_order !== undefined &&
      item.chronological_order !== ''
        ? Number(item.chronological_order)
        : null,
    phase_or_chapter: String(item.phase_or_chapter || (item.universe === 'mcu' ? 'Phase 1' : 'Chapter 1')).trim(),
    trakt_id: item.trakt_id ? Number(item.trakt_id) : null,
    tmdb_id: item.tmdb_id ? Number(item.tmdb_id) : null,
    poster_path: item.poster_path ? String(item.poster_path).trim() : null,
    is_released: Boolean(item.is_released),
    release_date: item.release_date ? String(item.release_date).trim() : null,
    overview: item.overview ? String(item.overview).trim() : null,
  };
}

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
        const merged = fallbackSeed.map((seedItem) => {
          const dbItem = data.find((d: any) => d.id === seedItem.id);
          if (!dbItem) return seedItem;
          return {
            ...seedItem,
            poster_path: dbItem.poster_path || seedItem.poster_path,
            is_released: dbItem.is_released !== undefined ? dbItem.is_released : seedItem.is_released,
            chronological_order: seedItem.chronological_order,
          };
        });
        return NextResponse.json({ media: merged, source: 'supabase' });
      } else if (error) {
        console.warn('Supabase select warning:', error.message);
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
    const sanitized = sanitizeMediaItem(body);
    const supabase = createAdminClient();

    if (supabase) {
      const { data, error } = await supabase
        .from('franchise_media')
        .upsert([sanitized], { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitized = sanitizeMediaItem(body);

    if (!sanitized.id) {
      return NextResponse.json({ success: false, error: 'Missing media ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('franchise_media')
        .upsert([sanitized], { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing media ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from('franchise_media').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
