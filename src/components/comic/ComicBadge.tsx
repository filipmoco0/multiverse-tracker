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

export const ComicBadge: React.FC<ComicBadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  skew = true,
  className,
}) => {
  const variantStyles = {
    marvel: 'bg-marvel-crimson text-white border-black',
    dc: 'bg-dc-blue text-white border-black',
    gold: 'bg-amber-400 text-black border-black font-extrabold',
    cyan: 'bg-cyan-400 text-black border-black font-extrabold',
    dark: 'bg-zinc-900 text-zinc-100 border-zinc-700',
    white: 'bg-white text-black border-black font-extrabold',
    green: 'bg-emerald-500 text-black border-black font-extrabold',
    purple: 'bg-purple-600 text-white border-black font-extrabold',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    md: 'text-xs md:text-sm px-3 py-1 border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
    lg: 'text-sm md:text-base px-4 py-1.5 border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-display uppercase tracking-wider select-none',
          skew && '-skew-x-6',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      <span className={clsx(skew && 'skew-x-6')}>{children}</span>
    </span>
  );
};
