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
    { id: 'tmdb', label: '1. TMDB (Posteri & Podaci)', badge: 'Metadata', icon: Film, color: 'text-cyan-400' },
    { id: 'justwatch', label: '2. JustWatch (Streaming)', badge: 'Where to Watch', icon: Tv, color: 'text-amber-400' },
    { id: 'youtube', label: '3. YouTube (Traileri)', badge: 'Video HD', icon: Youtube, color: 'text-rose-500' },
    { id: 'supabase', label: '4. Supabase (Cloud Sync)', badge: 'Database', icon: Cloud, color: 'text-emerald-400' },
    { id: 'timelines', label: '5. Kronologija & Redoslijed', badge: 'Timeline', icon: Layers, color: 'text-purple-400' },
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
                  DETALJNI VODIČ KROZ SUSTAV
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                Svi API-ji & Tehnologije
              </ComicBadge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-wider leading-none">
              KAKO MULTIVERSE TRACKER <span className="text-amber-400">RADI?</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 font-sans max-w-3xl leading-relaxed">
              Pogledajte pojedinačno objašnjenje za svaki API i servis koji pokreće aplikaciju: <strong>TMDB</strong> za postere i podatke, <strong>JustWatch</strong> za streaming servise, <strong>YouTube</strong> za ugrađene najave, <strong>Supabase</strong> za sinkronizaciju u oblaku, te naš interni <strong>Timeline Engine</strong>.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <ComicButton
                variant="cyan"
                size="md"
                onClick={() => openSettings('account')}
                rightIcon={<Cloud className="w-4 h-4" />}
              >
                Moj Cloud Račun
              </ComicButton>
              <ComicButton
                variant="gold"
                size="md"
                onClick={() => openSettings('byok')}
                rightIcon={<Key className="w-4 h-4" />}
              >
                Osobni TMDB Ključ (BYOK)
              </ComicButton>
              <Link href="/select">
                <ComicButton variant="white" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Otvori Universe Gate
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
                      Glavni izvor filmskih podataka
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      1. The Movie Database (TMDB API)
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="cyan" size="sm">Baza Podataka & Posteri</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>The Movie Database (TMDB)</strong> je najveća otvorena globalna filmska baza podataka na svijetu. Služi kao temeljni vizualni i informacijski stup Multiverse Trackera.
              </p>

              {/* Što TMDB radi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> Službeni HD Posteri
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Dohvaća originalne kazališne i stripovske postere u visokoj rezoluciji (`image.tmdb.org`) koji se trenutno prikazuju na karticama.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Pozadinske Slike (Backdrops)
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Prikazuje filmske scene i konceptualne pozadinske slike širokog formata u skočnom prozoru svakog filma.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-4 space-y-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-emerald-400 text-sm uppercase flex items-center gap-1.5">
                    <Database className="w-4 h-4" /> Sinopsisi, Ocjene & Datumi
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Opskrbljuje točne datume svjetskih premijera, sažetke radnje, trajanje u minutama te ocjene publike.
                  </p>
                </div>
              </div>

              {/* Ugrađeni vs Osobni ključ */}
              <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500 space-y-2">
                <div className="flex items-center gap-2 font-display text-emerald-400 font-bold uppercase text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Sve radi automatski — Posjetitelji ne moraju ništa podešavati!
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Naš poslužitelj ima integriran vlastiti TMDB API ključ. Svi posteri, podaci i slike učitavaju se automatski za svakog posjetitelja čim otvori stranicu.
                </p>
              </div>

              {/* BYOK Upute */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-4 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-amber-400">
                    Opcionalno: Bring Your Own Key (BYOK)
                  </h3>
                  <ComicBadge variant="gold" size="sm">Za Napredne Korisnike</ComicBadge>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Ako želite imati vlastiti privatni neograničeni quota limit, možete unijeti svoj besplatni TMDB ključ:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">1. Registracija</strong>
                    <p className="text-zinc-400">Otvorite besplatan račun na <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-cyan-400 underline">themoviedb.org</a>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">2. Izrada Ključa</strong>
                    <p className="text-zinc-400">U postavkama profila odaberite <strong>API $\rightarrow$ Create Developer Key</strong>.</p>
                  </div>
                  <div className="bg-[#141624] border border-zinc-800 p-3 space-y-1">
                    <strong className="text-white block font-display uppercase">3. Spremanje</strong>
                    <p className="text-zinc-400">U našim postavkama pod <strong>TMDB Key</strong> zalijepite ključ i kliknite Spremi.</p>
                  </div>
                </div>

                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={() => openSettings('byok')}
                  rightIcon={<Key className="w-3.5 h-3.5" />}
                >
                  Otvori TMDB Key Postavke
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
                      Dostupnost na streaming servisima
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      2. JustWatch Integracija
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="gold" size="sm">Where To Watch</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                <strong>JustWatch</strong> je vodeća svjetska platforma za pretraživanje dostupnosti filmova i serija na legalnim streaming servisima. Ugrađena je izravno u detalje svakog naslova u Multiverse Trackeru.
              </p>

              {/* Što JustWatch radi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Tv2 className="w-4 h-4" /> Provjera Streaming Servisa
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Kada kliknete na film ili seriju, aplikacija prikazuje logotipe servisa na kojima se naslov može gledati: <strong>Disney+</strong>, <strong>HBO Max</strong>, <strong>Netflix</strong>, <strong>Apple TV+</strong>, <strong>Amazon Prime Video</strong> i <strong>SkyShowtime</strong>.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Automatsko Povezivanje
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Podaci se povlače preko službenog TMDB Watch Providers feeda kojeg u realnom vremenu održava JustWatch tim, bez potrebe za zasebnim računom.
                  </p>
                </div>
              </div>

              {/* Postavke za uključivanje/isključivanje */}
              <div className="bg-zinc-950 border-2 border-black p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <strong className="font-display text-sm uppercase text-white block">
                    Želite sakriti streaming opcije?
                  </strong>
                  <p className="text-xs text-zinc-400 font-sans">
                    U postavkama možete uključiti ili isključiti prikaz streaming ponuđača po želji.
                  </p>
                </div>
                <ComicButton
                  variant="cyan"
                  size="sm"
                  onClick={() => openSettings('features')}
                  rightIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Prilagodi u Postavkama
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
                      Ugrađeni video player
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      3. YouTube HD Najave (Traileri)
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="marvel" size="sm">Video Player</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker omogućuje gledanje službenih kazališnih i televizijskih najava izravno u pregledniku bez napuštanja aplikacije i bez dosadnih reklama trećih strana.
              </p>

              {/* Što YouTube radi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-rose-400 text-sm uppercase flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> Pametno Pronalaženje Trajlera
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Za svaki film ili seriju aplikacija pronalazi službeni YouTube video ključ kategoriziran kao *Official Trailer* ili *Teaser* od strane Marvel Studios / DC Studios.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Ugrađeni Sigurni Player
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Videozapis se reproducira u optimiziranom HD formatu s podrškom za mobilne zaslone i kontrolama preko tipkovnice.
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
                      Baza u oblaku i sinkronizacija uređaja
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      4. Supabase Cloud & Lokalna Pohrana
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="green" size="sm">Sinkronizacija</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Aplikacija koristi hibridni model dvostruke pohrane — ultrabrzi lokalni preglednik za trenutne klikove i robusnu PostgreSQL bazu u oblaku za sinkronizaciju između svih uređaja.
              </p>

              {/* 2 Metode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Gost (Lokalno u pregledniku)
                    </span>
                    <ComicBadge variant="dark" size="sm">0ms Kašnjenje</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Svaki klik na *"Watch"* se istog trena zapisuje u vaš preglednik. Nije potrebna registracija, a napredak ostaje spremljen čak i kada niste na internetu.
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-cyan-400 text-sm uppercase flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" /> Supabase Račun (U oblaku)
                    </span>
                    <ComicBadge variant="green" size="sm">Mobitel + PC + TV</ComicBadge>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Registrirajte se besplatno emailom i lozinkom. Vaša lista se sprema u Supabase bazu podataka i automatski sinkronizira kad otvorite stranicu na mobitelu ili laptopu.
                  </p>
                </div>
              </div>

              {/* JSON Sigurnosna kopija */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display font-bold text-sm uppercase text-white">
                    Prijenosne JSON Sigurnosne Kopije (Backup)
                  </h3>
                  <ComicBadge variant="gold" size="sm">Vlasništvo nad Podacima</ComicBadge>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  U postavkama pod <strong>Data & Backup</strong> možete bilo kada jednim klikom preuzeti `.json` datoteku sa svim svojim pogledanim naslovima ili je učitati na drugom uređaju.
                </p>
                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={() => openSettings('data')}
                  rightIcon={<Database className="w-3.5 h-3.5" />}
                >
                  Otvori Sigurnosne Kopije (Backup)
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
                      Redoslijedi gledanja i grane
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wide">
                      5. Kronologija & Multiverse Grane
                    </h2>
                  </div>
                </div>
                <ComicBadge variant="marvel" size="sm">Vremenske Crte</ComicBadge>
              </div>

              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                Multiverse Tracker omogućuje praćenje kompletnog Marvelovog i DC multiverzuma na dva različita načina:
              </p>

              {/* Redoslijedi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-marvel-crimson text-sm uppercase flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> 1. Redoslijed Izlaska (Release Order)
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Filmovi i serije poredani točno onako kako su izlazili u kinima od <em>Iron Mana</em> (2008) kroz Faze 1, 2, 3, 4, 5 i 6. Preporučeno za prvo gledanje!
                  </p>
                </div>

                <div className="bg-zinc-950/90 border-2 border-black p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                  <span className="font-display font-bold text-amber-400 text-sm uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> 2. Kronološki Redoslijed (Story Timeline)
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Poredano po godini u kojoj se odvija radnja u Marvelovom svijetu — počinje s <em>Captain America: The First Avenger</em> (1942.), preko <em>Captain Marvel</em> (1995.) pa nadalje.
                  </p>
                </div>
              </div>

              {/* Grane Multiverzuma */}
              <div className="bg-zinc-950 border-2 border-black p-5 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <h3 className="font-display font-bold text-sm uppercase text-cyan-400">
                  Filtriranje po Granama Multiverzuma
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  U padajućem izborniku možete filtrirati samo specifične sage:
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
