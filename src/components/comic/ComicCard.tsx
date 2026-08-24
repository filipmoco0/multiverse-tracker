'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { FranchiseMedia, OrderMode } from '@/lib/types';
import { ComicBadge } from './ComicBadge';
import { ComicPoster } from './ComicPoster';
import { MediaModal } from './MediaModal';

interface ComicCardProps {
  media: FranchiseMedia;
  isWatched: boolean;
  orderMode: OrderMode;
  onToggleWatched: (mediaId: string, tmdbId?: number | null, traktId?: number | null, mediaType?: FranchiseMedia['media_type']) => void;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  media,
  isWatched,
  orderMode,
  onToggleWatched,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMCU = media.universe === 'mcu';
  const orderNumber = orderMode === 'release' ? media.release_order : (media.chronological_order || media.release_order);
  const releaseYear = media.release_date ? new Date(media.release_date).getFullYear() : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'relative flex flex-col bg-[#161824] border-[3px] border-black transition-all duration-200 overflow-hidden',
          isWatched
            ? 'shadow-[5px_5px_0px_0px_#00E676]'
            : isMCU
            ? 'shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#E62429]'
            : 'shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#00EAFF]'
        )}
      >
        {/* Poster Container */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 border-b-[3px] border-black group cursor-pointer"
          title="Click to view details and trailer"
        >
          <ComicPoster
            src={media.poster_path}
            alt={media.title}
            universe={media.universe}
            mediaType={media.media_type}
            isWatched={isWatched}
          />

          {/* Diagonal Watched Ribbon */}
          {isWatched && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="comic-ribbon bg-emerald-500 text-black border-y-2 border-black"
            >
              WATCHED
            </motion.div>
          )}

          {/* Top Badges (Order # & Media Type) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
            <ComicBadge
              variant={orderMode === 'chronological' ? 'cyan' : isMCU ? 'marvel' : 'dc'}
              size="sm"
            >
              #{orderNumber}
            </ComicBadge>
            <ComicBadge variant="dark" size="sm">
              <span className="text-[11px] font-sans font-bold uppercase">
                {media.media_type}
              </span>
            </ComicBadge>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 bg-[#161824]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans">
              <span className="truncate max-w-[120px]">{media.phase_or_chapter}</span>
              {releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  {releaseYear}
                </span>
              )}
            </div>

            <h3
              onClick={() => setIsModalOpen(true)}
              className="text-base sm:text-lg font-display font-bold leading-snug line-clamp-2 text-white hover:text-amber-400 transition cursor-pointer"
            >
              {media.title}
            </h3>
          </div>

          {/* Bottom Card Watched Toggle Bar */}
          <div className="pt-2 border-t-2 border-black/60 flex items-center justify-between gap-2">
            <button
              onClick={() => onToggleWatched(media.id, media.tmdb_id, media.trakt_id, media.media_type)}
              className={clsx(
                'flex-1 py-1.5 px-3 border-2 border-black flex items-center justify-center gap-1.5 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer',
                isWatched
                  ? 'bg-emerald-500 text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-rose-500 hover:text-white'
                  : 'bg-zinc-800 text-zinc-300 shadow-[2px_2px_0px_0px_#000000] hover:bg-emerald-500 hover:text-black'
              )}
            >
              <Check className={clsx('w-4 h-4', isWatched ? 'stroke-[3]' : 'opacity-50')} />
              <span>{isWatched ? 'Watched' : 'Watch'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              title="More info"
              aria-label="More information"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal Dialog */}
      <MediaModal
        media={media}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isWatched={isWatched}
        onToggleWatched={() => onToggleWatched(media.id, media.tmdb_id, media.trakt_id, media.media_type)}
      />
    </>
  );
};
