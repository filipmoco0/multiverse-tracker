'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Circle,
  ExternalLink,
  Calendar,
  Film,
  Tv,
  Sparkles,
  Play,
  Tv2,
  ShoppingBag,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FranchiseMedia } from '@/lib/types';
import { ComicBadge } from './ComicBadge';
import { ComicButton } from './ComicButton';
import { ComicPoster } from './ComicPoster';
import { clsx } from 'clsx';

interface MediaModalProps {
  media: FranchiseMedia | null;
  isOpen: boolean;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatched: () => void;
}

interface ExtraDetails {
  trailerKey: string | null;
  trailerName: string | null;
  providers: {
    flatrate: { name: string; logo: string }[];
    rent: { name: string; logo: string }[];
    buy: { name: string; logo: string }[];
    justWatchLink: string | null;
  };
}

export const MediaModal: React.FC<MediaModalProps> = ({
  media,
  isOpen,
  onClose,
  isWatched,
  onToggleWatched,
}) => {
  const [details, setDetails] = useState<ExtraDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch TMDB trailer and watch providers whenever media changes
  useEffect(() => {
    if (!isOpen || !media || !media.tmdb_id) {
      setDetails(null);
      setShowTrailer(false);
      return;
    }

    let isMounted = true;
    setIsLoadingDetails(true);
    setShowTrailer(false);

    fetch(`/api/tmdb/details?tmdb_id=${media.tmdb_id}&media_type=${media.media_type}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setIsLoadingDetails(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load TMDB details:', err);
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, media]);

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
          className="relative w-full max-w-3xl bg-[#141622] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] p-6 z-10 my-8 max-h-[90vh] overflow-y-auto text-white"
        >
          {/* Close button */}
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
            {/* Left Column: Poster & Order Badges */}
            <div className="relative flex flex-col items-center space-y-3">
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
              <div className="w-full grid grid-cols-2 gap-2 text-center">
                <div className="bg-zinc-900 border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="text-[10px] uppercase font-sans text-zinc-400">Release #</div>
                  <div className="font-display text-base font-bold text-amber-400">#{media.release_order}</div>
                </div>
                <div className="bg-zinc-900 border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="text-[10px] uppercase font-sans text-zinc-400">Chrono #</div>
                  <div className="font-display text-base font-bold text-cyan-400">
                    {media.chronological_order ? `#${media.chronological_order}` : 'TBD'}
                  </div>
                </div>
              </div>

              {/* Quick Trailer Button if Available */}
              {details?.trailerKey && (
                <button
                  onClick={() => setShowTrailer(!showTrailer)}
                  className={clsx(
                    'w-full py-2 px-3 border-2 border-black font-display font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer',
                    showTrailer
                      ? 'bg-zinc-800 text-white'
                      : 'bg-[#E62429] text-white hover:bg-rose-500'
                  )}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{showTrailer ? 'Hide Trailer' : 'Watch Trailer'}</span>
                </button>
              )}
            </div>

            {/* Right Column: Info, Synopsis, Trailer, Streaming */}
            <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Universe & Type Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="sm">
                    {isMCU ? 'MARVEL' : 'DC'}
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

                {/* Release Date */}
                {media.release_date && (
                  <div className="flex items-center gap-2 text-xs font-sans text-zinc-300">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>
                      Released:{' '}
                      {new Date(media.release_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Embedded YouTube Trailer Player */}
                {showTrailer && details?.trailerKey && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div className="relative aspect-video w-full border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] bg-black overflow-hidden">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${details.trailerKey}?autoplay=1&rel=0`}
                        title={details.trailerName || 'Official Trailer'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}

                {/* Overview Synopsis */}
                <div className="bg-zinc-900/90 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] space-y-1.5">
                  <h4 className="text-xs uppercase font-display tracking-wider text-zinc-400">
                    Comic Intel / Synopsis
                  </h4>
                  <p className="text-sm font-sans text-zinc-200 leading-relaxed max-h-40 overflow-y-auto pr-1">
                    {media.overview || 'No synopsis recorded in archives.'}
                  </p>
                </div>

                {/* Where to Watch (Streaming Providers) */}
                <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tv2 className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs uppercase font-display tracking-wider text-white font-bold">
                        Where to Watch (Streaming & Rent)
                      </h4>
                    </div>
                    {details?.providers.justWatchLink && (
                      <a
                        href={details.providers.justWatchLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-display uppercase tracking-wider text-zinc-400 hover:text-amber-400 underline flex items-center gap-1"
                      >
                        JustWatch <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {isLoadingDetails ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Checking streaming availability...</span>
                    </div>
                  ) : details?.providers.flatrate.length || details?.providers.buy.length || details?.providers.rent.length ? (
                    <div className="space-y-2.5">
                      {/* Subscription Stream */}
                      {details.providers.flatrate.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-display uppercase tracking-wider text-emerald-400 font-bold block">
                            Stream Included:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {details.providers.flatrate.map((p, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 bg-zinc-900 border border-black px-2 py-1 shadow-[1px_1px_0px_0px_#000000]"
                                title={p.name}
                              >
                                {p.logo && (
                                  <img
                                    src={p.logo}
                                    alt={p.name}
                                    className="w-5 h-5 rounded object-cover"
                                  />
                                )}
                                <span className="text-xs font-sans font-medium text-zinc-200">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Buy / Rent */}
                      {(details.providers.buy.length > 0 || details.providers.rent.length > 0) && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-display uppercase tracking-wider text-cyan-400 font-bold block">
                            Rent or Buy:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(
                              new Map(
                                [...details.providers.buy, ...details.providers.rent].map((item) => [item.name, item])
                              ).values()
                            ).slice(0, 5).map((p, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 bg-zinc-900 border border-black px-2 py-1 shadow-[1px_1px_0px_0px_#000000]"
                                title={p.name}
                              >
                                {p.logo && (
                                  <img
                                    src={p.logo}
                                    alt={p.name}
                                    className="w-5 h-5 rounded object-cover"
                                  />
                                )}
                                <span className="text-xs font-sans font-medium text-zinc-300">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 font-sans italic">
                      Check local listings or Disney+ / Max apps for region availability.
                    </p>
                  )}
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
