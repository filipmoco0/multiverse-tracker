'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Zap, CheckCircle2, RotateCcw, CheckSquare, Sparkles, X, Filter, SlidersHorizontal } from 'lucide-react';
import { FranchiseMedia, OrderMode, TypeFilter, StatusFilter, Universe } from '@/lib/types';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { ComicCard } from '@/components/comic/ComicCard';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { ProgressBar } from '@/components/comic/ProgressBar';
import { OrderToggle } from '@/components/filters/OrderToggle';
import { TypeFilterTabs } from '@/components/filters/TypeFilter';
import { StatusFilterTabs } from '@/components/filters/StatusFilter';
import { triggerComicConfetti, triggerGrandCelebration } from '@/components/comic/ConfettiCelebration';
import { MarathonStatsWidget } from '@/components/stats/MarathonStatsWidget';
import { PassportModal } from '@/components/passport/PassportModal';
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
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  const { watchedIds, toggleWatched, markPhaseWatched, markAllWatched, resetProgress, traktUser } = useWatchlistStore();
  const { showMarathonStats, enableConfetti } = useSettingsStore();

  const isMCU = universe === 'mcu';

  // Branch Categories for Marvel
  const marvelBranches = [
    { id: 'all', label: 'All Marvel Multiverse' },
    { id: 'mcu_main', label: 'MCU Timeline (Phases 1–6)', match: (p: string) => p.startsWith('Phase') },
    { id: 'ssu', label: 'Sony Spider-Man (SSU)', match: (p: string) => p.includes('SSU') },
    { id: 'spider_verse', label: 'Spider-Verse & Raimi/Webb', match: (p: string) => p.includes('Spider-Verse') || p.includes('Legacy Spider-Man') },
    { id: 'x_men', label: 'Fox X-Men Universe', match: (p: string) => p.includes('X-Men') },
    { id: 'fox_f4', label: 'Fox Fantastic Four & Daredevil', match: (p: string) => p.includes('Fox Fantastic') },
    { id: 'defenders', label: 'Defenders & TV Saga', match: (p: string) => p.includes('Defenders') || p.includes('Marvel Television') },
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

  // Filter and Sort media
  const filteredAndSortedMedia = useMemo(() => {
    return initialMedia
      .filter((item) => {
        // 1. Branch continuity filter
        if (branchFilter !== 'all') {
          const currentBranch = branches.find((b) => b.id === branchFilter);
          if (currentBranch && currentBranch.match) {
            if (!currentBranch.match(item.phase_or_chapter)) return false;
          }
        }

        // 2. Type filter
        if (typeFilter !== 'all' && item.media_type !== typeFilter) {
          return false;
        }

        // 3. Status filter
        if (statusFilter === 'watched' && !watchedIds[item.id]) {
          return false;
        }
        if (statusFilter === 'unwatched' && watchedIds[item.id]) {
          return false;
        }

        // 4. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchPhase = item.phase_or_chapter.toLowerCase().includes(q);
          const matchOverview = item.overview?.toLowerCase().includes(q);
          if (!matchTitle && !matchPhase && !matchOverview) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (orderMode === 'chronological') {
          const aOrder = a.chronological_order !== null ? a.chronological_order : a.release_order;
          const bOrder = b.chronological_order !== null ? b.chronological_order : b.release_order;
          return aOrder - bOrder;
        } else {
          const aOrder = a.release_order;
          const bOrder = b.release_order;
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

  const handleSingleCardToggle = (
    mediaId: string,
    tmdbId?: number | null,
    traktId?: number | null,
    mediaType?: FranchiseMedia['media_type']
  ) => {
    const isCurrentlyWatched = Boolean(watchedIds[mediaId]);
    toggleWatched(mediaId, tmdbId, traktId, mediaType);

    if (!isCurrentlyWatched && enableConfetti) {
      // Check if this action completes its phase
      const targetItem = initialMedia.find((m) => m.id === mediaId);
      if (targetItem) {
        const phaseItems = initialMedia.filter((m) => m.phase_or_chapter === targetItem.phase_or_chapter);
        const otherItemsWatched = phaseItems
          .filter((m) => m.id !== mediaId)
          .every((m) => Boolean(watchedIds[m.id]));

        if (otherItemsWatched && phaseItems.length >= 1) {
          triggerComicConfetti(universe);
        }
      }

      // Check if entire franchise just completed
      const currentWatchedCount = initialMedia.filter((m) => Boolean(watchedIds[m.id])).length;
      if (currentWatchedCount + 1 >= initialMedia.length && initialMedia.length > 0) {
        triggerGrandCelebration(universe);
      }
    }
  };

  const handlePhaseToggle = (phaseItems: FranchiseMedia[], phaseName: string) => {
    const allCurrentlyWatched = phaseItems.every((item) => watchedIds[item.id]);
    const targetState = !allCurrentlyWatched;
    markPhaseWatched(phaseItems, targetState);

    if (targetState && enableConfetti) {
      triggerComicConfetti(universe);
    }
  };

  const handleFranchiseAllToggle = () => {
    const allCurrentlyWatched = filteredAndSortedMedia.every((item) => watchedIds[item.id]);
    markAllWatched(filteredAndSortedMedia, !allCurrentlyWatched);
    if (!allCurrentlyWatched && enableConfetti) {
      triggerGrandCelebration(universe);
    }
  };

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto px-3.5 sm:px-8 xl:px-12 py-5 sm:py-7 overflow-x-hidden">
      {/* Streamlined Franchise Hero Banner */}
      <section className="relative bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-5 sm:p-7 overflow-hidden">
        <div className={isMCU ? 'absolute inset-0 bg-halftone-marvel opacity-60 pointer-events-none' : 'absolute inset-0 bg-halftone-dc opacity-60 pointer-events-none'} />

        <div className="relative z-10 space-y-5">
          {/* Header Title Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="md">
                  <span className="flex items-center gap-1.5 font-black">
                    {isMCU ? <Flame className="w-4 h-4 text-amber-300" /> : <Zap className="w-4 h-4 text-white" />}
                    {isMCU ? 'MARVEL MULTIVERSE' : 'DC UNIVERSE'}
                  </span>
                </ComicBadge>
                <ComicBadge variant="white" size="sm">
                  {initialMedia.length} Total Titles
                </ComicBadge>
                {franchisePercentage === 100 && (
                  <button
                    onClick={() => triggerGrandCelebration(universe)}
                    className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    title="Click for celebratory fireworks!"
                  >
                    <ComicBadge variant="green" size="md">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> 100% COMPLETED! 🎉
                      </span>
                    </ComicBadge>
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black uppercase text-white tracking-wider">
                {title}
              </h1>
            </div>

            {/* Quick Franchise Actions */}
            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <ComicButton
                onClick={() => setIsPassportOpen(true)}
                variant="cyan"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              >
                Share Passport
              </ComicButton>
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
          <div className="bg-zinc-950 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000]">
            <ProgressBar
              total={totalItems}
              watched={totalWatched}
              label={branchFilter === 'all' ? `${universe.toUpperCase()} Multiverse Progress` : `${branches.find(b => b.id === branchFilter)?.label} Progress`}
              universe={universe}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Optional Marathon Stats (Configured via Settings) */}
      {showMarathonStats && (
        <MarathonStatsWidget
          mediaList={initialMedia}
          watchedIds={watchedIds}
          universe={universe}
        />
      )}

      {/* Unified Compact Filter Toolbar (Static, scrolls naturally with page) */}
      <section className="relative bg-[#0d0e17] border-[3px] border-black shadow-[5px_5px_0px_0px_#000000] p-3.5 sm:p-4 space-y-3">
        {/* Row 1: Continuity Universe Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-display uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Universe:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {branches.map((branch) => {
              const isActive = branchFilter === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => setBranchFilter(branch.id)}
                  className={clsx(
                    'px-2.5 py-1 font-display text-xs font-bold uppercase transition border-2 border-black -skew-x-3 select-none flex-shrink-0 cursor-pointer',
                    isActive
                      ? isMCU
                        ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <span className="inline-block skew-x-3">{branch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Order Toggle + Type + Status + Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <OrderToggle
              orderMode={orderMode}
              onChange={setOrderMode}
              universe={universe}
            />
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

          <div className="relative min-w-[200px] lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${universe.toUpperCase()} titles...`}
              className="w-full bg-zinc-950 border-2 border-black px-3.5 py-1.5 pl-8 text-xs font-sans text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_#000000]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Media Grid Grouped by Phase/Chapter */}
      <div className="space-y-10">
        {groupedMedia.length === 0 ? (
          <div className="p-12 text-center bg-[#141624] border-[3px] border-black shadow-[5px_5px_0px_0px_#000000]">
            <h3 className="font-display font-black text-2xl uppercase text-amber-400 mb-2">
              No Multiverse Media Found
            </h3>
            <p className="text-zinc-400 text-sm font-sans max-w-md mx-auto mb-4">
              Try adjusting your search query, content type, or universe filter tabs above.
            </p>
            <ComicButton
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setBranchFilter('all');
                setSearchQuery('');
              }}
              variant="cyan"
              size="sm"
            >
              Reset Filters
            </ComicButton>
          </div>
        ) : (
          groupedMedia.map((group) => {
            const groupWatchedCount = group.items.filter((item) => watchedIds[item.id]).length;
            const isGroupComplete = groupWatchedCount === group.items.length && group.items.length > 0;

            return (
              <section key={group.phase} className="space-y-4">
                {/* Phase Chapter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#12131e] border-l-[6px] border-l-amber-400 border-y-2 border-r-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-display font-black uppercase text-white tracking-wider">
                      {group.phase}
                    </h2>
                    <ComicBadge variant={isGroupComplete ? 'green' : 'white'} size="sm">
                      {groupWatchedCount} / {group.items.length}
                    </ComicBadge>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePhaseToggle(group.items, group.phase)}
                      className={clsx(
                        'px-2.5 py-1 text-xs font-display font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer',
                        isGroupComplete
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      )}
                    >
                      {isGroupComplete ? 'Unmark Phase' : 'Mark Phase Watched'}
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3.5 sm:gap-4.5">
                  {group.items.map((media) => (
                    <ComicCard
                      key={media.id}
                      media={media}
                      isWatched={Boolean(watchedIds[media.id])}
                      orderMode={orderMode}
                      onToggleWatched={handleSingleCardToggle}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Multiverse Citizen Passport Modal */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        mediaList={initialMedia}
        watchedIds={watchedIds}
        universe={universe}
        userName={traktUser?.username}
      />
    </div>
  );
};
