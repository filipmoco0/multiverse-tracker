'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Film,
  Tv,
  Key,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sliders,
  Sparkles,
  Zap,
  Flame,
  Layers,
  Copy,
  Check,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { UnifiedSettingsModal, SettingsTab } from '@/components/settings/UnifiedSettingsModal';
import { clsx } from 'clsx';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'trakt' | 'tmdb'>('trakt');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('trakt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <section className="relative bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <ComicBadge variant="gold" size="md">
                <span className="flex items-center gap-1 font-black">
                  <Sparkles className="w-4 h-4 text-black" />
                  SETUP & API GUIDE
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                Trakt.tv & TMDB
              </ComicBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
              HOW TO CONNECT <span className="text-amber-400">TRAKT.TV</span> & <span className="text-cyan-400">TMDB</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Learn how to enable 2-way cloud scrobbling with Trakt.tv to sync your MCU and DCU watch progress across all your devices, and discover how TMDB powers trailers, ratings, and streaming availability.
            </p>

            {/* Quick Action Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <ComicButton
                variant="gold"
                size="md"
                onClick={() => openSettings('trakt')}
                rightIcon={<Sliders className="w-4 h-4" />}
              >
                Open Settings & Connect Now
              </ComicButton>
              <Link href="/select">
                <ComicButton variant="white" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Back to Universe Gate
                </ComicButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('trakt')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-display text-sm sm:text-base font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000]',
              activeTab === 'trakt'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Tv className="w-4 h-4 skew-x-6" />
            <span className="skew-x-6">1. Trakt.tv 2-Way Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('tmdb')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-display text-sm sm:text-base font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000]',
              activeTab === 'tmdb'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Film className="w-4 h-4 skew-x-6" />
            <span className="skew-x-6">2. TMDB Database & Trailers</span>
          </button>
        </div>

        {/* TAB 1: TRAKT.TV GUIDE */}
        {activeTab === 'trakt' && (
          <div className="space-y-8 animate-fadeIn">
            {/* What is Trakt */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <ComicBadge variant="marvel" size="sm">Overview</ComicBadge>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                  What is Trakt.tv & What Does it Do?
                </h2>
              </div>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>Trakt.tv</strong> is a free cloud service that acts as your central cinema history hub. When connected to Multiverse Tracker:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" /> 2-Way Live Sync
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Marking a movie watched on Multiverse Tracker automatically records it on your Trakt profile, and vice versa.
                  </p>
                </div>
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-rose-400 text-sm uppercase flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> Multi-Device Sync
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Keep your MCU and DCU watch progress perfectly synchronized between your iPhone PWA, laptop, and iPad.
                  </p>
                </div>
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> App Ecosystem
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Seamlessly connects with other movie tracking apps, Kodi media centers, and Stremio scrobblers.
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Connection Instructions */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide border-b-2 border-zinc-800 pb-3">
                How to Connect Trakt in 3 Simple Steps
              </h2>

              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-rose-600 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-white flex items-center justify-center -skew-x-6 flex-shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Create a Free Trakt.tv Account
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    If you do not already have an account, create one for free on Trakt.tv.
                  </p>
                  <a
                    href="https://trakt.tv/join"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider text-rose-400 hover:text-rose-300 underline pt-1"
                  >
                    Join Trakt.tv for Free <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Connect with 1-Click in Settings
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    Open the <strong>Settings Hub</strong> in the top navigation bar, click the <strong>Trakt.tv Sync</strong> tab, and click the red <strong>"Sign In with Trakt.tv"</strong> button.
                  </p>
                  <ComicButton
                    variant="gold"
                    size="sm"
                    onClick={() => openSettings('trakt')}
                    rightIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    Open Trakt Settings Tab
                  </ComicButton>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Authorize & Sync Automatically
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    Trakt will ask you to authorize Multiverse Tracker. Once approved, you will be redirected back and your entire Marvel and DC watch history will sync automatically!
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Syncing Tip */}
            <div className="bg-zinc-950 border-2 border-amber-400/60 p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <span className="font-display text-sm uppercase font-black text-amber-400 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Quick Sync Tip
                </span>
                <p className="text-xs text-zinc-300 font-sans">
                  Whenever you are logged in with Trakt, a <strong>@username</strong> badge appears in the top navigation. Clicking it runs an instant real-time sync with Trakt cloud!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TMDB GUIDE */}
        {activeTab === 'tmdb' && (
          <div className="space-y-8 animate-fadeIn">
            {/* What is TMDB */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <div className="flex items-center gap-2">
                <ComicBadge variant="cyan" size="sm">Database</ComicBadge>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                  What is TMDB (The Movie Database) & What Does it Do?
                </h2>
              </div>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>TMDB</strong> is the world’s leading community-built movie and television database. Multiverse Tracker uses TMDB to deliver rich media features:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> High-Res Artwork
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Fetches official comic-styled posters, theatrical backdrops, and promotional artwork for every film and series.
                  </p>
                </div>
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> YouTube HD Trailers
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Embeds official teaser and theatrical trailer players directly inside movie detail popups with 1-click playback.
                  </p>
                </div>
                <div className="bg-zinc-950/80 border-2 border-black p-4 space-y-1">
                  <span className="font-display font-bold text-emerald-400 text-sm uppercase flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> Streaming Providers
                  </span>
                  <p className="text-xs text-zinc-400 font-sans">
                    Shows live JustWatch streaming availability (Disney+, Max / HBO, Netflix, Apple TV+, Prime Video) for your region.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero Setup Required Notice */}
            <div className="bg-emerald-950/50 border-2 border-emerald-500 p-5 shadow-[4px_4px_0px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2 font-display text-emerald-400 font-bold uppercase text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Zero Setup Required for General Use!
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker is pre-configured with built-in TMDB access. Posters, release dates, trailers, and streaming options work automatically for all users right away without needing any keys.
              </p>
            </div>

            {/* Optional: BYOK Custom Key Guide */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ComicBadge variant="gold" size="sm">Power Users (Optional)</ComicBadge>
                  <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                    How to Add Your Own Free TMDB Key (BYOK)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                  If you want your own private, unlimited API quota that runs independently from shared limits:
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-cyan-500 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Create a Free TMDB Account
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    Sign up for a free account at themoviedb.org.
                  </p>
                  <a
                    href="https://www.themoviedb.org/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider text-cyan-400 hover:text-cyan-300 underline pt-1"
                  >
                    Create Free TMDB Account <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Request an API Key
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    Go to your <strong>Account Settings $\rightarrow$ API</strong> and click <strong>Create API Key (Developer)</strong>. Fill in the simple form (name your application "My Watchlist") to get your 32-character key.
                  </p>
                  <a
                    href="https://www.themoviedb.org/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider text-cyan-400 hover:text-cyan-300 underline pt-1"
                  >
                    Go to TMDB API Settings <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Paste Key in Settings Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans">
                    Open <strong>Settings $\rightarrow$ API Keys (BYOK)</strong>, paste your TMDB key, and click <strong>Save API Key</strong>. Your key is stored securely only in your own browser storage.
                  </p>
                  <ComicButton
                    variant="cyan"
                    size="sm"
                    onClick={() => openSettings('byok')}
                    rightIcon={<Key className="w-3.5 h-3.5" />}
                  >
                    Open API Keys (BYOK) Tab
                  </ComicButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Unified Settings Modal Hub */}
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
}
