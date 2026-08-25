'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Award,
  Clock,
  Film,
  Tv,
  Sparkles,
  Shield,
  Zap,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { FranchiseMedia, Universe } from '@/lib/types';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { clsx } from 'clsx';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: FranchiseMedia[];
  watchedIds: Record<string, boolean>;
  universe: Universe;
  userName?: string | null;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  watchedIds,
  universe,
  userName,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMCU = universe === 'mcu';

  // Stats calculation
  const totalTitles = mediaList.length;
  const watchedTitles = mediaList.filter((m) => Boolean(watchedIds[m.id])).length;
  const percentage = totalTitles > 0 ? Math.round((watchedTitles / totalTitles) * 100) : 0;

  const movies = mediaList.filter((m) => m.media_type === 'movie');
  const shows = mediaList.filter((m) => m.media_type === 'show');
  const specials = mediaList.filter((m) => m.media_type === 'special');

  const watchedMovies = movies.filter((m) => Boolean(watchedIds[m.id])).length;
  const watchedShows = shows.filter((m) => Boolean(watchedIds[m.id])).length;
  const watchedSpecials = specials.filter((m) => Boolean(watchedIds[m.id])).length;

  let totalMinutes = 0;
  mediaList.forEach((item) => {
    if (watchedIds[item.id]) {
      if (item.media_type === 'movie') totalMinutes += 128;
      else if (item.media_type === 'show') totalMinutes += (item.episodes || 6) * 45;
      else if (item.media_type === 'special') totalMinutes += 52;
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const days = (hours / 24).toFixed(1);

  // Superhero Rank
  const getRank = () => {
    if (isMCU) {
      if (percentage === 0) return { title: 'Civilian', subtitle: 'Daily Bugle Reader', icon: '👤', badge: 'white' as const };
      if (percentage <= 15) return { title: 'S.H.I.E.L.D. Recruit', subtitle: 'Level 1 Clearance', icon: '🛡️', badge: 'cyan' as const };
      if (percentage <= 35) return { title: 'Street-Level Hero', subtitle: 'Defender of New York', icon: '🕸️', badge: 'gold' as const };
      if (percentage <= 60) return { title: 'Official Avenger', subtitle: "Earth's Mightiest Hero", icon: '🦸‍♂️', badge: 'marvel' as const };
      if (percentage <= 85) return { title: 'Sorcerer Supreme', subtitle: 'Master of Mystic Arts', icon: '✨', badge: 'gold' as const };
      if (percentage < 100) return { title: 'Multiverse Guardian', subtitle: 'Nexus Being', icon: '🪐', badge: 'green' as const };
      return { title: 'The One Above All', subtitle: '100% Multiverse Master', icon: '👑', badge: 'gold' as const };
    } else {
      if (percentage === 0) return { title: 'Gotham Citizen', subtitle: 'Watching the Skies', icon: '👤', badge: 'white' as const };
      if (percentage <= 15) return { title: 'GCPD Detective', subtitle: 'Badge #1939', icon: '🚨', badge: 'cyan' as const };
      if (percentage <= 35) return { title: 'Bat-Family Vigilante', subtitle: 'Knight of Gotham', icon: '🦇', badge: 'gold' as const };
      if (percentage <= 60) return { title: 'Justice League Member', subtitle: 'Hall of Justice', icon: '⚡', badge: 'dc' as const };
      if (percentage <= 85) return { title: 'Green Lantern Corps', subtitle: 'Sector 2814 Guardian', icon: '💚', badge: 'green' as const };
      if (percentage < 100) return { title: 'Speed Force Champion', subtitle: 'Crisis Survivor', icon: '🌀', badge: 'cyan' as const };
      return { title: 'Prime Earth Legend', subtitle: '100% DC Universe Master', icon: '👑', badge: 'gold' as const };
    }
  };

  const rank = getRank();
  const holderName = userName ? `@${userName.replace('@', '')}` : 'Multiverse Agent';

  // Download card as PNG
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    setShareFeedback(null);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0c0d14',
      });

      const link = document.createElement('a');
      link.download = `multiverse-passport-${universe}-${holderName.replace('@', '')}.png`;
      link.href = dataUrl;
      link.click();
      setShareFeedback('Passport image downloaded successfully!');
      setTimeout(() => setShareFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to generate passport image:', err);
      setShareFeedback('Failed to download image. Try taking a screenshot.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Cross-browser clipboard helper
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to execCommand
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  // Share action with native Web Share and Clipboard fallback
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://multiversetracker.com/${universe}`;
    const shareText = `🦸‍♂️ My ${isMCU ? 'Marvel Multiverse' : 'DC Universe'} Progress: ${percentage}% Complete (${hours} Hours Logged) • Rank: ${rank.title}!\nTrack yours at ${shareUrl}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${holderName}'s Multiverse Passport`,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 4000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // User dismissed share sheet
        }
      }
    }

    // Fallback: Copy to clipboard
    const success = await copyTextToClipboard(shareText);
    if (success) {
      setCopied(true);
      setShareFeedback('Copied share text and link to clipboard! Ready to paste.');
      setTimeout(() => {
        setCopied(false);
        setShareFeedback(null);
      }, 4000);
    } else {
      setShareFeedback(`Please copy link manually: ${shareUrl}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] z-10 overflow-hidden text-white flex flex-col my-8 max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 bg-zinc-950 border-b-[3px] border-black">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-black border-2 border-black -skew-x-6 font-black">
                <Sparkles className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                  Multiverse Citizen Passport
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Share your superhero mastery with friends
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
          </div>

          {/* Feedback banner */}
          {shareFeedback && (
            <div className="p-3 bg-emerald-950 border-b-2 border-black text-xs font-sans text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{shareFeedback}</span>
            </div>
          )}

          {/* Body with Scroll */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* The Actual Passport Card that gets captured */}
            <div
              ref={cardRef}
              className={clsx(
                'relative bg-[#10121d] border-[4px] border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000] overflow-hidden text-white space-y-5',
                isMCU ? 'bg-halftone-marvel' : 'bg-halftone-dc'
              )}
            >
              {/* Card Header Stamp */}
              <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      'p-1.5 border-2 border-black text-xs font-display font-black uppercase text-white -skew-x-6',
                      isMCU ? 'bg-[#E62429]' : 'bg-[#005792]'
                    )}
                  >
                    <span className="inline-block skew-x-6">
                      {isMCU ? 'MARVEL AUTHORIZED' : 'DC UNIVERSE SECURE'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                    ID: #{universe.toUpperCase()}-84920
                  </span>
                </div>
                <ComicBadge variant="gold" size="sm">
                  PASSPORT v1.0
                </ComicBadge>
              </div>

              {/* Agent Profile & Rank */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950 border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] -skew-x-3 flex items-center justify-center text-4xl flex-shrink-0">
                  {rank.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400 font-bold block">
                    Citizen / Holder
                  </span>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-amber-400 uppercase truncate">
                    {holderName}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ComicBadge variant={rank.badge} size="sm">
                      {rank.title}
                    </ComicBadge>
                    <span className="text-xs text-zinc-300 font-sans font-medium">
                      {rank.subtitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Stats Big Metric */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Total Mastery */}
                <div className="bg-zinc-950 border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="text-[10px] font-display uppercase tracking-wider text-zinc-400 block">
                    Mastery Completion
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display font-black text-3xl text-emerald-400">
                      {percentage}%
                    </span>
                    <span className="text-xs text-zinc-400 font-sans">
                      ({watchedTitles}/{totalTitles})
                    </span>
                  </div>
                </div>

                {/* Total Watch Time */}
                <div className="bg-zinc-950 border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="text-[10px] font-display uppercase tracking-wider text-zinc-400 block">
                    Marathon Time Logged
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display font-black text-2xl text-cyan-400">
                      {hours}h
                    </span>
                    <span className="text-xs text-zinc-400 font-sans">
                      ({days} Days)
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-display uppercase">
                <div className="bg-zinc-950 border border-black p-2 shadow-[1px_1px_0px_0px_#000000]">
                  <Film className="w-3.5 h-3.5 mx-auto text-amber-400 mb-0.5" />
                  <span className="text-white font-bold">{watchedMovies}/{movies.length}</span>
                  <span className="block text-[9px] text-zinc-400">Movies</span>
                </div>
                <div className="bg-zinc-950 border border-black p-2 shadow-[1px_1px_0px_0px_#000000]">
                  <Tv className="w-3.5 h-3.5 mx-auto text-cyan-400 mb-0.5" />
                  <span className="text-white font-bold">{watchedShows}/{shows.length}</span>
                  <span className="block text-[9px] text-zinc-400">Series</span>
                </div>
                <div className="bg-zinc-950 border border-black p-2 shadow-[1px_1px_0px_0px_#000000]">
                  <Sparkles className="w-3.5 h-3.5 mx-auto text-purple-400 mb-0.5" />
                  <span className="text-white font-bold">{watchedSpecials}/{specials.length}</span>
                  <span className="block text-[9px] text-zinc-400">Specials</span>
                </div>
              </div>

              {/* Card Footer Barcode & Watermark */}
              <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>multiverse-tracker.vercel.app</span>
                </div>
                <span className="tracking-widest uppercase font-bold text-zinc-500">
                  |||||| ||| ||||||| ||
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <ComicButton
                onClick={handleDownload}
                disabled={isDownloading}
                variant="gold"
                size="md"
                className="flex-1"
                leftIcon={<Download className="w-4 h-4" />}
              >
                {isDownloading ? 'Generating Image...' : 'Download Image (PNG)'}
              </ComicButton>

              <ComicButton
                onClick={handleShare}
                variant="cyan"
                size="md"
                className="flex-1"
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              >
                {copied ? 'Copied to Clipboard!' : 'Share Progress'}
              </ComicButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
