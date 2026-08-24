'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Film, Tv, Sparkles, LayoutGrid } from 'lucide-react';
import { TypeFilter } from '@/lib/types';

interface TypeFilterTabsProps {
  currentType: TypeFilter;
  onChange: (type: TypeFilter) => void;
  universe?: 'mcu' | 'dcu';
}

export const TypeFilterTabs: React.FC<TypeFilterTabsProps> = ({
  currentType,
  onChange,
  universe = 'mcu',
}) => {
  const tabs: { type: TypeFilter; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'All', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { type: 'movie', label: 'Movies', icon: <Film className="w-3.5 h-3.5" /> },
    { type: 'show', label: 'TV Shows', icon: <Tv className="w-3.5 h-3.5" /> },
    { type: 'special', label: 'Specials', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]">
      {tabs.map((tab) => {
        const isActive = currentType === tab.type;
        return (
          <button
            key={tab.type}
            onClick={() => onChange(tab.type)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer',
              isActive
                ? universe === 'mcu'
                  ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-cyan-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                : 'text-zinc-400 hover:text-white bg-transparent border-2 border-transparent'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
