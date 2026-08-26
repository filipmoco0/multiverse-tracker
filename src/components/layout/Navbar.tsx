'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Layers, Sliders, BookOpen, Menu, X, Home, Film, Sparkles, User, Key } from 'lucide-react';
import { clsx } from 'clsx';
import { useByokStore } from '@/lib/store/useByokStore';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { UnifiedSettingsModal, SettingsTab } from '../settings/UnifiedSettingsModal';
import { createClient } from '@/lib/supabase/client';
import { loadUserProfileFromCloud } from '@/lib/supabase/user-profile';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isCustomTmdbActive } = useByokStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<SettingsTab>('account');
  const [currentAuthUser, setCurrentAuthUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load persisted localStorage data into store (must run on client after mount)
    useWatchlistStore.getState().hydrateFromStorage();

    const supabase = createClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const user = data.session?.user;
        setCurrentAuthUser(user || null);
        if (user) {
          useWatchlistStore.setState({
            supabaseUser: { id: user.id, email: user.email || '' },
            authMode: 'supabase',
          });
          loadUserProfileFromCloud(user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user;
        setCurrentAuthUser(user || null);
        if (user) {
          useWatchlistStore.setState({
            supabaseUser: { id: user.id, email: user.email || '' },
            authMode: 'supabase',
          });
          loadUserProfileFromCloud(user.id);
        } else {
          useWatchlistStore.setState({
            supabaseUser: null,
            authMode: 'guest',
          });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isMCU = pathname?.startsWith('/mcu');
  const isDCU = pathname?.startsWith('/dcu');
  const isSelect = pathname === '/select';
  const isGuide = pathname?.startsWith('/guide');
  const isAdmin = pathname?.startsWith('/admin');

  const openSettings = (tab: SettingsTab = 'account') => {
    setInitialTab(tab);
    setIsSettingsOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0d14]/95 backdrop-blur-md border-b-[3px] border-black shadow-[0_4px_0_0_#000000] pt-[env(safe-area-inset-top,0px)] w-full">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 xl:px-10 h-14 sm:h-18 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Logo & Title */}
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
                  <span className="hidden xs:inline">MULTIVERSE </span>
                  <span className="text-amber-400">TRACKER</span>
                </span>
                <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest hidden md:block">
                  Marvel & DC Cinematic Universe
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Universe Navigation Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link
              href="/mcu"
              className={clsx(
                'px-3 sm:px-4 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black -skew-x-6 select-none flex items-center gap-1.5',
                isMCU
                  ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 skew-x-6 hidden lg:inline-block" />
              <span className="inline-block skew-x-6">Marvel MCU</span>
            </Link>

            <Link
              href="/dcu"
              className={clsx(
                'px-3 sm:px-4 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black -skew-x-6 select-none flex items-center gap-1.5',
                isDCU
                  ? 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 skew-x-6 hidden lg:inline-block" />
              <span className="inline-block skew-x-6">DC Universe</span>
            </Link>

            <Link
              href="/select"
              className={clsx(
                'px-3 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] -skew-x-6 flex items-center gap-1.5',
                isSelect
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400'
              )}
              title="Universe Selection Gate"
            >
              <Layers className="w-3.5 h-3.5 skew-x-6" />
              <span className="inline-block skew-x-6">Gate</span>
            </Link>

            <Link
              href="/guide"
              className={clsx(
                'px-3 py-1 sm:py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000000] -skew-x-6 flex items-center gap-1.5',
                isGuide
                  ? 'bg-amber-400 text-black font-black'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              )}
              title="TMDB & Architecture Setup Guide"
            >
              <BookOpen className={clsx('w-3.5 h-3.5 skew-x-6', isGuide ? 'text-black' : 'text-amber-400')} />
              <span className="inline-block skew-x-6">Guide</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Universe Toggle on Mobile */}
            <div className="flex md:hidden items-center gap-1">
              <Link
                href="/mcu"
                className={clsx(
                  'px-2 py-1 font-display text-[11px] font-bold uppercase border-2 border-black -skew-x-6',
                  isMCU ? 'bg-marvel-crimson text-white shadow-[2px_2px_0px_0px_#000000]' : 'bg-zinc-900 text-zinc-300'
                )}
              >
                <span className="inline-block skew-x-6">MCU</span>
              </Link>
              <Link
                href="/dcu"
                className={clsx(
                  'px-2 py-1 font-display text-[11px] font-bold uppercase border-2 border-black -skew-x-6',
                  isDCU ? 'bg-[#005792] text-white shadow-[2px_2px_0px_0px_#000000]' : 'bg-zinc-900 text-zinc-300'
                )}
              >
                <span className="inline-block skew-x-6">DCU</span>
              </Link>
            </div>

            {/* Unified Settings & Account Button */}
            <button
              onClick={() => openSettings('account')}
              className={clsx(
                'flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5',
                currentAuthUser
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 hover:bg-cyan-500/30'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
              )}
              title="Settings & Cloud Account"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
              <span className="font-bold uppercase tracking-wider hidden lg:inline">
                {currentAuthUser ? currentAuthUser.email?.split('@')[0] : 'Settings'}
              </span>
              {(currentAuthUser || isCustomTmdbActive) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" title="Cloud Active" />
              )}
            </button>

            {/* Admin Dashboard */}
            <Link
              href="/admin"
              className={clsx(
                'p-1.5 sm:px-2.5 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs font-display hidden sm:flex items-center gap-1 transition',
                isAdmin
                  ? 'bg-amber-400 text-black font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
              title="Admin Curator Dashboard"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xl:inline">Admin</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#10121d] border-t-2 border-b-[3px] border-black shadow-[0_8px_0_0_#000000] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/mcu"
                className={clsx(
                  'flex items-center gap-2 p-2.5 font-display text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition',
                  isMCU ? 'bg-marvel-crimson text-white' : 'bg-zinc-900 text-zinc-300 hover:text-white'
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Marvel MCU</span>
              </Link>

              <Link
                href="/dcu"
                className={clsx(
                  'flex items-center gap-2 p-2.5 font-display text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition',
                  isDCU ? 'bg-[#005792] text-white' : 'bg-zinc-900 text-zinc-300 hover:text-white'
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>DC Universe</span>
              </Link>

              <Link
                href="/select"
                className={clsx(
                  'flex items-center gap-2 p-2.5 font-display text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition',
                  isSelect ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-amber-400 hover:text-amber-300'
                )}
              >
                <Layers className="w-4 h-4" />
                <span>Universe Gate</span>
              </Link>

              <Link
                href="/guide"
                className={clsx(
                  'flex items-center gap-2 p-2.5 font-display text-xs font-bold uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition',
                  isGuide ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-zinc-300 hover:text-white'
                )}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>App Guide</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => openSettings('account')}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Settings</span>
              </button>

              <Link
                href="/admin"
                className={clsx(
                  'flex items-center justify-center gap-1.5 p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase transition',
                  isAdmin ? 'bg-amber-400 text-black' : 'bg-zinc-900 text-zinc-300'
                )}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase"
                title="Landing Page"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>Home</span>
              </Link>
            </div>
          </div>
        )}
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

