'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { FranchiseMedia, Universe } from '@/lib/types';
import { ComicBadge } from '../comic/ComicBadge';
import { MediaModal } from '../comic/MediaModal';
import { ComicPoster } from '../comic/ComicPoster';
import { clsx } from 'clsx';

interface UpcomingCountdownWidgetProps {
  mediaList: FranchiseMedia[];
  universe: Universe;
}

export const UpcomingCountdownWidget: React.FC<UpcomingCountdownWidgetProps> = ({
  mediaList,
  universe,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<FranchiseMedia | null>(null);
  const isMCU = universe === 'mcu';
  const now = new Date().getTime();

  // Filter upcoming or unreleased media items and sort by earliest release date
  const upcomingMedia = useMemo(() => {
    return mediaList
      .filter((item) => {
        // Explicit unreleased flag
        if (item.is_released === false) return true;
        // Or future release date
        if (item.release_date) {
          const itemTime = new Date(item.release_date).getTime();
          if (!isNaN(itemTime) && itemTime > now) return true;
          // Check if string is a future year (e.g., "2026", "2027")
          const parsedYear = parseInt(item.release_date, 10);
          const currentYear = new Date().getFullYear();
          if (!isNaN(parsedYear) && parsedYear >= currentYear) return true;
        }
        return false;
      })
      .sort((a, b) => {
        const timeA = a.release_date ? new Date(a.release_date).getTime() : 9999999999999;
        const timeB = b.release_date ? new Date(b.release_date).getTime() : 9999999999999;
        return (isNaN(timeA) ? 9999999999999 : timeA) - (isNaN(timeB) ? 9999999999999 : timeB);
      });
  }, [mediaList, now]);

  if (upcomingMedia.length === 0) return null;

  // Helper to calculate human readable countdown
  const getCountdownString = (releaseDateStr?: string | null) => {
    if (!releaseDateStr) return { text: 'TBD', isClose: false };

    const target = new Date(releaseDateStr).getTime();
    if (isNaN(target)) {
      // If it's just a year like "2026"
      return { text: `Coming in ${releaseDateStr}`, isClose: false };
    }

    const diffMs = target - now;
    if (diffMs <= 0) return { text: 'In Theaters Now!', isClose: true };

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days === 1) return { text: 'TOMORROW!', isClose: true };
    if (days <= 30) return { text: `🔥 IN ${days} DAYS`, isClose: true };
    if (days <= 365) return { text: `⏳ ${days} Days`, isClose: false };

    const months = Math.round(days / 30.5);
    return { text: `📅 In ${months} Months`, isClose: false };
  };

  return (
    <>
      <div className="bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden text-white">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 sm:p-5 bg-zinc-950 border-b-[3px] border-black cursor-pointer select-none hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'p-2 border-2 border-black -skew-x-6 font-black text-black flex items-center justify-center',
                isMCU ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-black'
              )}
            >
              <Hourglass className="w-5 h-5 skew-x-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                  Upcoming Releases & Countdown
                </h3>
                <ComicBadge variant={isMCU ? 'gold' : 'cyan'} size="sm">
                  {upcomingMedia.length} Scheduled
                </ComicBadge>
              </div>
              <p className="text-xs text-zinc-400 font-sans hidden sm:block mt-0.5">
                The next chapter of the {isMCU ? 'Marvel Multiverse' : 'DC Universe'}
              </p>
            </div>
          </div>

          <button className="p-1.5 bg-zinc-800 border-2 border-black text-zinc-300 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Countdown Cards Strip */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                {/* Horizontal Scrollable Deck */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-zinc-700">
                  {upcomingMedia.map((item, idx) => {
                    const countdown = getCountdownString(item.release_date);
                    const formattedDate = item.release_date && !isNaN(new Date(item.release_date).getTime())
                      ? new Date(item.release_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : item.release_date || 'TBD';

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedMedia(item)}
                        className="snap-start flex-shrink-0 w-56 sm:w-64 bg-[#161824] border-[3px] border-black shadow-[5px_5px_0px_0px_#000000] cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Poster Thumbnail */}
                        <div className="relative aspect-[16/10] w-full bg-zinc-950 border-b-2 border-black overflow-hidden">
                          <ComicPoster
                            src={item.poster_path}
                            alt={item.title}
                            universe={item.universe}
                            mediaType={item.media_type}
                            isWatched={false}
                          />

                          {/* Countdown Badge overlay */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            <span
                              className={clsx(
                                'px-2 py-1 text-[11px] font-display font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000000]',
                                countdown.isClose
                                  ? 'bg-[#E62429] text-white animate-pulse'
                                  : 'bg-amber-400 text-black'
                              )}
                            >
                              {countdown.text}
                            </span>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400 font-bold block">
                              {item.phase_or_chapter}
                            </span>
                            <h4 className="font-display font-black text-sm sm:text-base uppercase text-white leading-snug group-hover:text-amber-400 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-300 font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              {formattedDate}
                            </span>
                            <span className="font-display uppercase text-[10px] text-amber-400 font-bold group-hover:underline">
                              Details →
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          isOpen={Boolean(selectedMedia)}
          isWatched={false}
          onClose={() => setSelectedMedia(null)}
          onToggleWatched={() => {}}
        />
      )}
    </>
  );
};
