import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FranchiseMedia, Universe } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { universe, mediaList }: { universe: Universe; mediaList: FranchiseMedia[] } = body;

    if (!universe || !Array.isArray(mediaList)) {
      return NextResponse.json({ error: 'Invalid payload. Universe and mediaList are required.' }, { status: 400 });
    }

    let fileSaved = false;
    let fileError = null;

    // 1. Try to write to local seed file (works in local dev environment)
    try {
      const fileName = universe === 'mcu' ? 'mcu-seed.ts' : 'dcu-seed.ts';
      const varName = universe === 'mcu' ? 'MCU_SEED_DATA' : 'DCU_SEED_DATA';
      const targetPath = path.join(process.cwd(), 'src', 'lib', 'seed', fileName);

      const content = `import { FranchiseMedia } from "../types";\n\nexport const ${varName}: FranchiseMedia[] = ` + JSON.stringify(mediaList, null, 2) + `;\n`;
      fs.writeFileSync(targetPath, content, 'utf8');
      fileSaved = true;
    } catch (fsErr: any) {
      fileError = fsErr.message;
    }

    // 2. If Supabase is configured, upsert all items in chunks of 40
    let supabaseSaved = false;
    let supabaseError = null;

    try {
      const supabase = createAdminClient();
      if (supabase) {
        const chunkSize = 40;
        for (let i = 0; i < mediaList.length; i += chunkSize) {
          const chunk = mediaList.slice(i, i + chunkSize);
          const { error } = await supabase
            .from('franchise_media')
            .upsert(chunk, { onConflict: 'id' });

          if (error) {
            throw error;
          }
        }
        supabaseSaved = true;
      }
    } catch (dbErr: any) {
      supabaseError = dbErr.message;
      console.warn('Supabase upsert error:', dbErr);
    }

    const message = supabaseSaved
      ? `Saved ${mediaList.length} items to Supabase cloud database!`
      : fileSaved
      ? `Saved ${mediaList.length} items to local seed file!`
      : `Saved in current session (Supabase not connected or errored: ${supabaseError || 'No connection'})`;

    return NextResponse.json({
      success: true,
      fileSaved,
      supabaseSaved,
      supabaseError,
      message,
    });
  } catch (err: any) {
    console.error('Save seed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
