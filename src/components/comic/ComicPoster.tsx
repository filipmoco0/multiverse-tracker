'use client';

import React, { useState } from 'react';
import { Film, Tv, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Universe, MediaType } from '@/lib/types';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

interface ComicPosterProps {
  src?: string | null;
  alt: string;
  universe: Universe;
  mediaType: MediaType;
  isWatched?: boolean;
  className?: string;
}

export const ComicPoster: React.FC<ComicPosterProps> = ({
  src,
  alt,
  universe,
  mediaType,
  isWatched = false,
  className,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { greyscaleUnwatched } = useSettingsStore();

  const isMCU = universe === 'mcu';
  const hasValidUrl = src && src.startsWith('http') && !src.includes('placeholder');

  const typeIcon = {
    movie: <Film className="w-8 h-8" />,
    show: <Tv className="w-8 h-8" />,
    special: <Sparkles className="w-8 h-8" />,
  }[mediaType];

  if (!hasValidUrl || imageError) {
    return (
      <div
        className={clsx(
          'w-full h-full flex flex-col items-center justify-between p-4 text-center border-b-[3px] border-black select-none relative overflow-hidden',
          isMCU
            ? 'bg-gradient-to-br from-[#1b121c] via-[#2a131b] to-[#12131c]'
            : 'bg-gradient-to-br from-[#0c1424] via-[#10203a] to-[#080d18]',
          !isWatched && greyscaleUnwatched && 'unwatched-filter',
          className
        )}
      >
        {/* Background Comic Halftone & Slanted Lines */}
        <div
          className={clsx(
            'absolute inset-0 opacity-25 pointer-events-none',
            isMCU ? 'bg-halftone-marvel' : 'bg-halftone-dc'
          )}
        />
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* Top Universe Watermark */}
        <div className="relative z-10 w-full flex items-center justify-between opacity-80">
          <span
            className={clsx(
              'font-display text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border border-black',
              isMCU ? 'bg-marvel-crimson text-white' : 'bg-[#005792] text-white'
            )}
          >
            {isMCU ? 'MARVEL STUDIOS' : 'DC STUDIOS'}
          </span>
          <span className="text-[10px] font-display uppercase tracking-wider text-zinc-400">
            {mediaType}
          </span>
        </div>

        {/* Center Icon & Title */}
        <div className="relative z-10 my-auto flex flex-col items-center gap-2 px-2">
          <div
            className={clsx(
              'p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] -skew-x-6',
              isMCU ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-black'
            )}
          >
            <div className="skew-x-6">{typeIcon}</div>
          </div>
          <span className="font-display font-black text-sm md:text-base uppercase tracking-wider leading-snug text-white line-clamp-3">
            {alt}
          </span>
        </div>

        {/* Bottom Badge */}
        <div className="relative z-10 w-full pt-1">
          <div className="text-[9px] uppercase font-sans font-bold text-zinc-500 tracking-wider">
            Official Media Track
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setImageError(true)}
        onLoad={() => setIsLoaded(true)}
        className={clsx(
          'w-full h-full object-cover transition-all duration-300',
          !isWatched && greyscaleUnwatched && 'unwatched-filter',
          !isLoaded && 'opacity-0 scale-95',
          isLoaded && 'opacity-100 scale-100',
          className
        )}
      />
      {!isLoaded && !imageError && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <Film className="w-6 h-6 text-zinc-700 animate-spin" />
        </div>
      )}
    </div>
  );
};
