'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, ExternalLink, Calendar, Film, Tv, Sparkles } from 'lucide-react';
import { FranchiseMedia } from '@/lib/types';
import { ComicBadge } from './ComicBadge';
import { ComicButton } from './ComicButton';
import { ComicPoster } from './ComicPoster';

interface MediaModalProps {
  media: FranchiseMedia | null;
  isOpen: boolean;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatched: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  media,
  isOpen,
  onClose,
  isWatched,
  onToggleWatched,
}) => {
  if (!isOpen || !media) return null;

  const isMCU = media.universe === 'mcu';

  const typeIcon = {
    movie: <Film className="w-4 h-4" />,
    show: <Tv className="w-4 h-4" />,
    special: <Sparkles className="w-4 h-4" />,
  }[media.media_type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#141622] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 z-10 my-8 overflow-hidden text-white"
        >
          {/* Comic corner decor badge */}
          <div className="absolute top-0 right-0 p-4 z-20">
            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* Poster & Badges Column */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-full aspect-[2/3] border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden bg-zinc-900">
                <ComicPoster
                  src={media.poster_path}
                  alt={media.title}
                  universe={media.universe}
                  mediaType={media.media_type}
                  isWatched={isWatched}
                />
                {isWatched && (
                  <div className="comic-ribbon bg-emerald-500 text-black">
                    WATCHED
                  </div>
                )}
              </div>

              {/* Order Numbers Display */}
              <div className="w-full mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-900 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="text-[10px] uppercase font-sans text-zinc-400">Release #</div>
                  <div className="font-display text-base font-bold text-amber-400">#{media.release_order}</div>
                </div>
                <div className="bg-zinc-900 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="text-[10px] uppercase font-sans text-zinc-400">Chrono #</div>
                  <div className="font-display text-base font-bold text-cyan-400">
                    {media.chronological_order ? `#${media.chronological_order}` : 'TBD'}
                  </div>
                </div>
              </div>
            </div>

            {/* Info & Action Column */}
            <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Universe & Type Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="sm">
                    {isMCU ? 'MCU' : 'DCU'}
                  </ComicBadge>
                  <ComicBadge variant="gold" size="sm">
                    {media.phase_or_chapter}
                  </ComicBadge>
                  <ComicBadge variant="white" size="sm">
                    <span className="flex items-center gap-1">
                      {typeIcon}
                      {media.media_type}
                    </span>
                  </ComicBadge>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-display font-black tracking-wide leading-tight text-amber-400">
                  {media.title}
                </h2>

                {/* Release date */}
                {media.release_date && (
                  <div className="flex items-center gap-2 text-xs font-sans text-zinc-300">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Released: {new Date(media.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}

                {/* Overview Synopsis */}
                <div className="bg-zinc-900/90 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000]">
                  <h4 className="text-xs uppercase font-display tracking-wider text-zinc-400 mb-1">Comic Intel / Synopsis</h4>
                  <p className="text-sm font-sans text-zinc-200 leading-relaxed max-h-48 overflow-y-auto pr-1">
                    {media.overview || 'No synopsis recorded in archives.'}
                  </p>
                </div>

                {/* External links */}
                <div className="flex items-center gap-3 pt-1 text-xs">
                  {media.tmdb_id && (
                    <a
                      href={`https://www.themoviedb.org/${media.media_type === 'show' ? 'tv' : 'movie'}/${media.tmdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 font-display transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> TMDB Entry
                    </a>
                  )}
                  {media.trakt_id && (
                    <a
                      href={`https://trakt.tv/search/trakt/${media.trakt_id}?id_type=trakt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 font-display transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Trakt.tv Entry
                    </a>
                  )}
                </div>
              </div>

              {/* Toggle Watched CTA */}
              <div className="pt-4 border-t-2 border-black">
                <ComicButton
                  onClick={onToggleWatched}
                  variant={isWatched ? 'danger' : 'green'}
                  size="md"
                  className="w-full"
                  leftIcon={isWatched ? <Circle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                >
                  {isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
                </ComicButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
