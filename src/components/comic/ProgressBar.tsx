'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ComicBadge } from './ComicBadge';

interface ProgressBarProps {
  total: number;
  watched: number;
  label?: string;
  universe?: 'mcu' | 'dcu';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  total,
  watched,
  label,
  universe = 'mcu',
  size = 'md',
  showCount = true,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0;

  const barHeight = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  const universeGradient =
    universe === 'mcu'
      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-marvel-crimson'
      : 'bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400';

  return (
    <div className="w-full space-y-1.5">
      {(label || showCount) && (
        <div className="flex items-center justify-between text-xs md:text-sm font-display tracking-wider">
          {label && <span className="font-bold uppercase text-zinc-300">{label}</span>}
          {showCount && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-sans text-xs">
                <strong className="text-white font-display text-sm">{watched}</strong> / {total} Watched
              </span>
              <ComicBadge
                variant={percentage === 100 ? 'green' : universe === 'mcu' ? 'marvel' : 'cyan'}
                size="sm"
              >
                {percentage}%
              </ComicBadge>
            </div>
          )}
        </div>
      )}

      {/* Outer Comic HP Bar Frame */}
      <div
        className={clsx(
          'relative w-full bg-zinc-950 border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] overflow-hidden p-0.5',
          barHeight[size]
        )}
      >
        {/* Animated fill meter */}
        <motion.div
          className={clsx('h-full transition-all duration-500 relative', universeGradient)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Comic scanlines / reflection stripe */}
          <div className="absolute inset-0 bg-white/20 h-1/2 w-full" />
        </motion.div>

        {/* Comic Segment Grid Dividers (10 segments) */}
        <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border-r border-black/50 h-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
