'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Trophy, Sparkles, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { ComicButton } from './ComicButton';
import { ComicBadge } from './ComicBadge';
import { triggerGrandCelebration } from './ConfettiCelebration';
import { Universe } from '@/lib/types';
import { clsx } from 'clsx';

export interface MilestoneData {
  type: 'phase_complete' | 'count_reached';
  title: string;
  count: number;
  total?: number;
  milestoneKey: string;
}

interface MilestoneDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MilestoneData | null;
  universe: Universe;
}

export const MilestoneDonationModal: React.FC<MilestoneDonationModalProps> = ({
  isOpen,
  onClose,
  data,
  universe,
}) => {
  const isMCU = universe === 'mcu';

  useEffect(() => {
    if (isOpen && data) {
      triggerGrandCelebration(universe);
    }
  }, [isOpen, data, universe]);

  if (!isOpen || !data) return null;

  const handleDonateClick = () => {
    try {
      localStorage.setItem('multiverse_last_milestone_shown', Date.now().toString());
    } catch {}
    window.open('https://revolut.me/fmoslavac', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-8 overflow-hidden text-center"
        >
          {/* Top Decorative Background Glow */}
          <div
            className={clsx(
              'absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none',
              isMCU ? 'bg-marvel-crimson' : 'bg-cyan-500'
            )}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition cursor-pointer z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Milestone Icon */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center -skew-x-3 mb-4">
            {data.type === 'phase_complete' ? (
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-bounce" />
            ) : (
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
            )}
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-2">
            <ComicBadge variant={isMCU ? 'marvel' : 'dc'} size="md">
              {data.type === 'phase_complete' ? 'Phase Conquered!' : 'Achievement Unlocked!'}
            </ComicBadge>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide leading-tight mb-2">
            {data.title}
          </h2>

          {/* Subtitle / Progress */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 font-display text-xs sm:text-sm font-bold uppercase mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {data.type === 'phase_complete'
                ? `All ${data.count} titles watched in this storyline!`
                : `${data.count} Total Titles Logged in your Journey!`}
            </span>
          </div>

          {/* Friendly Dev Message */}
          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed mb-6 max-w-md mx-auto">
            Multiverse Tracker is <strong>100% ad-free</strong> and maintained as a passion project for the community. If you enjoy tracking your watch journey, consider buying the dev a coffee to fuel servers and future updates! ☕
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <ComicButton
              onClick={handleDonateClick}
              variant="gold"
              size="lg"
              className="w-full text-sm sm:text-base font-black uppercase tracking-wider py-3"
              leftIcon={<Coffee className="w-5 h-5 text-black" />}
              rightIcon={<ExternalLink className="w-4 h-4 text-black" />}
            >
              Buy the Dev a Coffee ($3)
            </ComicButton>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-display font-bold uppercase text-zinc-400 hover:text-white transition tracking-wider cursor-pointer"
            >
              Keep Tracking 🚀
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
