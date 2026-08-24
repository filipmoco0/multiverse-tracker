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

    // 1. Try to write to local seed file (works in local dev environment)
    try {
      const fileName = universe === 'mcu' ? 'mcu-seed.ts' : 'dcu-seed.ts';
      const varName = universe === 'mcu' ? 'MCU_SEED_DATA' : 'DCU_SEED_DATA';
      const targetPath = path.join(process.cwd(), 'src', 'lib', 'seed', fileName);

      const content = `import { FranchiseMedia } from "../types";\n\nexport const ${varName}: FranchiseMedia[] = ` + JSON.stringify(mediaList, null, 2) + `;\n`;
      fs.writeFileSync(targetPath, content, 'utf8');
      fileSaved = true;
    } catch (fsErr: any) {
      console.log('Local file write skipped (e.g. read-only serverless environment):', fsErr.message);
    }

    // 2. If Supabase is configured, also upsert to cloud database
    let supabaseSaved = false;
    try {
      const supabase = createAdminClient();
      if (supabase) {
        // Upsert full media list
        const { error } = await supabase
          .from('franchise_media')
          .upsert(mediaList, { onConflict: 'id' });

        if (!error) {
          supabaseSaved = true;
        } else {
          console.warn('Supabase upsert error:', error.message);
        }
      }
    } catch (dbErr: any) {
      console.warn('Supabase sync skipped:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      fileSaved,
      supabaseSaved,
      message: fileSaved
        ? `Successfully saved ${mediaList.length} items to ${universe === 'mcu' ? 'mcu-seed.ts' : 'dcu-seed.ts'} on disk!`
        : supabaseSaved
        ? `Successfully saved ${mediaList.length} items to Supabase cloud database!`
        : `Updated in active admin session.`,
    });
  } catch (err: any) {
    console.error('Save seed error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
