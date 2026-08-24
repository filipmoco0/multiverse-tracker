'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Clock, CalendarDays } from 'lucide-react';
import { OrderMode } from '@/lib/types';

interface OrderToggleProps {
  orderMode: OrderMode;
  onChange: (mode: OrderMode) => void;
  universe?: 'mcu' | 'dcu';
}

export const OrderToggle: React.FC<OrderToggleProps> = ({
  orderMode,
  onChange,
  universe = 'mcu',
}) => {
  const activeColor =
    universe === 'mcu'
      ? 'bg-marvel-crimson text-white shadow-[3px_3px_0px_0px_#000000]'
      : 'bg-[#005792] text-white shadow-[3px_3px_0px_0px_#000000]';

  return (
    <div className="inline-flex p-1 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000]">
      <button
        onClick={() => onChange('release')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer',
          orderMode === 'release'
            ? activeColor
            : 'text-zinc-400 hover:text-white bg-transparent'
        )}
      >
        <CalendarDays className="w-4 h-4" />
        <span>Release Order</span>
      </button>

      <button
        onClick={() => onChange('chronological')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer',
          orderMode === 'chronological'
            ? activeColor
            : 'text-zinc-400 hover:text-white bg-transparent'
        )}
      >
        <Clock className="w-4 h-4" />
        <span>Chronological</span>
      </button>
    </div>
  );
};
