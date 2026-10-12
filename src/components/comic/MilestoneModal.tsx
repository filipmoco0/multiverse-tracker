'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { ComicBadge } from './ComicBadge';
import { Universe } from '@/lib/types';
import { clsx } from 'clsx';

export interface MilestoneData {
  type: 'phase_complete' | 'count_reached';
  title: string;
  count: number;
  milestoneKey: string;
}

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MilestoneData | null;
  universe: Universe;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  data,
  universe,
}) => {
  if (!isOpen || !data) return null;

  const isMCU = universe === 'mcu';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-8 overflow-hidden text-center"
        >
          <div
            className={clsx(
              'absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none',
              isMCU ? 'bg-marvel-crimson' : 'bg-cyan-500'
            )}
          />

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition cursor-pointer z-10"
            title="Close"
            aria-label="Close achievement"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative mx-auto w-16 h-16 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center -skew-x-3 mb-4">
            {data.type === 'phase_complete' ? (
              <Trophy className="w-8 h-8 text-amber-400" />
            ) : (
              <Sparkles className="w-8 h-8 text-amber-400" />
            )}
          </div>

          <div className="flex justify-center mb-2">
            <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="md">
              {data.type === 'phase_complete' ? 'Phase Complete' : 'Milestone Reached'}
            </ComicBadge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide leading-tight mb-3">
            {data.title}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 font-display text-xs sm:text-sm font-bold uppercase mb-5">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {data.type === 'phase_complete'
                ? `All ${data.count} titles in this section watched.`
                : `${data.count} titles watched.`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="block w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-display text-sm font-bold uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition cursor-pointer"
          >
            Keep Tracking
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
