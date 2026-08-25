import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FranchiseTracklist } from '@/components/tracklist/FranchiseTracklist';
import { getFranchiseMedia } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Marvel MCU',
  description: 'Track all MCU Phases 1 to 6, Disney+ series, and Special Presentations in release and chronological orders.',
};

export default async function McuPage() {
  const mcuMedia = await getFranchiseMedia('mcu');

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <FranchiseTracklist
          universe="mcu"
          initialMedia={mcuMedia}
          title="MARVEL CINEMATIC UNIVERSE"
          subtitle="Track Earth’s Mightiest Heroes from Phase 1 through the Multiverse Saga with release order or canonical in-universe chronological timelines."
        />
      </main>
      <Footer />
    </div>
  );
}
