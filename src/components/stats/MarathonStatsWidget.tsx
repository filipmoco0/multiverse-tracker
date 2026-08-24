'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Film,
  Tv,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { FranchiseMedia, Universe } from '@/lib/types';
import { ComicBadge } from '../comic/ComicBadge';
import { clsx } from 'clsx';

interface MarathonStatsWidgetProps {
  mediaList: FranchiseMedia[];
  watchedIds: Record<string, boolean>;
  universe: Universe;
}

export const MarathonStatsWidget: React.FC<MarathonStatsWidgetProps> = ({
  mediaList,
  watchedIds,
  universe,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMCU = universe === 'mcu';

  // 1. Counts breakdown
  const movies = mediaList.filter((m) => m.media_type === 'movie');
  const shows = mediaList.filter((m) => m.media_type === 'show');
  const specials = mediaList.filter((m) => m.media_type === 'special');

  const watchedMovies = movies.filter((m) => Boolean(watchedIds[m.id])).length;
  const watchedShows = shows.filter((m) => Boolean(watchedIds[m.id])).length;
  const watchedSpecials = specials.filter((m) => Boolean(watchedIds[m.id])).length;

  const totalTitles = mediaList.length;
  const totalWatched = Object.values(mediaList).filter((m) => Boolean(watchedIds[m.id])).length;
  const overallPercentage = totalTitles > 0 ? Math.round((totalWatched / totalTitles) * 100) : 0;

  // 2. Runtime calculation (in minutes)
  const calculateTotalMinutes = () => {
    let totalMinutes = 0;
    mediaList.forEach((item) => {
      if (watchedIds[item.id]) {
        if (item.media_type === 'movie') {
          totalMinutes += 128; // Average superhero movie runtime ~2h 8m
        } else if (item.media_type === 'show') {
          const epCount = item.episodes || (item.seasons ? item.seasons * 6 : 6);
          totalMinutes += epCount * 45; // ~45 min per episode
        } else if (item.media_type === 'special') {
          totalMinutes += 52;
        }
      }
    });
    return totalMinutes;
  };

  const watchedMinutes = calculateTotalMinutes();
  const watchedHours = Math.floor(watchedMinutes / 60);
  const remainingMinutes = watchedMinutes % 60;
  const watchedDays = (watchedHours / 24).toFixed(1);

  // 3. Superhero Rank System
  const getSuperheroRank = () => {
    if (isMCU) {
      if (overallPercentage === 0) return { title: 'Civilian', subtitle: 'Daily Bugle Reader', icon: '👤', color: 'text-zinc-400', badge: 'white' as const };
      if (overallPercentage <= 15) return { title: 'S.H.I.E.L.D. Recruit', subtitle: 'Level 1 Clearance', icon: '🛡️', color: 'text-cyan-400', badge: 'cyan' as const };
      if (overallPercentage <= 35) return { title: 'Street-Level Hero', subtitle: 'Defender of New York', icon: '🕸️', color: 'text-amber-400', badge: 'gold' as const };
      if (overallPercentage <= 60) return { title: 'Official Avenger', subtitle: "Earth's Mightiest Hero", icon: '🦸‍♂️', color: 'text-marvel-crimson', badge: 'marvel' as const };
      if (overallPercentage <= 85) return { title: 'Sorcerer Supreme', subtitle: 'Master of the Mystic Arts', icon: '✨', color: 'text-purple-400', badge: 'gold' as const };
      if (overallPercentage < 100) return { title: 'Multiverse Guardian', subtitle: 'Nexus Being', icon: '🪐', color: 'text-emerald-400', badge: 'green' as const };
      return { title: 'The One Above All', subtitle: '100% Multiverse Master', icon: '👑', color: 'text-amber-300', badge: 'gold' as const };
    } else {
      if (overallPercentage === 0) return { title: 'Gotham Citizen', subtitle: 'Watching the Skies', icon: '👤', color: 'text-zinc-400', badge: 'white' as const };
      if (overallPercentage <= 15) return { title: 'GCPD Detective', subtitle: 'Badge #1939', icon: '🚨', color: 'text-cyan-400', badge: 'cyan' as const };
      if (overallPercentage <= 35) return { title: 'Bat-Family Vigilante', subtitle: 'Knight of Gotham', icon: '🦇', color: 'text-amber-400', badge: 'gold' as const };
      if (overallPercentage <= 60) return { title: 'Justice League Member', subtitle: 'Hall of Justice', icon: '⚡', color: 'text-[#005792]', badge: 'dc' as const };
      if (overallPercentage <= 85) return { title: 'Green Lantern Corps', subtitle: 'Sector 2814 Guardian', icon: '💚', color: 'text-emerald-400', badge: 'green' as const };
      if (overallPercentage < 100) return { title: 'Speed Force Champion', subtitle: 'Crisis Survivor', icon: '🌀', color: 'text-cyan-300', badge: 'cyan' as const };
      return { title: 'Prime Earth Legend', subtitle: '100% DC Universe Master', icon: '👑', color: 'text-amber-300', badge: 'gold' as const };
    }
  };

  const currentRank = getSuperheroRank();

  return (
    <div className="bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-white">
      {/* Header Bar with Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 sm:p-5 bg-zinc-950 border-b-[3px] border-black cursor-pointer select-none hover:bg-zinc-900 transition"
      >
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'p-2 border-2 border-black -skew-x-6 font-black text-black flex items-center justify-center',
              isMCU ? 'bg-[#E62429] text-white' : 'bg-[#005792] text-white'
            )}
          >
            <Clock className="w-5 h-5 skew-x-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                Marathon Stats & Rank
              </h3>
              <ComicBadge variant={currentRank.badge} size="sm">
                {currentRank.icon} {currentRank.title}
              </ComicBadge>
            </div>
            <p className="text-xs text-zinc-400 font-sans hidden sm:block">
              {totalWatched} of {totalTitles} titles watched • {watchedHours} hours logged
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display font-black text-xl text-amber-400">
            {overallPercentage}%
          </span>
          <button className="p-1 bg-zinc-800 border-2 border-black text-zinc-300 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Stats Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 space-y-6">
              {/* Top Row: Rank Card + Watch Time Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Superhero Rank Card */}
                <div className="bg-[#161824] border-[3px] border-black p-4.5 shadow-[4px_4px_0px_0px_#000000] flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-950 border-[3px] border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000000] -skew-x-3">
                    {currentRank.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-display uppercase tracking-widest text-zinc-400">
                      Current Superhero Rank
                    </span>
                    <h4 className={clsx('font-display font-black text-xl sm:text-2xl uppercase leading-none', currentRank.color)}>
                      {currentRank.title}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans font-semibold">
                      {currentRank.subtitle}
                    </p>
                  </div>
                </div>

                {/* 2. Total Watch Time Card */}
                <div className="bg-[#161824] border-[3px] border-black p-4.5 shadow-[4px_4px_0px_0px_#000000] flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-950 border-[3px] border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#000000] -skew-x-3">
                    ⏱️
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-display uppercase tracking-widest text-zinc-400">
                      Total Time Watched
                    </span>
                    <h4 className="font-display font-black text-xl sm:text-2xl uppercase leading-none text-cyan-400">
                      {watchedHours} Hours {remainingMinutes > 0 ? `${remainingMinutes}m` : ''}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans font-semibold">
                      Equivalent to <strong className="text-white">{watchedDays} days</strong> of continuous superhero movies!
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Row: Breakdown by Type (Movies, Shows, Specials) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Movies Count */}
                <div className="bg-zinc-950 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Film className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="block text-[10px] font-display uppercase text-zinc-400">Movies</span>
                      <strong className="text-sm font-display text-white">
                        {watchedMovies} / {movies.length}
                      </strong>
                    </div>
                  </div>
                  <ComicBadge variant={watchedMovies === movies.length && movies.length > 0 ? 'green' : 'dark'} size="sm">
                    {movies.length > 0 ? Math.round((watchedMovies / movies.length) * 100) : 0}%
                  </ComicBadge>
                </div>

                {/* TV Shows Count */}
                <div className="bg-zinc-950 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="block text-[10px] font-display uppercase text-zinc-400">TV Series</span>
                      <strong className="text-sm font-display text-white">
                        {watchedShows} / {shows.length}
                      </strong>
                    </div>
                  </div>
                  <ComicBadge variant={watchedShows === shows.length && shows.length > 0 ? 'green' : 'dark'} size="sm">
                    {shows.length > 0 ? Math.round((watchedShows / shows.length) * 100) : 0}%
                  </ComicBadge>
                </div>

                {/* Specials Count */}
                <div className="bg-zinc-950 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="block text-[10px] font-display uppercase text-zinc-400">Specials & Shorts</span>
                      <strong className="text-sm font-display text-white">
                        {watchedSpecials} / {specials.length}
                      </strong>
                    </div>
                  </div>
                  <ComicBadge variant={watchedSpecials === specials.length && specials.length > 0 ? 'green' : 'dark'} size="sm">
                    {specials.length > 0 ? Math.round((watchedSpecials / specials.length) * 100) : 0}%
                  </ComicBadge>
                </div>
              </div>

              {/* Bottom Progress Bar with Milestone Markers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider text-zinc-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Multiverse Mastery
                  </span>
                  <span className="text-amber-300 font-bold">{totalWatched} / {totalTitles} Titles Complete</span>
                </div>

                <div className="relative h-4 bg-zinc-950 border-2 border-black shadow-[2px_2px_0px_0px_#000000] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={clsx(
                      'h-full transition-all',
                      isMCU
                        ? 'bg-gradient-to-r from-amber-500 via-[#E62429] to-red-600'
                        : 'bg-gradient-to-r from-cyan-500 via-[#005792] to-blue-600'
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
