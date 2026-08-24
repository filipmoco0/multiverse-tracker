'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, Shield, Layers, Database, Zap, Key } from 'lucide-react';
import { clsx } from 'clsx';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useByokStore } from '@/lib/store/useByokStore';
import { BackupModal } from './BackupModal';
import { TraktAuthModal } from '../auth/TraktAuthModal';
import { ByokModal } from '../settings/ByokModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { authMode, traktUser, isSyncing, syncWithTrakt } = useWatchlistStore();
  const { isCustomTmdbActive, isCustomTraktActive } = useByokStore();

  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isTraktModalOpen, setIsTraktModalOpen] = useState(false);
  const [isByokModalOpen, setIsByokModalOpen] = useState(false);

  const isMCU = pathname?.startsWith('/mcu');
  const isDCU = pathname?.startsWith('/dcu');
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0d14]/95 backdrop-blur-md border-b-[3px] border-black shadow-[0_4px_0_0_#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link
              href="/select"
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-400 border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] -skew-x-6 flex items-center justify-center font-display font-black text-xl sm:text-2xl text-black group-hover:rotate-6 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-white group-hover:text-amber-400 transition-colors uppercase leading-none">
                  Multiverse<span className="text-amber-400">Tracker</span>
                </span>
                <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
                  MCU & DCU Watchlist
                </span>
              </div>
            </Link>
          </div>

          {/* Universe Navigation Switcher Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/mcu"
              className={clsx(
                'px-3 sm:px-4 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-[3px] border-black -skew-x-6 select-none',
                isMCU
                  ? 'bg-marvel-crimson text-white shadow-[3px_3px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000000]'
              )}
            >
              <span className="inline-block skew-x-6">Marvel MCU</span>
            </Link>

            <Link
              href="/dcu"
              className={clsx(
                'px-3 sm:px-4 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-[3px] border-black -skew-x-6 select-none',
                isDCU
                  ? 'bg-[#005792] text-white shadow-[3px_3px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000000]'
              )}
            >
              <span className="inline-block skew-x-6">DC Universe</span>
            </Link>

            <Link
              href="/select"
              className="p-1.5 sm:px-3 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] -skew-x-6 hidden md:flex items-center gap-1"
              title="Universe Selection Hub"
            >
              <Layers className="w-4 h-4 skew-x-6" />
              <span className="inline-block skew-x-6">Gate</span>
            </Link>
          </nav>

          {/* Right Action Icons (BYOK, Trakt Sync, Backup, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* BYOK API Keys Button */}
            <button
              onClick={() => setIsByokModalOpen(true)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer',
                isCustomTmdbActive || isCustomTraktActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 hover:bg-cyan-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              )}
              title="Bring Your Own API Keys (TMDB / Trakt)"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">BYOK Keys</span>
              {(isCustomTmdbActive || isCustomTraktActive) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Trakt Status / Connect button */}
            {authMode === 'trakt' && traktUser ? (
              <button
                onClick={syncWithTrakt}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-900/50 hover:bg-rose-900/80 text-rose-300 border-2 border-rose-600 shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer"
                title={`Trakt Connected: @${traktUser.username}. Click to sync.`}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                <span className="hidden lg:inline font-sans font-semibold">
                  {isSyncing ? 'Syncing...' : `@${traktUser.username}`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsTraktModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E62429]/90 hover:bg-[#E62429] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer"
                title="Connect Trakt.tv account"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Connect Trakt</span>
              </button>
            )}

            {/* Guest Backup */}
            <button
              onClick={() => setIsBackupOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer"
              title="Backup or restore watchlist progress"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Backup</span>
            </button>

            {/* Admin Dashboard */}
            <Link
              href="/admin"
              className={clsx(
                'p-1.5 sm:px-2.5 sm:py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display flex items-center gap-1 transition',
                isAdmin
                  ? 'bg-amber-400 text-black font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              title="Admin Curator Dashboard"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Guest Backup Modal */}
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />

      {/* Trakt Connection Modal */}
      <TraktAuthModal isOpen={isTraktModalOpen} onClose={() => setIsTraktModalOpen(false)} />

      {/* BYOK API Keys Modal */}
      <ByokModal isOpen={isByokModalOpen} onClose={() => setIsByokModalOpen(false)} />
    </>
  );
};
