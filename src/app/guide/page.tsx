'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Film,
  Tv,
  Key,
  Cloud,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sliders,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Database,
  Play,
  Heart,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { UnifiedSettingsModal, SettingsTab } from '@/components/settings/UnifiedSettingsModal';
import { clsx } from 'clsx';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'tmdb' | 'cloud' | 'timelines'>('tmdb');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <section className="relative bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <ComicBadge variant="gold" size="md">
                <span className="flex items-center gap-1 font-black">
                  <Sparkles className="w-4 h-4 text-black" />
                  ARCHITECTURE & USER GUIDE
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                TMDB API & Cloud Sync
              </ComicBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
              HOW MULTIVERSE TRACKER <span className="text-amber-400">WORKS</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Explore how <strong>The Movie Database (TMDB) API</strong> powers high-resolution artwork, video trailers, and streaming options, how our <strong>Supabase Cloud</strong> synchronizes your watchlist across devices, and how to navigate the Marvel & DC multiverse timelines.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <ComicButton
                variant="cyan"
                size="md"
                onClick={() => openSettings('account')}
                rightIcon={<Cloud className="w-4 h-4" />}
              >
                Open Cloud Account
              </ComicButton>
              <ComicButton
                variant="gold"
                size="md"
                onClick={() => openSettings('byok')}
                rightIcon={<Key className="w-4 h-4" />}
              >
                Manage TMDB Key (BYOK)
              </ComicButton>
              <Link href="/select">
                <ComicButton variant="white" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Universe Gate
                </ComicButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b-2 border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tmdb')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-display text-xs sm:text-sm font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000] flex-shrink-0',
              activeTab === 'tmdb'
                ? 'bg-cyan-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Film className="w-4 h-4 skew-x-6" />
            <span className="skew-x-6">1. TMDB API & Media Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-display text-xs sm:text-sm font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000] flex-shrink-0',
              activeTab === 'cloud'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Cloud className="w-4 h-4 skew-x-6" />
            <span className="skew-x-6">2. Cloud Sync & Local Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('timelines')}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 font-display text-xs sm:text-sm font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000] flex-shrink-0',
              activeTab === 'timelines'
                ? 'bg-marvel-crimson text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <Layers className="w-4 h-4 skew-x-6" />
            <span className="skew-x-6">3. Timelines & Watch Orders</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TMDB API GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'tmdb' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-4">
              <div className="flex items-center gap-2">
                <ComicBadge variant="cyan" size="sm">Primary Data Provider</ComicBadge>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                  What is TMDB (The Movie Database) & How We Use It?
                </h2>
              </div>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>The Movie Database (TMDB)</strong> is a world-class, community-built movie and TV metadata library. In Multiverse Tracker, TMDB serves as our core content engine, powering all visuals and entertainment data:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Feature 1 */}
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> HD Artwork & Posters
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Fetches official theatrical posters, high-res backdrops, and promotional graphics with instant CDN caching.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> Embedded HD Trailers
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Queries official YouTube teasers and theatrical trailer video IDs directly embedded inside movie detail cards.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-emerald-400 text-sm uppercase flex items-center gap-1.5">
                    <Tv className="w-4 h-4" /> Streaming Availability
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Integrates live JustWatch provider data showing where to stream on Disney+, HBO Max, Netflix, Apple TV+, and Prime.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-rose-400 text-sm uppercase flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> Metadata & Ratings
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Supplies exact release dates, community ratings, episode runtimes, taglines, and cast/character credits.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero Setup Required Notice */}
            <div className="bg-emerald-950/60 border-2 border-emerald-500 p-5 shadow-[4px_4px_0px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2 font-display text-emerald-400 font-bold uppercase text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Zero Setup Required — Works Out of the Box!
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker comes pre-configured with a built-in server-side TMDB API integration. You do <strong>not</strong> need to register or configure anything to view posters, play trailers, or check where to stream.
              </p>
            </div>

            {/* Optional BYOK Guide */}
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ComicBadge variant="gold" size="sm">Power Users (Optional)</ComicBadge>
                  <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                    Bring Your Own Key (BYOK): Add Your Personal TMDB Key
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans">
                  If you prefer to bypass all shared server rate limits and use your own private API quota, you can add your personal TMDB API key in 3 easy steps:
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-cyan-500 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Create a Free TMDB Account
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                    Visit The Movie Database website and register a free personal account.
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
                <div className="space-y-1 flex-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Generate Your API Key (v3 auth)
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                    Navigate to your TMDB account <strong>Settings → API</strong> and click <strong>Create → Developer</strong>. Accept the terms to generate your instant 32-character API key.
                  </p>
                  <a
                    href="https://www.themoviedb.org/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-display uppercase tracking-wider text-amber-400 hover:text-amber-300 underline pt-1"
                  >
                    Go to TMDB API Dashboard <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display font-black text-lg text-black flex items-center justify-center -skew-x-6 flex-shrink-0">
                  3
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-display font-bold text-base uppercase text-white">
                    Paste Key in Settings Hub
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                    Open <strong>Settings & Preferences → TMDB Key</strong>, paste your key, and click <strong>Save TMDB Key</strong>. It is stored securely in your browser and automatically synced to your cloud account.
                  </p>
                  <ComicButton
                    variant="cyan"
                    size="sm"
                    onClick={() => openSettings('byok')}
                    rightIcon={<Key className="w-3.5 h-3.5" />}
                  >
                    Open TMDB Key Settings Tab
                  </ComicButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CLOUD & LOCAL STORAGE */}
        {/* ========================================================================= */}
        {activeTab === 'cloud' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-4">
              <div className="flex items-center gap-2">
                <ComicBadge variant="green" size="sm">Cross-Device Sync</ComicBadge>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                  How Watchlist Syncing Works
                </h2>
              </div>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker provides a dual-layer storage system designed for instant responsiveness and effortless cloud portability:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Method 1 */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> 1. Instant Local Storage (Guest)
                    </span>
                    <ComicBadge variant="dark" size="sm">Zero Signup</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Whenever you mark a movie or show as watched, your progress is immediately written to your browser&apos;s local cache. It loads in 0ms, requires no login, and persists even when offline.
                  </p>
                </div>

                {/* Method 2 */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" /> 2. Supabase Cloud Account
                    </span>
                    <ComicBadge variant="green" size="sm">Multi-Device</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Create a free account with your email and password. Your entire watch history is automatically backed up in real time and synced seamlessly across your smartphone, laptop, tablet, and smart TV browser.
                  </p>
                </div>
              </div>

              {/* Data & Backup */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h3 className="font-display font-bold text-base uppercase text-white">
                  Portable JSON Backups
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  You always own your data. Open <strong>Settings → Data & Backup</strong> anytime to download a portable JSON file containing your complete watch history, or restore an existing backup on any new device.
                </p>
                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={() => openSettings('data')}
                  rightIcon={<Database className="w-3.5 h-3.5" />}
                >
                  Open Data & Backup Tab
                </ComicButton>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TIMELINES & WATCH ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'timelines' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 shadow-[5px_5px_0px_0px_#000000] space-y-4">
              <div className="flex items-center gap-2">
                <ComicBadge variant="marvel" size="sm">Timeline Engine</ComicBadge>
                <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide">
                  Marvel & DC Multiverse Timelines
                </h2>
              </div>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker is meticulously curated with accurate release and in-universe chronological orderings:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <span className="font-display font-bold text-marvel-crimson text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> Release Order
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Follows theatrical and broadcast debut dates as originally experienced by fans in cinemas and on television from Phase 1 through the latest releases.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Chronological Story Order
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Re-orders the entire cinematic universe strictly according to canonical storyline events, starting with <em>Captain America: The First Avenger</em> (1942) and flowing across the sacred timeline.
                  </p>
                </div>
              </div>

              {/* Branch Filters */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <h3 className="font-display font-bold text-base uppercase text-white">
                  Universe Branch Filtering
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                  Use the tracklist branch dropdown to isolate specific sagas: <strong>Sacred Timeline</strong>, <strong>Defenders Saga (Netflix)</strong>, <strong>Multiverse & Fox X-Men</strong>, <strong>Sony Spider-Man Universe</strong>, and <strong>Marvel Animation</strong>.
                </p>
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
