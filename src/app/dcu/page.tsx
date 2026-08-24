import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FranchiseTracklist } from '@/components/tracklist/FranchiseTracklist';
import { getFranchiseMedia } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'DC Universe (DCU) & Elseworlds Watchlist | Multiverse Tracker',
  description: 'Track DCU Chapter 1: Gods and Monsters, the DCEU Era, and Elseworlds films in release and chronological orders.',
};

export default async function DcuPage() {
  const dcuMedia = await getFranchiseMedia('dcu');

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <FranchiseTracklist
          universe="dcu"
          initialMedia={dcuMedia}
          title="DC UNIVERSE & ELSEWORLDS"
          subtitle="Explore the new DCU Chapter 1: Gods and Monsters, the classic DCEU catalogue, and standalone Elseworlds epics."
        />
      </main>
      <Footer />
    </div>
  );
}
