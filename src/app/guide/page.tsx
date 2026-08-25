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
  Youtube,
  Tv2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { UnifiedSettingsModal, SettingsTab } from '@/components/settings/UnifiedSettingsModal';
import { clsx } from 'clsx';

type GuideTab = 'tmdb' | 'justwatch' | 'youtube' | 'supabase' | 'timelines';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('tmdb');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const tabs: { id: GuideTab; label: string; badge: string; icon: any; color: string }[] = [
    { id: 'tmdb', label: '1. TMDB (Posters & Data)', badge: 'Metadata', icon: Film, color: 'text-cyan-400' },
    { id: 'justwatch', label: '2. JustWatch (Streaming)', badge: 'Where to Watch', icon: Tv, color: 'text-amber-400' },
    { id: 'youtube', label: '3. YouTube (HD Trailers)', badge: 'Video HD', icon: Youtube, color: 'text-rose-500' },
    { id: 'supabase', label: '4. Supabase (Cloud Sync)', badge: 'Database', icon: Cloud, color: 'text-emerald-400' },
    { id: 'timelines', label: '5. Timelines & Watch Orders', badge: 'Timeline', icon: Layers, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Banner */}
        <section className="relative bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <ComicBadge variant="gold" size="md">
                <span className="flex items-center gap-1 font-black">
                  <Sparkles className="w-4 h-4 text-black" />
                  SYSTEM & API ARCHITECTURE GUIDE
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                Complete Feature Breakdown
              </ComicBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
              HOW MULTIVERSE TRACKER <span className="text-amber-400">WORKS</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Discover how our modular tech stack powers your ultimate comic experience: <strong>TMDB</strong> for high-resolution artwork and metadata, <strong>JustWatch</strong> for real-time streaming availability, <strong>YouTube</strong> for embedded video trailers, <strong>Supabase</strong> for seamless multi-device cloud synchronization, and our custom <strong>Multiverse Timeline Engine</strong>.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <ComicButton
                variant="cyan"
                size="md"
                onClick={() => openSettings('account')}
                rightIcon={<Cloud className="w-4 h-4" />}
              >
                Cloud Account Settings
              </ComicButton>
              <ComicButton
                variant="gold"
                size="md"
                onClick={() => openSettings('byok')}
                rightIcon={<Key className="w-4 h-4" />}
              >
                Personal TMDB Key (BYOK)
              </ComicButton>
              <Link href="/select">
                <ComicButton variant="white" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Universe Gate
                </ComicButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b-2 border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 font-display text-xs sm:text-sm font-black uppercase transition -skew-x-6 border-2 border-black cursor-pointer shadow-[3px_3px_0px_0px_#000000] flex-shrink-0',
                  isActive
                    ? 'bg-amber-400 text-black border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Icon className={clsx('w-4 h-4 skew-x-6', isActive ? 'text-black' : tab.color)} />
                <span className="skew-x-6">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 1. TMDB (THE MOVIE DATABASE) */}
        {/* ========================================================================= */}
        {activeTab === 'tmdb' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500 text-black font-black border-2 border-black -skew-x-6">
                    <Film className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-cyan-400 block font-bold">
                      Primary Media & Visuals Engine
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      1. The Movie Database (TMDB API)
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="cyan" size="sm">Database & Posters</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>The Movie Database (TMDB)</strong> is the world&apos;s leading open community-built movie and TV database. It serves as the primary metadata engine for Multiverse Tracker.
              </p>

              {/* What TMDB Powers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> Official HD Posters
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Fetches high-resolution theatrical and comic-styled artwork directly from TMDB&apos;s global CDN (`image.tmdb.org`).
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Theatrical Backdrops
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Supplies widescreen cinematic concept art and background headers displayed inside each media detail modal.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-emerald-400 text-sm uppercase flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> Overviews, Ratings & Dates
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Provides official plot synopses, world premiere dates, runtimes, audience ratings, and episode breakdowns.
                  </p>
                </div>
              </div>

              {/* Built-in Key Notice */}
              <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500 space-y-2">
                <div className="flex items-center gap-2 font-display text-emerald-400 font-bold uppercase text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Zero Setup Required — Works Out of the Box!
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Our application comes pre-configured with a built-in server-side TMDB API integration. All posters, media cards, and details work instantly for every visitor without any registration.
                </p>
              </div>

              {/* BYOK Guide */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-amber-400">
                    Optional: Bring Your Own Key (BYOK)
                  </h3>
                  <ComicBadge variant="gold" size="sm">For Power Users</ComicBadge>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  If you prefer to bypass all shared server rate limits and use your own private API quota, you can configure your free personal key:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">1. Register</strong>
                    <p className="text-zinc-400">Create a free account on <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-cyan-400 underline">themoviedb.org</a>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">2. Generate Key</strong>
                    <p className="text-zinc-400">Navigate to profile <strong>Settings → API → Create Developer Key</strong>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">3. Save Key</strong>
                    <p className="text-zinc-400">Open our <strong>Settings → TMDB Key</strong>, paste your key, and click Save.</p>
                  </div>
                </div>

                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={() => openSettings('byok')}
                  rightIcon={<Key className="w-3.5 h-3.5" />}
                >
                  Open TMDB Key Settings
                </ComicButton>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. JUSTWATCH STREAMING ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'justwatch' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400 text-black font-black border-2 border-black -skew-x-6">
                    <Tv className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-amber-400 block font-bold">
                      Legal Streaming Service Availability
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      2. JustWatch Streaming Integration
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="gold" size="sm">Where To Watch</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>JustWatch</strong> is the international standard for searching streaming availability across licensed providers. It is integrated seamlessly inside every movie and TV series detail card.
              </p>

              {/* What JustWatch Powers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Tv2 className="w-4 h-4" /> Live Provider Detection
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Displays official platform badges showing where you can stream right now: <strong>Disney+</strong>, <strong>HBO Max</strong>, <strong>Netflix</strong>, <strong>Apple TV+</strong>, <strong>Amazon Prime Video</strong>, and <strong>SkyShowtime</strong>.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Automated Watch Provider Feed
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Data is synced automatically through the official TMDB Watch Providers feed maintained in real time by the JustWatch curation team.
                  </p>
                </div>
              </div>

              {/* UI Toggle in Settings */}
              <div className="bg-zinc-950 border-2 border-black p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <strong className="font-display text-sm uppercase text-white block">
                    Prefer a Minimal Interface?
                  </strong>
                  <p className="text-xs text-zinc-400 font-sans">
                    You can toggle streaming providers and trailer widgets ON or OFF anytime in your settings.
                  </p>
                </div>
                <ComicButton
                  variant="cyan"
                  size="sm"
                  onClick={() => openSettings('features')}
                  rightIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Customize in Features Tab
                </ComicButton>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. YOUTUBE HD TRAILER ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'youtube' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-600 text-white font-black border-2 border-black -skew-x-6">
                    <Youtube className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-rose-400 block font-bold">
                      Embedded In-App Media Player
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      3. YouTube HD Theatrical Trailers
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="marvel" size="sm">Video Player</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker lets you watch official teasers and theatrical trailers right inside your browser modal without leaving the page and with zero third-party video popups.
              </p>

              {/* What YouTube Powers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-rose-400 text-sm uppercase flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> Official Teaser & Trailer Discovery
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Resolves official trailer video keys verified directly from Marvel Studios and DC Studios YouTube channels.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Privacy-Enhanced Embedded Player
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Videos stream in crisp high definition with full mobile fullscreen and keyboard playback controls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SUPABASE CLOUD & LOCALSTORAGE */}
        {/* ========================================================================= */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-black font-black border-2 border-black -skew-x-6">
                    <Cloud className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-emerald-400 block font-bold">
                      Cloud Database & Multi-Device Sync
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      4. Supabase Cloud & Local Storage
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="green" size="sm">Real-Time Sync</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker utilizes a high-performance dual-storage architecture — instant local storage for 0ms UI response times and Supabase PostgreSQL in the cloud for cross-device synchronization.
              </p>

              {/* 2 Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Guest Mode (Instant Local Cache)
                    </span>
                    <ComicBadge variant="dark" size="sm">0ms Latency</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Every click on *"Watch"* is saved immediately to your browser&apos;s local storage. No registration is required, and your progress is preserved even when browsing offline.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" /> Supabase Account (Cloud Sync)
                    </span>
                    <ComicBadge variant="green" size="sm">Phone + Laptop + TV</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Sign up with your email and password. Your entire watch history is automatically backed up in the cloud and synced in real time across your smartphone, laptop, tablet, and smart TV.
                  </p>
                </div>
              </div>

              {/* JSON Backup */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-white">
                    Portable JSON Data Backups
                  </h3>
                  <ComicBadge variant="gold" size="sm">Data Sovereignty</ComicBadge>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  You own your data. Open <strong>Settings → Data & Backup</strong> anytime to download a portable `.json` backup file or restore your history onto any fresh device.
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
        {/* 5. MULTIVERSE TIMELINE ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'timelines' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 text-white font-black border-2 border-black -skew-x-6">
                    <Layers className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-purple-400 block font-bold">
                      Viewing Orders & Franchise Sagas
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      5. Multiverse Timelines & Watch Orders
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="marvel" size="sm">Curated Canon</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker is carefully structured to provide both theatrical release order and in-universe chronological story timelines:
              </p>

              {/* Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-marvel-crimson text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> 1. Release Order
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Movies and shows organized strictly by theatrical premiere date, starting with <em>Iron Man</em> (2008) through Phases 1, 2, 3, 4, 5, and 6. Recommended for first-time viewers!
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> 2. Chronological Story Timeline
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Re-orders every entry strictly according to in-universe storyline chronology, starting from <em>Captain America: The First Avenger</em> (1942), through <em>Captain Marvel</em> (1995), and onwards.
                  </p>
                </div>
              </div>

              {/* Multiverse Branch Filtering */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <h3 className="font-display font-bold text-sm uppercase text-cyan-400">
                  Multiverse Branch Filtering
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Use the tracklist branch dropdown to filter specific sagas across the multiverse:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-display uppercase text-white">Sacred Timeline (MCU)</span>
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-display uppercase text-white">Defenders Saga (Daredevil/Punisher)</span>
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-display uppercase text-white">Fox X-Men & Deadpool</span>
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-display uppercase text-white">Sony Spider-Man (Spider-Verse)</span>
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-xs font-display uppercase text-white">DC Extended Universe & Elseworlds</span>
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
