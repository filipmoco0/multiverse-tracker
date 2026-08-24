'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Tv, Film, ArrowRight, ShieldCheck, UserCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ComicButton } from '@/components/comic/ComicButton';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { TraktAuthModal } from '@/components/auth/TraktAuthModal';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthMode, traktUser, authMode } = useWatchlistStore();

  const [isEntering, setIsEntering] = useState(false);
  const [isTraktModalOpen, setIsTraktModalOpen] = useState(false);

  const errorParam = searchParams.get('error');
  const reasonParam = searchParams.get('reason');

  const handleGuestEntry = () => {
    setAuthMode('guest');
    setIsEntering(true);
    setTimeout(() => {
      router.push('/select');
    }, 300);
  };

  return (
    <>
      <main className="relative min-h-screen bg-[#0a0b10] bg-halftone flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Background Comic Glow Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-marvel-crimson/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Comic Box Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={isEntering ? { scale: 1.1, opacity: 0 } : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="relative w-full max-w-3xl bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] p-6 sm:p-10 z-10 space-y-7"
        >
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black pb-4">
            <div className="flex items-center gap-2">
              <ComicBadge variant="marvel" size="sm">MARVEL</ComicBadge>
              <span className="font-display text-zinc-500 font-bold">VS</span>
              <ComicBadge variant="dc" size="sm">DC COMICS</ComicBadge>
            </div>
            <ComicBadge variant="gold" size="sm">v1.0 Zero-Cost Edition</ComicBadge>
          </div>

          {/* OAuth Error Feedback Alert */}
          {errorParam && (
            <div className="p-3.5 bg-rose-950/90 border-2 border-rose-600 shadow-[3px_3px_0px_0px_#000000] text-rose-200 text-xs font-sans space-y-1">
              <div className="flex items-center gap-2 font-display uppercase font-bold text-rose-400">
                <AlertCircle className="w-4 h-4" />
                Trakt Authorization Notice
              </div>
              <p>{reasonParam || 'Authentication was cancelled or failed. Please check your Trakt app settings or use Instant Username Connect.'}</p>
            </div>
          )}

          {/* Hero Title & Subtitle */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-wider uppercase leading-none text-white">
              MULTIVERSE <span className="text-amber-400">TRACKER</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-xl mx-auto leading-relaxed">
              The ultimate progress tracker for the Marvel Cinematic Universe and DC Universe. Follow release order or chronological timelines, sync with Trakt.tv, or jump in instantly as a guest!
            </p>
          </div>

          {/* Feature Grid Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs font-display uppercase tracking-wider">
            <div className="bg-zinc-900/90 border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000] text-amber-400">
              <Film className="w-4 h-4 mx-auto mb-1 text-white" />
              Release & Chrono
            </div>
            <div className="bg-zinc-900/90 border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000] text-cyan-400">
              <Tv className="w-4 h-4 mx-auto mb-1 text-white" />
              Phase Breakdown
            </div>
            <div className="bg-zinc-900/90 border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000] text-rose-400">
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-white" />
              Trakt Cloud Sync
            </div>
            <div className="bg-zinc-900/90 border-2 border-black p-2.5 shadow-[2px_2px_0px_0px_#000000] text-emerald-400">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-white" />
              Zero DB Lag
            </div>
          </div>

          {/* Action Gate Options */}
          <div className="space-y-4 pt-2">
            {/* Primary Action 1: Trakt.tv modal connect */}
            <ComicButton
              onClick={() => setIsTraktModalOpen(true)}
              variant="danger"
              size="lg"
              className="w-full flex justify-between items-center bg-[#E62429]"
              leftIcon={<Zap className="w-5 h-5 text-amber-300" />}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              <span>
                {authMode === 'trakt' && traktUser
                  ? `Continue as @${traktUser.username}`
                  : 'Connect with Trakt.tv (Auto-Sync)'}
              </span>
            </ComicButton>

            {/* Secondary Action 2: Continue as Guest */}
            <ComicButton
              onClick={handleGuestEntry}
              variant="gold"
              size="lg"
              className="w-full flex justify-between items-center"
              leftIcon={<UserCheck className="w-5 h-5 text-black" />}
              rightIcon={<ArrowRight className="w-5 h-5 text-black" />}
            >
              <span>Continue as Guest (Instant Access)</span>
            </ComicButton>

            {/* Guest Explanation & Admin shortcut */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-zinc-400 font-sans">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Guest progress is automatically saved to your browser cache.
              </span>
              <button
                onClick={() => router.push('/admin')}
                className="text-zinc-400 hover:text-amber-400 underline font-display transition cursor-pointer"
              >
                Curator Admin Login
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Trakt Connection Modal */}
      <TraktAuthModal
        isOpen={isTraktModalOpen}
        onClose={() => setIsTraktModalOpen(false)}
      />
    </>
  );
}

export default function LandingAuthGateway() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0b10]" />}>
      <LandingContent />
    </Suspense>
  );
}
