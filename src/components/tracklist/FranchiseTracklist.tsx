'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Zap, CheckCircle2, RotateCcw, CheckSquare, Sparkles, X, Filter } from 'lucide-react';
import { FranchiseMedia, OrderMode, TypeFilter, StatusFilter, Universe } from '@/lib/types';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { ComicCard } from '@/components/comic/ComicCard';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { ProgressBar } from '@/components/comic/ProgressBar';
import { OrderToggle } from '@/components/filters/OrderToggle';
import { TypeFilterTabs } from '@/components/filters/TypeFilter';
import { StatusFilterTabs } from '@/components/filters/StatusFilter';
import { triggerComicConfetti } from '@/components/comic/ConfettiCelebration';
import { clsx } from 'clsx';

interface FranchiseTracklistProps {
  universe: Universe;
  initialMedia: FranchiseMedia[];
  title: string;
  subtitle: string;
}

export const FranchiseTracklist: React.FC<FranchiseTracklistProps> = ({
  universe,
  initialMedia,
  title,
  subtitle,
}) => {
  const [orderMode, setOrderMode] = useState<OrderMode>('release');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { watchedIds, toggleWatched, markPhaseWatched, markAllWatched, resetProgress } = useWatchlistStore();

  const isMCU = universe === 'mcu';

  // Branch Categories for Marvel
  const marvelBranches = [
    { id: 'all', label: 'All Marvel Multiverse' },
    { id: 'mcu_main', label: 'MCU Sacred Timeline (Phases 1–6)', match: (p: string) => p.startsWith('Phase') },
    { id: 'ssu', label: 'Sony Spider-Man (SSU)', match: (p: string) => p.includes('SSU') },
    { id: 'spider_verse', label: 'Spider-Verse & Raimi/Webb', match: (p: string) => p.includes('Spider-Verse') || p.includes('Legacy Spider-Man') },
    { id: 'x_men', label: 'Fox X-Men Universe', match: (p: string) => p.includes('X-Men') },
    { id: 'fox_f4', label: 'Fox Fantastic Four & Daredevil', match: (p: string) => p.includes('Fox Fantastic') },
    { id: 'defenders', label: 'Marvel Television & Defenders Saga', match: (p: string) => p.includes('Defenders') || p.includes('Marvel Television') },
    { id: 'legacy', label: 'Marvel Legacy Standalone', match: (p: string) => p.includes('Marvel Legacy') },
  ];

  // Branch Categories for DC
  const dcuBranches = [
    { id: 'all', label: 'All DC Multiverse' },
    { id: 'chapter_1', label: 'Chapter 1: Gods & Monsters', match: (p: string) => p.includes('Chapter 1') },
    { id: 'dceu', label: 'DCEU Era (Snyderverse)', match: (p: string) => p.includes('DCEU') },
    { id: 'elseworlds', label: 'DC Elseworlds (Batman, Joker)', match: (p: string) => p.includes('Elseworlds') },
  ];

  const branches = isMCU ? marvelBranches : dcuBranches;

  // Filter and sort items
  const filteredAndSortedMedia = useMemo(() => {
    return initialMedia
      .filter((item) => {
        // Branch sub-universe filter
        if (branchFilter !== 'all') {
          const branch = branches.find((b) => b.id === branchFilter);
          if (branch && branch.match && !branch.match(item.phase_or_chapter)) {
            return false;
          }
        }

        // Media type filter
        if (typeFilter !== 'all' && item.media_type !== typeFilter) return false;

        // Watch status filter
        const isWatched = Boolean(watchedIds[item.id]);
        if (statusFilter === 'watched' && !isWatched) return false;
        if (statusFilter === 'unwatched' && isWatched) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchOverview = item.overview?.toLowerCase().includes(q);
          const matchPhase = item.phase_or_chapter.toLowerCase().includes(q);
          if (!matchTitle && !matchOverview && !matchPhase) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (orderMode === 'release') {
          return a.release_order - b.release_order;
        } else {
          const aOrder = a.chronological_order ?? 9999;
          const bOrder = b.chronological_order ?? 9999;
          return aOrder - bOrder;
        }
      });
  }, [initialMedia, typeFilter, statusFilter, branchFilter, searchQuery, orderMode, watchedIds, branches]);

  // Overall progress calculation based on active branch selection
  const totalItems = filteredAndSortedMedia.length;
  const totalWatched = useMemo(() => {
    return filteredAndSortedMedia.filter((item) => Boolean(watchedIds[item.id])).length;
  }, [filteredAndSortedMedia, watchedIds]);

  const franchisePercentage = totalItems > 0 ? Math.round((totalWatched / totalItems) * 100) : 0;

  // Group media by Phase/Chapter
  const groupedMedia = useMemo(() => {
    if (orderMode === 'chronological') {
      return [{ phase: 'Chronological Multiverse Timeline', items: filteredAndSortedMedia }];
    }

    const groups: { phase: string; items: FranchiseMedia[] }[] = [];
    const phaseOrder = Array.from(new Set(initialMedia.map((m) => m.phase_or_chapter)));

    phaseOrder.forEach((phaseName) => {
      const phaseItems = filteredAndSortedMedia.filter((m) => m.phase_or_chapter === phaseName);
      if (phaseItems.length > 0) {
        groups.push({ phase: phaseName, items: phaseItems });
      }
    });

    return groups;
  }, [filteredAndSortedMedia, initialMedia, orderMode]);

  const handlePhaseToggle = (phaseItems: FranchiseMedia[], phaseName: string) => {
    const allCurrentlyWatched = phaseItems.every((item) => watchedIds[item.id]);
    const targetState = !allCurrentlyWatched;
    markPhaseWatched(phaseItems, targetState);

    if (targetState) {
      triggerComicConfetti(universe);
    }
  };

  const handleFranchiseAllToggle = () => {
    const allCurrentlyWatched = filteredAndSortedMedia.every((item) => watchedIds[item.id]);
    markAllWatched(filteredAndSortedMedia, !allCurrentlyWatched);
    if (!allCurrentlyWatched) {
      triggerComicConfetti(universe);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Franchise Hero Banner */}
      <section className="relative bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-8 overflow-hidden">
        {/* Background Halftone Pattern */}
        <div className={isMCU ? 'absolute inset-0 bg-halftone-marvel opacity-60 pointer-events-none' : 'absolute inset-0 bg-halftone-dc opacity-60 pointer-events-none'} />

        <div className="relative z-10 space-y-6">
          {/* Header Title Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="md">
                  <span className="flex items-center gap-1.5 font-black">
                    {isMCU ? <Flame className="w-4 h-4 text-amber-300" /> : <Zap className="w-4 h-4 text-white" />}
                    {isMCU ? 'MARVEL MULTIVERSE & MCU' : 'DC UNIVERSE & ELSEWORLDS'}
                  </span>
                </ComicBadge>
                <ComicBadge variant="white" size="sm">
                  {initialMedia.length} Total Titles
                </ComicBadge>
                {franchisePercentage === 100 && (
                  <ComicBadge variant="green" size="md">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> 100% COMPLETED!
                    </span>
                  </ComicBadge>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-white tracking-wider">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans max-w-xl">
                {subtitle}
              </p>
            </div>

            {/* Quick Franchise Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <ComicButton
                onClick={handleFranchiseAllToggle}
                variant={totalWatched === totalItems && totalItems > 0 ? 'danger' : 'gold'}
                size="sm"
                leftIcon={<CheckSquare className="w-4 h-4" />}
              >
                {totalWatched === totalItems && totalItems > 0 ? 'Reset Filtered' : 'Mark Filtered Watched'}
              </ComicButton>
              <ComicButton
                onClick={() => resetProgress(universe)}
                variant="dark"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4 text-zinc-400" />}
                title="Reset universe progress"
              >
                Clear
              </ComicButton>
            </div>
          </div>

          {/* Overall Global Progress HP Bar */}
          <div className="bg-zinc-950 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000] space-y-2">
            <ProgressBar
              total={totalItems}
              watched={totalWatched}
              label={branchFilter === 'all' ? `${universe.toUpperCase()} Full Multiverse Progress` : `${branches.find(b => b.id === branchFilter)?.label} Progress`}
              universe={universe}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Universe Branch Filter Tabs */}
      <section className="bg-[#10121d] border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000000] space-y-2">
        <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Multiverse Universes & Continuities:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {branches.map((branch) => {
            const isActive = branchFilter === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setBranchFilter(branch.id)}
                className={clsx(
                  'px-3 py-1 font-display text-xs sm:text-sm font-bold uppercase transition border-2 border-black -skew-x-3 select-none cursor-pointer',
                  isActive
                    ? isMCU
                      ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-[1px_1px_0px_0px_#000000]'
                )}
              >
                <span className="inline-block skew-x-3">{branch.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Control / Filter Bar */}
      <section className="sticky top-20 z-30 bg-[#0d0e17]/95 backdrop-blur-md border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Order Mode Toggle */}
        <div className="flex items-center">
          <OrderToggle
            orderMode={orderMode}
            onChange={setOrderMode}
            universe={universe}
          />
        </div>

        {/* Center: Type and Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <TypeFilterTabs
            currentType={typeFilter}
            onChange={setTypeFilter}
            universe={universe}
          />
          <StatusFilterTabs
            currentStatus={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Right: Search Input */}
        <div className="relative flex-1 lg:max-w-xs">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movie, show, or hero..."
              className="w-full bg-zinc-950 border-2 border-black px-3.5 py-1.5 pl-9 text-xs sm:text-sm text-white placeholder-zinc-500 font-sans focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_#000000]"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tracklist Groups / Media Cards Grid */}
      <div className="space-y-12">
        {groupedMedia.length === 0 ? (
          <div className="text-center py-20 bg-[#161824] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] p-8 space-y-4">
            <p className="text-xl font-display uppercase text-zinc-400">
              No titles match your active filters
            </p>
            <ComicButton
              onClick={() => {
                setBranchFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              variant="gold"
              size="sm"
            >
              Reset All Filters
            </ComicButton>
          </div>
        ) : (
          groupedMedia.map((group) => {
            const phaseTotal = group.items.length;
            const phaseWatched = group.items.filter((item) => Boolean(watchedIds[item.id])).length;
            const isPhaseComplete = phaseTotal > 0 && phaseWatched === phaseTotal;

            return (
              <section key={group.phase} className="space-y-4">
                {/* Phase / Chapter Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161824] border-[3px] border-black p-3.5 shadow-[4px_4px_0px_0px_#000000]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <ComicBadge
                      variant={isPhaseComplete ? 'green' : isMCU ? 'marvel' : 'cyan'}
                      size="md"
                    >
                      {group.phase}
                    </ComicBadge>
                    <span className="text-xs font-sans text-zinc-400">
                      <strong className="text-white font-display text-sm">{phaseWatched}</strong> / {phaseTotal} watched
                    </span>
                  </div>

                  {/* Batch Mark Phase Action */}
                  <div className="flex items-center gap-2">
                    <ComicButton
                      onClick={() => handlePhaseToggle(group.items, group.phase)}
                      variant={isPhaseComplete ? 'danger' : 'gold'}
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      {isPhaseComplete ? 'Unmark Section' : 'Mark Section Watched'}
                    </ComicButton>
                  </div>
                </div>

                {/* Phase Mini Progress Meter */}
                <div className="w-full bg-zinc-950 h-2 border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
                  <div
                    className={
                      isMCU
                        ? 'bg-gradient-to-r from-amber-400 to-marvel-crimson h-full transition-all duration-300'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300'
                    }
                    style={{ width: `${(phaseWatched / phaseTotal) * 100}%` }}
                  />
                </div>

                {/* Responsive Media Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((media) => (
                      <ComicCard
                        key={media.id}
                        media={media}
                        isWatched={Boolean(watchedIds[media.id])}
                        orderMode={orderMode}
                        onToggleWatched={toggleWatched}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
