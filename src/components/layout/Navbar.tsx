'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Layers, Sliders, RefreshCw, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useByokStore } from '@/lib/store/useByokStore';
import { UnifiedSettingsModal, SettingsTab } from '../settings/UnifiedSettingsModal';
import { createClient } from '@/lib/supabase/client';
import { loadUserProfileFromCloud } from '@/lib/supabase/user-profile';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { traktUser, isSyncing, syncWithTrakt } = useWatchlistStore();
  const { isCustomTmdbActive } = useByokStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<SettingsTab>('account');
  const [currentAuthUser, setCurrentAuthUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user;
        setCurrentAuthUser(user || null);
        if (user) {
          loadUserProfileFromCloud(user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user;
        setCurrentAuthUser(user || null);
        if (user) {
          loadUserProfileFromCloud(user.id);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const isMCU = pathname?.startsWith('/mcu');
  const isDCU = pathname?.startsWith('/dcu');
  const isAdmin = pathname?.startsWith('/admin');

  const openSettings = (tab: SettingsTab = 'account') => {
    setInitialTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0d14]/95 backdrop-blur-md border-b-[3px] border-black shadow-[0_4px_0_0_#000000] pt-[env(safe-area-inset-top,0px)] w-full overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 xl:px-10 h-14 sm:h-18 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Logo & Title (Ultra Compact on Mobile) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/select"
              className="flex items-center gap-1.5 sm:gap-2 group transition-transform active:scale-95"
            >
              <img
                src="/logo.png"
                alt="Multiverse Tracker Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:rotate-6 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-base sm:text-xl tracking-wider text-white group-hover:text-amber-400 transition-colors uppercase leading-none">
                  <span className="hidden xs:inline">Multiverse</span>
                  <span className="text-amber-400">Tracker</span>
                </span>
                <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest hidden md:block">
                  MCU & DCU Watchlist
                </span>
              </div>
            </Link>
          </div>

          {/* Universe Navigation Switcher Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link
              href="/mcu"
              className={clsx(
                'px-2.5 sm:px-4 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black -skew-x-6 select-none',
                isMCU
                  ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              <span className="inline-block skew-x-6 sm:hidden">Marvel</span>
              <span className="hidden sm:inline-block skew-x-6">Marvel MCU</span>
            </Link>

            <Link
              href="/dcu"
              className={clsx(
                'px-2.5 sm:px-4 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black -skew-x-6 select-none',
                isDCU
                  ? 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              <span className="inline-block skew-x-6 sm:hidden">DC</span>
              <span className="hidden sm:inline-block skew-x-6">DC Universe</span>
            </Link>

            <Link
              href="/select"
              className="p-1 sm:px-3 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] -skew-x-6 hidden lg:flex items-center gap-1"
              title="Universe Selection Gate"
            >
              <Layers className="w-3.5 h-3.5 skew-x-6" />
              <span className="inline-block skew-x-6">Gate</span>
            </Link>

            <Link
              href="/guide"
              className={clsx(
                'p-1 sm:px-3 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] -skew-x-6 hidden md:flex items-center gap-1',
                pathname?.startsWith('/guide')
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              )}
              title="Trakt.tv & TMDB Setup Guide"
            >
              <BookOpen className={clsx('w-3.5 h-3.5 skew-x-6', pathname?.startsWith('/guide') ? 'text-black' : 'text-amber-400')} />
              <span className="inline-block skew-x-6">Guide</span>
            </Link>
          </nav>

          {/* Right Action Buttons (Settings & Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Unified Settings & Account Button */}
            <button
              onClick={() => openSettings('account')}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5',
                currentAuthUser
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
              )}
              title="Settings & Cloud Account"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
              <span className="font-bold uppercase tracking-wider hidden md:inline">
                {currentAuthUser ? currentAuthUser.email?.split('@')[0] : 'Settings'}
              </span>
              {(currentAuthUser || traktUser || isCustomTmdbActive) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" title="Cloud Active" />
              )}
            </button>

            {/* Admin Dashboard */}
            <Link
              href="/admin"
              className={clsx(
                'p-1.5 sm:px-2.5 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display flex items-center gap-1 transition',
                isAdmin
                  ? 'bg-amber-400 text-black font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              title="Admin Curator Dashboard"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Unified Settings Modal Hub */}
      <UnifiedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={initialTab}
      />
    </>
  );
};
