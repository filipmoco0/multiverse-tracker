import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

    // 2. Upsert to Supabase in chunks of 25
    let supabaseSaved = false;
    let supabaseError: string | null = null;

    try {
      const supabase = createAdminClient();
      if (supabase) {
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
      console.error('Supabase upsert failure:', dbErr);
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
      ? `Successfully saved ${sanitizedList.length} items to Supabase cloud database!`
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
