import React from 'react';
import Link from 'next/link';
import { Heart, Film, Shield, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t-[3px] border-black bg-[#0a0b10] text-zinc-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-white tracking-wider">
              MULTIVERSE <span className="text-amber-400">TRACKER</span>
            </span>
            <span className="text-[10px] uppercase font-display bg-zinc-800 text-zinc-300 px-2 py-0.5 border border-black">
              Zero DB Footprint
            </span>
          </div>
          <p className="text-xs text-zinc-500 max-w-md font-sans">
            Curated progress tracker for the Marvel Cinematic Universe and DC Universe. Instant local storage and free cloud sync.
          </p>
        </div>

        {/* Quick Universe Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-display uppercase font-bold tracking-wider">
          <Link href="/mcu" className="text-zinc-300 hover:text-marvel-crimson transition">
            Marvel Timeline
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/dcu" className="text-zinc-300 hover:text-[#00EAFF] transition">
            DC Universe Timeline
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/select" className="text-zinc-300 hover:text-amber-400 transition">
            Universe Gate
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/admin" className="text-zinc-300 hover:text-amber-400 transition">
            Curator Admin
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-center md:text-right text-[11px] text-zinc-600 space-y-1">
          <p>Not affiliated with Marvel Studios, Disney, DC Studios, or Warner Bros. Discovery.</p>
          <p>Movie metadata and artwork powered by The Movie Database (TMDB).</p>
        </div>
      </div>
    </footer>
  );
};
