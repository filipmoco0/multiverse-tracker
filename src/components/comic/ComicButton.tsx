import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'marvel' | 'dc' | 'gold' | 'cyan' | 'white' | 'dark' | 'outline' | 'danger' | 'green';

interface ComicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  skew?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ComicButton: React.FC<ComicButtonProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  skew = true,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    marvel: 'bg-marvel-crimson text-white hover:bg-marvel-hover border-black shadow-[4px_4px_0px_0px_#000000]',
    dc: 'bg-[#005792] text-white hover:bg-[#0077b6] border-black shadow-[4px_4px_0px_0px_#000000]',
    gold: 'bg-amber-400 text-black hover:bg-amber-300 border-black shadow-[4px_4px_0px_0px_#000000]',
    cyan: 'bg-cyan-400 text-black hover:bg-cyan-300 border-black shadow-[4px_4px_0px_0px_#000000]',
    white: 'bg-white text-black hover:bg-zinc-100 border-black shadow-[4px_4px_0px_0px_#000000]',
    dark: 'bg-zinc-900 text-white hover:bg-zinc-800 border-black shadow-[4px_4px_0px_0px_#000000]',
    outline: 'bg-transparent text-white hover:bg-white/10 border-white shadow-[4px_4px_0px_0px_#FFFFFF]',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 border-black shadow-[4px_4px_0px_0px_#000000]',
    green: 'bg-emerald-500 text-black hover:bg-emerald-400 border-black shadow-[4px_4px_0px_0px_#000000]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 border-2',
    md: 'text-sm px-4 py-2 border-2',
    lg: 'text-base md:text-lg px-6 py-3 border-[3px] font-bold',
    xl: 'text-lg md:text-xl px-8 py-4 border-[3px] font-extrabold',
  };

  return (
    <button
      disabled={disabled}
      className={twMerge(
        clsx(
          'comic-btn relative inline-flex items-center justify-center gap-2 font-display uppercase tracking-wider font-bold transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none',
          skew && '-skew-x-3',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      <span className={clsx('inline-flex items-center gap-2', skew && 'skew-x-3')}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  );
};
