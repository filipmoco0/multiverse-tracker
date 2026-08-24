'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Layers, Sliders, Cloud, Zap, RefreshCw } from 'lucide-react';
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
      // Check initial session
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user;
        setCurrentAuthUser(user || null);
        if (user) {
          loadUserProfileFromCloud(user.id);
        }
      });

      // Listen for auth state changes
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

          {/* Right Action Icons (Unified Settings & Admin) */}
          <div className="flex items-center gap-2">
            {/* Quick Trakt Sync Trigger (If Trakt is connected) */}
            {traktUser && (
              <button
                onClick={syncWithTrakt}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-2 border-rose-600 shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer"
                title={`Trakt Connected: @${traktUser.username}. Click to sync.`}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                <span className="hidden lg:inline font-sans font-semibold">
                  {isSyncing ? 'Syncing...' : `@${traktUser.username}`}
                </span>
              </button>
            )}

            {/* Unified Settings & Account Button */}
            <button
              onClick={() => openSettings('account')}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-xs font-display transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5',
                currentAuthUser
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
              )}
              title="Settings & Cloud Account"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="font-bold uppercase tracking-wider hidden sm:inline">
                {currentAuthUser ? currentAuthUser.email?.split('@')[0] : 'Settings'}
              </span>
              {(currentAuthUser || traktUser || isCustomTmdbActive) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Cloud Active" />
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
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
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
