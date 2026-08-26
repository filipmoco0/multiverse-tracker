import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ComicBadgeProps {
  children: React.ReactNode;
  variant?: 'marvel' | 'dc' | 'gold' | 'cyan' | 'dark' | 'white' | 'green' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  skew?: boolean;
  className?: string;
}

const VARIANT_STYLES = {
  marvel: 'bg-marvel-crimson text-white border-black font-black',
  dc: 'bg-dc-blue text-white border-black font-black',
  gold: 'bg-amber-400 text-black border-black font-black',
  cyan: 'bg-cyan-400 text-black border-black font-black',
  dark: 'bg-zinc-900 text-zinc-100 border-black font-bold',
  white: 'bg-white text-black border-black font-black',
  green: 'bg-emerald-500 text-black border-black font-black',
  purple: 'bg-purple-600 text-white border-black font-black',
};

const SIZE_STYLES = {
  sm: 'text-xs px-2.5 py-0.5 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  md: 'text-xs md:text-sm px-3 py-1 border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
  lg: 'text-sm md:text-base px-4 py-1.5 border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
};

export const ComicBadge: React.FC<ComicBadgeProps> = React.memo(({
  children,
  variant = 'gold',
  size = 'md',
  skew = false,
  className,
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-display uppercase tracking-wider select-none',
          skew && '-skew-x-3',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )
      )}
    >
      <span className={clsx(skew && 'skew-x-3')}>{children}</span>
    </span>
  );
});

ComicBadge.displayName = 'ComicBadge';

