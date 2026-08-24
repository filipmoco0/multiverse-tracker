'use client';

import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, Eye } from 'lucide-react';
import { StatusFilter } from '@/lib/types';

interface StatusFilterTabsProps {
  currentStatus: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

export const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  currentStatus,
  onChange,
}) => {
  const tabs: { status: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { status: 'all', label: 'All Media', icon: <Eye className="w-3.5 h-3.5" /> },
    { status: 'watched', label: 'Watched', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { status: 'unwatched', label: 'Unwatched', icon: <Circle className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.status;
        return (
          <button
            key={tab.status}
            onClick={() => onChange(tab.status)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer',
              isActive
                ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
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
