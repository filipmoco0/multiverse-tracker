'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Film,
  Tv,
  Key,
  Cloud,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Zap,
  Globe,
  Database,
  Play,
  Youtube,
  Tv2,
  Share2,
  Download,
  Award,
  Link as LinkIcon,
  Clock,
  Shield,
  Edit2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { UnifiedSettingsModal, SettingsTab } from '@/components/settings/UnifiedSettingsModal';
import { clsx } from 'clsx';

type GuideTab = 'api_keys' | 'passport' | 'supabase';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('api_keys');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('account');

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const tabs: { id: GuideTab; label: string; badge: string; icon: any; color: string }[] = [
    { id: 'api_keys', label: '1. API Keys & Media Integrations', badge: 'TMDB • JustWatch • YouTube', icon: Key, color: 'text-amber-400' },
    { id: 'passport', label: '2. Citizen Passport & Public Sharing', badge: 'Ranks • 4K • Share Links', icon: Sparkles, color: 'text-cyan-400' },
    { id: 'supabase', label: '3. Cloud Sync & Data Privacy', badge: 'Cross-Device & Backup', icon: Cloud, color: 'text-emerald-400' },
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
                  SYSTEM & FEATURE GUIDE
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                Complete Architecture Breakdown
              </ComicBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
              HOW MULTIVERSE TRACKER <span className="text-amber-400">WORKS</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Explore the features and technologies powering your comic universe tracker: <strong>API integrations</strong> for artwork and legal streaming, the <strong>Multiverse Citizen Passport</strong> with gamified ranks and 4K sharing, and <strong>Supabase</strong> for seamless cloud synchronization.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <ComicButton
                variant="gold"
                size="md"
                onClick={() => openSettings('byok')}
                rightIcon={<Key className="w-4 h-4 text-black" />}
              >
                Personal TMDB Key (BYOK)
              </ComicButton>
              <ComicButton
                variant="cyan"
                size="md"
                onClick={() => openSettings('account')}
                rightIcon={<Cloud className="w-4 h-4" />}
              >
                Cloud Account Settings
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
        {/* 1. API KEYS & MEDIA INTEGRATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'api_keys' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400 text-black font-black border-2 border-black -skew-x-6">
                    <Key className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-amber-400 block font-bold">
                      Metadata, Streaming & Video Engine
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      1. API Keys & Media Integrations
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="gold" size="sm">TMDB • JustWatch • YouTube</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker integrates three world-class APIs to deliver high-resolution posters, real-time streaming availability, and cinematic video trailers directly in your browser.
              </p>

              {/* 3 Unified Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* TMDB */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center gap-2 font-display font-bold text-cyan-400 text-sm uppercase">
                    <Film className="w-4 h-4 flex-shrink-0" />
                    <span>The Movie DB (TMDB)</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Fetches official theatrical posters, widescreen concept artwork, release dates, plot overviews, and episode counts from TMDB&apos;s global CDN.
                  </p>
                </div>

                {/* JustWatch */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center gap-2 font-display font-bold text-amber-400 text-sm uppercase">
                    <Tv2 className="w-4 h-4 flex-shrink-0" />
                    <span>JustWatch Streaming</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Detects where titles are streaming legally across <strong>Disney+</strong>, <strong>HBO Max</strong>, <strong>Netflix</strong>, <strong>Prime Video</strong>, and <strong>Apple TV</strong> in 50+ countries.
                  </p>
                </div>

                {/* YouTube */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[3px_3px_0px_0px_#000000]">
                  <div className="flex items-center gap-2 font-display font-bold text-rose-400 text-sm uppercase">
                    <Youtube className="w-4 h-4 flex-shrink-0" />
                    <span>YouTube HD Trailers</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Embeds verified official trailers from Marvel Studios and DC Studios right inside the media details modal with zero popups.
                  </p>
                </div>
              </div>

              {/* Zero Setup Banner */}
              <div className="p-4 bg-emerald-950/50 border-2 border-emerald-500 flex items-start gap-3 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-display font-bold text-emerald-400 uppercase text-sm block">
                    Zero Setup Required — Works Out of the Box!
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    The app comes pre-configured with a built-in server proxy key. All posters, cards, trailers, and streaming provider badges work automatically for all visitors.
                  </p>
                </div>
              </div>

              {/* BYOK Section */}
              <div className="bg-zinc-950 border-2 border-black p-5 sm:p-6 space-y-4 shadow-[4px_4px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-black text-base uppercase text-amber-400">
                      Optional: Bring Your Own Key (BYOK)
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans">
                      Power users can configure their private TMDB API key to bypass shared rate limits.
                    </p>
                  </div>
                  <ComicBadge variant="gold" size="sm">For Power Users</ComicBadge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1 shadow-[1px_1px_0px_0px_#000000]">
                    <strong className="text-white block font-display uppercase">1. Register</strong>
                    <p className="text-zinc-400">Create a free account on <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">themoviedb.org</a>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1 shadow-[1px_1px_0px_0px_#000000]">
                    <strong className="text-white block font-display uppercase">2. Generate Key</strong>
                    <p className="text-zinc-400">Navigate to <strong>Settings → API → Create Developer Key</strong>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1 shadow-[1px_1px_0px_0px_#000000]">
                    <strong className="text-white block font-display uppercase">3. Save in App</strong>
                    <p className="text-zinc-400">Open <strong>Settings → TMDB Key</strong>, paste your key, and click Save.</p>
                  </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-3">
                  <ComicButton
                    variant="gold"
                    size="sm"
                    onClick={() => openSettings('byok')}
                    rightIcon={<Key className="w-3.5 h-3.5 text-black" />}
                  >
                    Open TMDB Key Settings
                  </ComicButton>
                  <ComicButton
                    variant="cyan"
                    size="sm"
                    onClick={() => openSettings('features')}
                    rightIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    Customize Trailers & Providers
                  </ComicButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CITIZEN PASSPORT & PUBLIC SHARING */}
        {/* ========================================================================= */}
        {activeTab === 'passport' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500 text-black font-black border-2 border-black -skew-x-6">
                    <Sparkles className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-cyan-400 block font-bold">
                      Gamification, Analytics & Viral Sharing
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      2. Multiverse Citizen Passport & Sharing
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="cyan" size="sm">Ranks • 4K Export • Public Links</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                The <strong>Multiverse Citizen Passport</strong> turns your movie marathons into a gamified journey. Track your completion rate, unlock superhero ranks, export ultra-high-resolution cards, and share your watch journey with friends.
              </p>

              {/* 4 Feature Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {/* 1. Ranks */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center gap-1.5 font-display font-bold text-amber-400 text-sm uppercase">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Superhero Ranks</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Level up from <em>Civilian</em> to <em>Avenger</em>, <em>Sorcerer Supreme</em>, or <em>Prime Earth Legend</em> as you log more titles.
                  </p>
                </div>

                {/* 2. Marathon Time */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center gap-1.5 font-display font-bold text-cyan-400 text-sm uppercase">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Marathon Analytics</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Calculates exact watch time in hours and days, plus breakdowns across Movies, TV Series, and Special Presentations.
                  </p>
                </div>

                {/* 3. 4K PNG Export */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center gap-1.5 font-display font-bold text-emerald-400 text-sm uppercase">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Ultra HD 4K Cards</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Download crisp 300 DPI images directly to your Photos gallery (PWA) or desktop, perfect for Instagram Stories & Discord.
                  </p>
                </div>

                {/* 4. Public Links */}
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center gap-1.5 font-display font-bold text-purple-400 text-sm uppercase">
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <span>Public Share Links</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Generate instant share links (`?shared=...`). Friends can view your watched list or copy all your checkmarks with 1 click!
                  </p>
                </div>
              </div>

              {/* Ranks Breakdown Table */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Marvel & DC Rank Tiers
                  </h3>
                  <ComicBadge variant="gold" size="sm">7 Progression Tiers</ComicBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  {/* MCU Ranks */}
                  <div className="bg-[#141624] border border-zinc-800 p-4 space-y-2">
                    <span className="font-display font-black text-marvel-crimson text-sm uppercase block border-b border-zinc-800 pb-1">
                      Marvel MCU Ranks
                    </span>
                    <ul className="space-y-1.5 text-zinc-300">
                      <li><strong>0%:</strong> 👤 Civilian (Daily Bugle Reader)</li>
                      <li><strong>1–15%:</strong> 🛡️ S.H.I.E.L.D. Recruit (Level 1 Clearance)</li>
                      <li><strong>16–35%:</strong> 🕸️ Street-Level Hero (Defender of NY)</li>
                      <li><strong>36–60%:</strong> 🦸‍♂️ Official Avenger (Earth&apos;s Mightiest)</li>
                      <li><strong>61–85%:</strong> ✨ Sorcerer Supreme (Mystic Arts Master)</li>
                      <li><strong>86–99%:</strong> 🪐 Multiverse Guardian (Nexus Being)</li>
                      <li><strong>100%:</strong> 👑 The One Above All (Master of the Multiverse)</li>
                    </ul>
                  </div>

                  {/* DCU Ranks */}
                  <div className="bg-[#141624] border border-zinc-800 p-4 space-y-2">
                    <span className="font-display font-black text-cyan-400 text-sm uppercase block border-b border-zinc-800 pb-1">
                      DC Universe Ranks
                    </span>
                    <ul className="space-y-1.5 text-zinc-300">
                      <li><strong>0%:</strong> 👤 Gotham Citizen (Watching the Skies)</li>
                      <li><strong>1–15%:</strong> 🚨 GCPD Detective (Badge #1939)</li>
                      <li><strong>16–35%:</strong> 🦇 Bat-Family Vigilante (Knight of Gotham)</li>
                      <li><strong>36–60%:</strong> ⚡ Justice League Member (Hall of Justice)</li>
                      <li><strong>61–85%:</strong> 💚 Green Lantern Corps (Sector 2814 Guardian)</li>
                      <li><strong>86–99%:</strong> 🌀 Speed Force Champion (Crisis Survivor)</li>
                      <li><strong>100%:</strong> 👑 Prime Earth Legend (100% DC Universe Master)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How Public Sharing Works */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <h3 className="font-display font-bold text-sm uppercase text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-cyan-400" /> How Public Watchlist Links Work
                </h3>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  When you click <strong>&quot;Copy Public Share Link&quot;</strong> in your passport, your completed checkmarks and custom name are encoded into a compact URL token. When a friend opens the link:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans pt-1">
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-amber-400 font-display uppercase block">1. Read-Only Shared Mode</strong>
                    <p className="text-zinc-400">They see all your watched titles marked with gold borders without altering their own list.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-emerald-400 font-display uppercase block">2. &quot;Copy to My Tracker&quot;</strong>
                    <p className="text-zinc-400">With 1 click, they can import all your watched titles into their own personal tracker profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CLOUD SYNC & DATA PRIVACY */}
        {/* ========================================================================= */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141624] border-[3px] border-black p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000000] space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-black font-black border-2 border-black -skew-x-6">
                    <Cloud className="w-6 h-6 skew-x-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-emerald-400 block font-bold">
                      PostgreSQL Cloud & Offline LocalStorage
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      3. Cloud Sync & Data Privacy
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="green" size="sm">Real-Time Sync</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker uses a hybrid storage architecture: instant local browser storage for 0ms responsiveness and Supabase PostgreSQL in the cloud for seamless multi-device synchronization.
              </p>

              {/* 2 Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Guest Mode (Instant Local Cache)
                    </span>
                    <ComicBadge variant="dark" size="sm">0ms Latency</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Every click on <em>&quot;Watched&quot;</em> is saved immediately to your browser&apos;s local storage. Zero registration required, completely private with no cookies or ads.
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
                    Sign up with your email. Your entire watch history and custom BYOK settings automatically back up and sync in real time across your smartphone, tablet, and PC.
                  </p>
                </div>
              </div>

              {/* JSON Backup */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" /> Portable JSON Data Backups
                  </h3>
                  <ComicBadge variant="gold" size="sm">Data Sovereignty</ComicBadge>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  You own 100% of your data. Open <strong>Settings → Data &amp; Backup</strong> anytime to download a portable `.json` backup file or restore your history onto any device.
                </p>
                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={() => openSettings('data')}
                  rightIcon={<Database className="w-3.5 h-3.5 text-black" />}
                >
                  Open Data &amp; Backup Tab
                </ComicButton>
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

