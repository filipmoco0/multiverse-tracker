'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Zap, CheckCircle2, RotateCcw, CheckSquare, Sparkles, X, Filter, SlidersHorizontal, Coffee, Heart } from 'lucide-react';
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
import { MilestoneDonationModal, MilestoneData } from '@/components/comic/MilestoneDonationModal';
import { decodeSharedProgress, SharedProgressData } from '@/lib/utils/share-progress';
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
  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>(null);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [sharedData, setSharedData] = useState<SharedProgressData | null>(null);
  const [isViewingShared, setIsViewingShared] = useState(false);

  const { watchedIds, toggleWatched, markPhaseWatched, markAllWatched, resetProgress, supabaseUser } = useWatchlistStore();
  const { showMarathonStats, enableConfetti, hideOneShots } = useSettingsStore();

  // Hydrate persisted filters on client mount
  useEffect(() => {
    try {
      const savedBranch = localStorage.getItem(`multiverse_${universe}_branch_filter`);
      if (savedBranch) setBranchFilter(savedBranch);

      const savedOrder = localStorage.getItem(`multiverse_${universe}_order_mode`) as OrderMode;
      if (savedOrder && (savedOrder === 'release' || savedOrder === 'chronological')) setOrderMode(savedOrder);

      const savedType = localStorage.getItem(`multiverse_${universe}_type_filter`) as TypeFilter;
      if (savedType) setTypeFilter(savedType);

      const savedStatus = localStorage.getItem(`multiverse_${universe}_status_filter`) as StatusFilter;
      if (savedStatus) setStatusFilter(savedStatus);
    } catch {}
  }, [universe]);

  const handleBranchChange = useCallback((branchId: string) => {
    setBranchFilter(branchId);
    try {
      localStorage.setItem(`multiverse_${universe}_branch_filter`, branchId);
    } catch {}
  }, [universe]);

  const handleOrderChange = useCallback((mode: OrderMode) => {
    setOrderMode(mode);
    try {
      localStorage.setItem(`multiverse_${universe}_order_mode`, mode);
    } catch {}
  }, [universe]);

  const handleTypeChange = useCallback((type: TypeFilter) => {
    setTypeFilter(type);
    try {
      localStorage.setItem(`multiverse_${universe}_type_filter`, type);
    } catch {}
  }, [universe]);

  const handleStatusChange = useCallback((status: StatusFilter) => {
    setStatusFilter(status);
    try {
      localStorage.setItem(`multiverse_${universe}_status_filter`, status);
    } catch {}
  }, [universe]);

  // Detect shared progress URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedToken = urlParams.get('shared');
    if (sharedToken) {
      const decoded = decodeSharedProgress(sharedToken, initialMedia);
      if (decoded) {
        setSharedData(decoded);
        setIsViewingShared(true);
      }
    }
  }, [initialMedia]);

  // Effective watched status (switches to shared user's watchlist in shared view)
  const activeWatchedIds = isViewingShared && sharedData ? sharedData.sharedWatchedIds : watchedIds;

  const isMCU = universe === 'mcu';

  // Branch Categories — memoized so array identity is stable across re-renders
  const marvelBranches = useMemo(() => [
    { id: 'all', label: 'All Marvel Multiverse' },
    { id: 'mcu_main', label: 'MCU Timeline (Phases 1–6)', match: (p: string) => p.startsWith('Phase') },
    { id: 'ssu', label: 'Sony Spider-Man (SSU)', match: (p: string) => p.includes('SSU') },
    { id: 'spider_verse', label: 'Spider-Verse & Raimi/Webb', match: (p: string) => p.includes('Spider-Verse') || p.includes('Legacy Spider-Man') },
    { id: 'x_men', label: 'Fox X-Men Universe', match: (p: string) => p.includes('X-Men') },
    { id: 'fox_f4', label: 'Fox Fantastic Four & Daredevil', match: (p: string) => p.includes('Fox Fantastic') },
    { id: 'defenders', label: 'Defenders & TV Saga', match: (p: string) => p.includes('Defenders') || p.includes('Marvel Television') },
    { id: 'legacy', label: 'Marvel Legacy Standalone', match: (p: string) => p.includes('Marvel Legacy') },
  ], []);

  const dcuBranches = useMemo(() => [
    { id: 'all', label: 'All DC Multiverse' },
    { id: 'chapter_1', label: 'DCU (Chapter 1: Gods & Monsters)', match: (p: string) => p.includes('Chapter 1') },
    { id: 'dceu', label: 'DCEU Era (Snyderverse)', match: (p: string) => p.includes('DCEU') },
    { id: 'arrowverse', label: 'The Arrowverse (CW)', match: (p: string) => p.includes('Arrowverse') },
    { id: 'hellerverse', label: 'The Hellerverse (Gotham & Pennyworth)', match: (p: string) => p.includes('Hellerverse') },
    { id: 'classic_vintage', label: 'Classic DC (Vintage Era 1952–1990)', match: (p: string) => p.includes('Classic DC') },
    { id: 'modern_elseworlds', label: 'Modern Elseworlds & Vertigo', match: (p: string) => p.includes('Modern DC Elseworlds') },
    { id: 'dcamu', label: 'DCAMU (New 52 Animated)', match: (p: string) => p.includes('DC Animated Movie Universe') },
    { id: 'tomorrowverse', label: 'The Tomorrowverse', match: (p: string) => p.includes('Tomorrowverse') },
    { id: 'elseworlds', label: 'Elseworlds Cinema (Reeves, Joker, Nolan, Burton, Donner)', match: (p: string) => p.includes('Reeves') || p.includes('Joker') || p.includes('Dark Knight') || p.includes('Burton') || p.includes('Donnerverse') || p.includes('Smallville') || p.includes('Young Justice') || p.includes('Arkham') || p.includes('Injustice') },
  ], []);

  const branches = isMCU ? marvelBranches : dcuBranches;

  const currentBranchObj = useMemo(() => branches.find((b) => b.id === branchFilter), [branches, branchFilter]);
  const activeScopeName = branchFilter === 'all' ? (isMCU ? 'Marvel Multiverse' : 'DC Multiverse') : (currentBranchObj?.label || 'Universe');

  // Media list scoped to active continuity branch (controls Marathon Stats & Passport completion calculations)
  const activeBranchMedia = useMemo(() => {
    let base = initialMedia;
    if (branchFilter !== 'all') {
      if (currentBranchObj && currentBranchObj.match) {
        base = base.filter((item) => currentBranchObj.match!(item.phase_or_chapter));
      }
    }
    if (isMCU && hideOneShots) {
      base = base.filter((item) => item.media_type !== 'special');
    }
    return base;
  }, [initialMedia, branchFilter, currentBranchObj, isMCU, hideOneShots]);

  // Filter and Sort media
  const filteredAndSortedMedia = useMemo(() => {
    return initialMedia
      .filter((item) => {
        // 0. Hide One-Shots / Shorts setting (unless user explicitly filters by 'special')
        if (isMCU && hideOneShots && typeFilter !== 'special' && item.media_type === 'special') {
          return false;
        }

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
        if (statusFilter === 'watched' && !activeWatchedIds[item.id]) {
          return false;
        }
        if (statusFilter === 'unwatched' && activeWatchedIds[item.id]) {
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
  }, [initialMedia, typeFilter, statusFilter, branchFilter, searchQuery, orderMode, activeWatchedIds, branches]);

  // Overall progress calculation based on active branch selection
  const totalItems = filteredAndSortedMedia.length;
  const totalWatched = useMemo(() => {
    return filteredAndSortedMedia.filter((item) => Boolean(activeWatchedIds[item.id])).length;
  }, [filteredAndSortedMedia, activeWatchedIds]);

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

  // Smart Milestone Triggering (Throttled & Non-Intrusive)
  const maybeTriggerMilestone = useCallback((data: MilestoneData) => {
    try {
      const lastShown = localStorage.getItem('multiverse_last_milestone_shown');
      const now = Date.now();
      // Throttle: Max 1 milestone celebration prompt per 24 hours
      if (lastShown && now - parseInt(lastShown, 10) < 24 * 60 * 60 * 1000) {
        return;
      }

      const shownKeys = JSON.parse(localStorage.getItem('multiverse_shown_milestone_keys') || '[]');
      if (shownKeys.includes(data.milestoneKey)) {
        return;
      }

      shownKeys.push(data.milestoneKey);
      localStorage.setItem('multiverse_shown_milestone_keys', JSON.stringify(shownKeys));
      localStorage.setItem('multiverse_last_milestone_shown', now.toString());

      // Open milestone modal with natural celebratory timing
      setTimeout(() => {
        setMilestoneData(data);
        setIsMilestoneOpen(true);
      }, 700);
    } catch {}
  }, []);

  const handleSingleCardToggle = useCallback((
    mediaId: string,
    tmdbId?: number | null,
    traktId?: number | null,
    mediaType?: FranchiseMedia['media_type'],
    seasonNumber?: number | number[] | null
  ) => {
    const isCurrentlyWatched = Boolean(watchedIds[mediaId]);
    toggleWatched(mediaId, tmdbId, traktId, mediaType, seasonNumber);

    if (!isCurrentlyWatched) {
      if (enableConfetti) {
        // Check if this action completes its phase
        const targetItem = initialMedia.find((m) => m.id === mediaId);
        if (targetItem) {
          const phaseItems = initialMedia.filter((m) => m.phase_or_chapter === targetItem.phase_or_chapter);
          const otherItemsWatched = phaseItems
            .filter((m) => m.id !== mediaId)
            .every((m) => Boolean(watchedIds[m.id]));

          if (otherItemsWatched && phaseItems.length >= 1) {
            triggerComicConfetti(universe);
            maybeTriggerMilestone({
              type: 'phase_complete',
              title: `${targetItem.phase_or_chapter} Conquered!`,
              count: phaseItems.length,
              milestoneKey: `phase_${targetItem.phase_or_chapter}`,
            });
          }
        }

        // Check if milestone title count reached (15, 30, 60, 100)
        const currentWatchedCount = initialMedia.filter((m) => Boolean(watchedIds[m.id])).length;
        const newWatchedCount = currentWatchedCount + 1;
        if ([15, 30, 60, 100].includes(newWatchedCount)) {
          triggerGrandCelebration(universe);
          maybeTriggerMilestone({
            type: 'count_reached',
            title: `${newWatchedCount} Multiverse Titles Logged!`,
            count: newWatchedCount,
            milestoneKey: `count_${newWatchedCount}`,
          });
        }
      }
    }
  }, [watchedIds, toggleWatched, enableConfetti, initialMedia, universe, maybeTriggerMilestone]);

  const handlePhaseToggle = useCallback((phaseItems: FranchiseMedia[], phaseName: string) => {
    const allCurrentlyWatched = phaseItems.every((item) => watchedIds[item.id]);
    const targetState = !allCurrentlyWatched;
    markPhaseWatched(phaseItems, targetState);

    if (targetState) {
      if (enableConfetti) {
        triggerComicConfetti(universe);
      }
      maybeTriggerMilestone({
        type: 'phase_complete',
        title: `${phaseName} Conquered!`,
        count: phaseItems.length,
        milestoneKey: `phase_${phaseName}`,
      });
    }
  }, [watchedIds, markPhaseWatched, enableConfetti, universe, maybeTriggerMilestone]);

  const handleFranchiseAllToggle = useCallback(() => {
    const allCurrentlyWatched = filteredAndSortedMedia.every((item) => watchedIds[item.id]);
    markAllWatched(filteredAndSortedMedia, !allCurrentlyWatched);
    if (!allCurrentlyWatched && enableConfetti) {
      triggerGrandCelebration(universe);
    }
  }, [filteredAndSortedMedia, watchedIds, markAllWatched, enableConfetti, universe]);

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto px-3.5 sm:px-8 xl:px-12 py-5 sm:py-7 overflow-x-hidden">
      {/* Public Shared Progress Hero Alert Banner */}
      {isViewingShared && sharedData && (
        <div className="relative bg-[#10121d] border-[4px] border-amber-400 p-4 sm:p-5 shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 bg-amber-400 text-black border-2 border-black -skew-x-3 font-black text-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] flex-shrink-0">
              🦸‍♂️
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="font-display font-black text-base sm:text-lg uppercase text-white tracking-wide">
                  Viewing <strong className="text-amber-400">@{sharedData.userName}</strong>&apos;s Public Watchlist
                </span>
                <ComicBadge variant="gold" size="sm">
                  {sharedData.percentage}% Complete ({sharedData.watchedCount}/{sharedData.totalCount} Titles)
                </ComicBadge>
              </div>
              <p className="text-xs text-zinc-300 font-sans">
                You are viewing their completed multiverse watchlist in <strong>Read-Only Mode</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-center">
            <ComicButton
              onClick={() => {
                Object.keys(sharedData.sharedWatchedIds).forEach((id) => {
                  if (!watchedIds[id]) {
                    const item = initialMedia.find((m) => m.id === id);
                    toggleWatched(id, item?.tmdb_id, item?.trakt_id, item?.media_type, item?.seasons);
                  }
                });
                setIsViewingShared(false);
              }}
              variant="gold"
              size="sm"
              className="flex-1 md:flex-none text-xs font-black"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            >
              Copy to My Tracker
            </ComicButton>

            <button
              onClick={() => setIsViewingShared(false)}
              className="flex-1 md:flex-none px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-display text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition active:scale-95 cursor-pointer"
            >
              Exit Shared View
            </button>
          </div>
        </div>
      )}

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
                  {branchFilter === 'all'
                    ? `${initialMedia.length} Total Titles`
                    : `${activeBranchMedia.length} Titles (${currentBranchObj?.label})`}
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
              label={branchFilter === 'all' ? `${universe.toUpperCase()} Multiverse Progress` : `${currentBranchObj?.label || 'Universe'} Progress`}
              universe={universe}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Optional Marathon Stats (Configured via Settings) */}
      {showMarathonStats && (
        <MarathonStatsWidget
          mediaList={activeBranchMedia}
          watchedIds={watchedIds}
          universe={universe}
          scopeName={branchFilter === 'all' ? undefined : currentBranchObj?.label}
        />
      )}

      {/* Unified Compact Filter Toolbar (Static, scrolls naturally with page) */}
      <section className="relative bg-[#0d0e17] border-[3px] border-black shadow-[5px_5px_0px_0px_#000000] p-3.5 sm:p-4 space-y-3">
        {/* Row 1: Continuity Universe Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-display uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Universe:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {branches.map((branch) => {
              const isActive = branchFilter === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBranchChange(branch.id)}
                  className={clsx(
                    'px-3 py-1 font-display text-xs sm:text-sm font-bold uppercase transition border-2 border-black select-none flex-shrink-0 cursor-pointer',
                    isActive
                      ? isMCU
                        ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <span>{branch.label}</span>
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
              onChange={handleOrderChange}
              universe={universe}
            />
            <TypeFilterTabs
              currentType={typeFilter}
              onChange={handleTypeChange}
              universe={universe}
            />
            <StatusFilterTabs
              currentStatus={statusFilter}
              onChange={handleStatusChange}
            />
          </div>

          <div className="relative min-w-[220px] lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${universe.toUpperCase()} titles...`}
              className="w-full bg-zinc-950 border-2 border-black px-3.5 py-1.5 pl-8 text-sm font-sans text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 shadow-[2px_2px_0px_0px_#000000]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
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
            <p className="text-zinc-300 text-sm font-sans max-w-md mx-auto mb-4">
              Try adjusting your search query, content type, or universe filter tabs above.
            </p>
            <ComicButton
              onClick={() => {
                handleTypeChange('all');
                handleStatusChange('all');
                handleBranchChange('all');
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
            const groupWatchedCount = group.items.filter((item) => activeWatchedIds[item.id]).length;
            const isGroupComplete = groupWatchedCount === group.items.length && group.items.length > 0;

            return (
              <section key={group.phase} className="space-y-4">
                {/* Phase Chapter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#12131e] border-l-[6px] border-l-amber-400 border-y-2 border-r-2 border-black shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-2xl font-display font-black uppercase text-white tracking-wider">
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
                        'px-3 py-1.5 text-xs sm:text-sm font-display font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer tracking-wider',
                        isGroupComplete
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      )}
                    >
                      {isGroupComplete ? 'Unmark Phase' : 'Mark Phase Watched'}
                    </button>
                  </div>
                </div>

                {/* Cards Grid: Balanced columns for crisp readability on 1080p, 1440p, and 4K displays */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
                  {group.items.map((media) => (
                    <ComicCard
                      key={media.id}
                      media={media}
                      isWatched={Boolean(activeWatchedIds[media.id])}
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

      {/* Supporter & Tip Banner */}
      <div className="mt-12 p-6 bg-[#141624] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span className="font-display font-black text-base sm:text-lg uppercase text-amber-400 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" /> Enjoying Multiverse Tracker?
            </span>
            <ComicBadge variant="gold" size="sm">
              <span className="flex items-center gap-1 font-bold">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                100% Free & No Ads
              </span>
            </ComicBadge>
          </div>
          <p className="text-xs text-zinc-300 font-sans max-w-xl leading-relaxed">
            Multiverse Tracker is an ad-free passion project for Marvel & DC fans. If this tracker powers your movie marathons, consider buying the dev a coffee on Revolut to fuel future updates!
          </p>
        </div>

        <a
          href="https://revolut.me/fmoslavac"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <ComicButton
            variant="gold"
            size="md"
            leftIcon={<Coffee className="w-4 h-4 text-black" />}
          >
            Buy a Coffee via Revolut.me
          </ComicButton>
        </a>
      </div>

      {/* Multiverse Citizen Passport Modal (Scope-Aware) */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        mediaList={activeBranchMedia}
        watchedIds={watchedIds}
        universe={universe}
        userName={supabaseUser?.email?.split('@')[0]}
        scopeName={branchFilter === 'all' ? undefined : currentBranchObj?.label}
      />

      {/* Milestone Achievement & Supporter Celebration Modal */}
      <MilestoneDonationModal
        isOpen={isMilestoneOpen}
        onClose={() => setIsMilestoneOpen(false)}
        data={milestoneData}
        universe={universe}
      />
    </div>
  );
};
