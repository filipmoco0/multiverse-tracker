'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Zap, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { MCU_SEED_DATA } from '@/lib/seed/mcu-seed';
import { DCU_SEED_DATA } from '@/lib/seed/dcu-seed';

export default function UniverseSelectPage() {
  const [hoveredUniverse, setHoveredUniverse] = useState<'mcu' | 'dcu' | null>(null);
  const { watchedIds } = useWatchlistStore();

  const mcuWatchedCount = MCU_SEED_DATA.filter((m) => watchedIds[m.id]).length;
  const mcuTotal = MCU_SEED_DATA.length;
  const mcuPct = mcuTotal > 0 ? Math.round((mcuWatchedCount / mcuTotal) * 100) : 0;

  const dcuWatchedCount = DCU_SEED_DATA.filter((d) => watchedIds[d.id]).length;
  const dcuTotal = DCU_SEED_DATA.length;
  const dcuPct = dcuTotal > 0 ? Math.round((dcuWatchedCount / dcuTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Comic Gate Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <ComicBadge variant="gold" size="sm">UNIVERSE GATE</ComicBadge>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-wider uppercase text-white">
            CHOOSE YOUR <span className="text-amber-400">TIMELINE</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
            Select a universe to inspect releases, explore multiverse branches, and track your progress.
          </p>
        </div>

        {/* Split Screen Comic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 flex-1 min-h-[480px]">
          {/* MARVEL MCU PANEL */}
          <motion.div
            onMouseEnter={() => setHoveredUniverse('mcu')}
            onMouseLeave={() => setHoveredUniverse(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'relative bg-[#16131c] bg-halftone-marvel border-[4px] border-black p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300',
              hoveredUniverse === 'mcu'
                ? 'shadow-[8px_8px_0px_0px_#E62429] ring-2 ring-marvel-crimson'
                : 'shadow-[6px_6px_0px_0px_#000000]'
            )}
          >
            {/* Background Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-marvel-crimson/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <ComicBadge variant="marvel" size="md">
                  <span className="flex items-center gap-1.5 font-black">
                    <Flame className="w-4 h-4 text-amber-300" />
                    MARVEL MULTIVERSE & MCU
                  </span>
                </ComicBadge>
                <span className="font-display text-sm text-amber-400 font-bold">
                  {mcuTotal} Titles • 8 Branches
                </span>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
                  THE EXPANDED <span className="text-marvel-crimson">MULTIVERSE</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-3 leading-relaxed">
                  Track the MCU Sacred Timeline (Phases 1–6), Sony’s Spider-Verse & SSU, Fox’s X-Men & Fantastic Four, The Defenders Saga, and classic Marvel Legacy films.
                </p>
              </div>

              {/* Stats & Progress Pill */}
              <div className="bg-zinc-950/80 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between text-xs font-display">
                  <span className="text-zinc-400 uppercase">Your Marvel Progress</span>
                  <span className="text-amber-400 font-bold">{mcuWatchedCount} / {mcuTotal} ({mcuPct}%)</span>
                </div>
                <div className="w-full bg-zinc-800 h-3 border border-black overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-marvel-crimson h-full transition-all duration-500"
                    style={{ width: `${mcuPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-6 relative z-10">
              <Link href="/mcu" className="block w-full">
                <ComicButton
                  variant="marvel"
                  size="lg"
                  className="w-full justify-between"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Enter Marvel Multiverse
                </ComicButton>
              </Link>
            </div>
          </motion.div>

          {/* DC UNIVERSE PANEL */}
          <motion.div
            onMouseEnter={() => setHoveredUniverse('dcu')}
            onMouseLeave={() => setHoveredUniverse(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'relative bg-[#0d1624] bg-halftone-dc border-[4px] border-black p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300',
              hoveredUniverse === 'dcu'
                ? 'shadow-[8px_8px_0px_0px_#00EAFF] ring-2 ring-cyan-400'
                : 'shadow-[6px_6px_0px_0px_#000000]'
            )}
          >
            {/* Background Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <ComicBadge variant="cyan" size="md">
                  <span className="flex items-center gap-1.5 font-black">
                    <Zap className="w-4 h-4 text-black" />
                    DC UNIVERSE & ELSEWORLDS
                  </span>
                </ComicBadge>
                <span className="font-display text-sm text-cyan-300 font-bold">
                  {dcuTotal} Titles • Chapter 1 & DCEU
                </span>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
                  GODS & <span className="text-cyan-400">MONSTERS</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans mt-3 leading-relaxed">
                  Track the Snyderverse & DCEU legacy, James Gunn’s new DCU Chapter 1 canon, and standalone Elseworlds epics (The Batman & Joker).
                </p>
              </div>

              {/* Stats & Progress Pill */}
              <div className="bg-zinc-950/80 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between text-xs font-display">
                  <span className="text-zinc-400 uppercase">Your DCU Progress</span>
                  <span className="text-cyan-400 font-bold">{dcuWatchedCount} / {dcuTotal} ({dcuPct}%)</span>
                </div>
                <div className="w-full bg-zinc-800 h-3 border border-black overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${dcuPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-6 relative z-10">
              <Link href="/dcu" className="block w-full">
                <ComicButton
                  variant="dc"
                  size="lg"
                  className="w-full justify-between bg-[#005792]"
                  rightIcon={<ArrowRight className="w-5 h-5 text-white" />}
                >
                  Enter DC Timeline
                </ComicButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
