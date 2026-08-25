import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { FranchiseMedia, Universe } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/server';

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
    seasons: item.seasons ? Number(item.seasons) : null,
    episodes: item.episodes ? Number(item.episodes) : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { universe, mediaList }: { universe: Universe; mediaList: FranchiseMedia[] } = body;

    if (!universe || !Array.isArray(mediaList)) {
      return NextResponse.json({ success: false, error: 'Invalid payload. Universe and mediaList are required.' }, { status: 400 });
    }

    const sanitizedList = mediaList.map(sanitizeMediaItem);
    const activeIds = sanitizedList.map((item) => item.id);

    let fileSaved = false;
    let fileError: string | null = null;

    // 1. Write to local seed file (works when running locally)
    try {
      const fileName = universe === 'mcu' ? 'mcu-seed.ts' : 'dcu-seed.ts';
      const varName = universe === 'mcu' ? 'MCU_SEED_DATA' : 'DCU_SEED_DATA';
      const targetPath = path.join(process.cwd(), 'src', 'lib', 'seed', fileName);

      const content = `import { FranchiseMedia } from "../types";\n\nexport const ${varName}: FranchiseMedia[] = ` + JSON.stringify(sanitizedList, null, 2) + `;\n`;
      fs.writeFileSync(targetPath, content, 'utf8');
      fileSaved = true;
    } catch (fsErr: any) {
      fileError = fsErr.message;
    }

    // 2. Sync to Supabase: Delete removed items & Upsert active items
    let supabaseSaved = false;
    let supabaseError: string | null = null;

    try {
      const supabase = createAdminClient();
      if (supabase) {
        // A. Find and delete stale items not in activeIds
        const { data: existingRows, error: selErr } = await supabase
          .from('franchise_media')
          .select('id')
          .eq('universe', universe);

        if (!selErr && existingRows && existingRows.length > 0) {
          const toDelete = existingRows
            .filter((row: any) => !activeIds.includes(row.id))
            .map((row: any) => row.id);

          if (toDelete.length > 0) {
            console.log(`[save-seed] Deleting ${toDelete.length} removed items from Supabase for ${universe}:`, toDelete);
            for (let i = 0; i < toDelete.length; i += 20) {
              const chunk = toDelete.slice(i, i + 20);
              await supabase.from('franchise_media').delete().in('id', chunk);
            }
          }
        }

        // B. Upsert active items in chunks of 25
        const chunkSize = 25;
        for (let i = 0; i < sanitizedList.length; i += chunkSize) {
          const chunk = sanitizedList.slice(i, i + chunkSize);
          const { error } = await supabase
            .from('franchise_media')
            .upsert(chunk, { onConflict: 'id' });

          if (error) {
            throw error;
          }
        }
        supabaseSaved = true;
      } else {
        supabaseError = 'Supabase client could not be initialized (check env vars).';
      }
    } catch (dbErr: any) {
      supabaseError = dbErr.message || String(dbErr);
      console.error('Supabase save-seed failure:', dbErr);
    }

    // 3. Revalidate Next.js cache
    try {
      revalidatePath('/mcu');
      revalidatePath('/dcu');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (e) {
      // ignore in non-request contexts
    }

    if (!supabaseSaved && !fileSaved) {
      return NextResponse.json({
        success: false,
        error: supabaseError || fileError || 'Failed to save to database or filesystem.',
        supabaseError,
        fileError,
      }, { status: 500 });
    }

    const message = supabaseSaved
      ? `Successfully synchronized ${sanitizedList.length} items with Supabase cloud database!`
      : `Saved ${sanitizedList.length} items to local seed file!`;

    return NextResponse.json({
      success: true,
      fileSaved,
      supabaseSaved,
      supabaseError,
      message,
    });
  } catch (err: any) {
    console.error('Save seed fatal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const universe = searchParams.get('universe');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from('franchise_media').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    try {
      revalidatePath('/mcu');
      revalidatePath('/dcu');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, message: `Deleted item ${id} successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
