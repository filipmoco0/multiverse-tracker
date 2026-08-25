'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Sliders,
  Key,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Film,
  Tv,
  Eye,
  Tv2,
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen,
  Coffee,
  Heart,
  Crown,
} from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useByokStore } from '@/lib/store/useByokStore';
import { useSettingsStore, AppSettings } from '@/lib/store/useSettingsStore';
import { createClient } from '@/lib/supabase/client';
import { syncUserProfileToCloud, loadUserProfileFromCloud } from '@/lib/supabase/user-profile';
import { triggerComicConfetti } from '../comic/ConfettiCelebration';
import { clsx } from 'clsx';

export type SettingsTab = 'account' | 'trakt' | 'features' | 'byok' | 'data' | 'donate';

interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'account',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Stores
  const {
    watchedIds,
    traktUser,
    setTraktUser,
    setAuthMode,
    syncWithTrakt,
    isSyncing,
    exportWatchlistJson,
    importWatchlistJson,
    resetProgress,
  } = useWatchlistStore();

  const { tmdbApiKey, setTmdbApiKey, traktClientId, traktClientSecret, setTraktCredentials, clearKeys } = useByokStore();
  const settings = useSettingsStore();

  // Local state for Account Tab
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Local state for BYOK & Trakt Credentials
  const [inputTmdbKey, setInputTmdbKey] = useState('');
  const [inputTraktClientId, setInputTraktClientId] = useState('');
  const [inputTraktClientSecret, setInputTraktClientSecret] = useState('');

  // Local state for Trakt Quick Connect Tab
  const [traktUsernameInput, setTraktUsernameInput] = useState('');
  const [isTraktQuickLoading, setIsTraktQuickLoading] = useState(false);

  // Local state for VIP code redeem
  const [vipCodeInput, setVipCodeInput] = useState('');
  const [isRedeemingVip, setIsRedeemingVip] = useState(false);

  // Status feedback message
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab on prop change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusMsg(null);
    }
  }, [isOpen, initialTab]);

  // Load user session and BYOK keys
  useEffect(() => {
    if (!isOpen) return;

    const supabase = createClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setCurrentUser(data.session?.user || null);
      });
    }

    const byok = useByokStore.getState();
    setInputTmdbKey(byok.tmdbApiKey || '');
    setInputTraktClientId(byok.traktClientId || '');
    setInputTraktClientSecret(byok.traktClientSecret || '');
  }, [isOpen]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  if (!isOpen) return null;

  const totalWatchedCount = Object.values(watchedIds).filter(Boolean).length;

  // Account Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setStatusMsg({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setStatusMsg({ text: 'Cloud auth is unavailable.', type: 'error' });
      return;
    }

    setIsAuthLoading(true);
    setStatusMsg(null);

    try {
      if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          await syncUserProfileToCloud();
          setStatusMsg({ text: 'Account created! Your progress is now synced.', type: 'success' });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          await loadUserProfileFromCloud(data.user.id);
          setStatusMsg({ text: 'Signed in! Cloud watchlist hydrated.', type: 'success' });
        }
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Authentication error', type: 'error' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('multiverse_tracker_auth_mode_v1');
        localStorage.removeItem('multiverse_tracker_trakt_user_v1');
        localStorage.removeItem('multiverse_tracker_watched_v1');
        localStorage.removeItem('multiverse_byok_keys_storage');
      }
      clearKeys();
      useWatchlistStore.setState({ authMode: 'guest', traktUser: null, supabaseUser: null, watchedIds: {} });
      setStatusMsg({ text: 'Signed out and cleared device cache.', type: 'success' });
      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleManualCloudSync = async () => {
    setIsAuthLoading(true);
    try {
      await syncUserProfileToCloud();
      if (currentUser?.id) {
        await loadUserProfileFromCloud(currentUser.id);
      }
      setStatusMsg({ text: 'Watchlist, Trakt & BYOK keys synced with cloud!', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: 'Sync failed: ' + err.message, type: 'error' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // BYOK Save Handler
  const handleSaveByok = (e: React.FormEvent) => {
    e.preventDefault();
    setTmdbApiKey(inputTmdbKey.trim());
    setTraktCredentials(inputTraktClientId.trim(), inputTraktClientSecret.trim());
    syncUserProfileToCloud({
      tmdb_api_key: inputTmdbKey.trim() || null,
      trakt_client_id: inputTraktClientId.trim() || null,
      trakt_client_secret: inputTraktClientSecret.trim() || null,
    });
    setStatusMsg({ text: 'API keys saved to device and cloud!', type: 'success' });
  };

  // Trakt Handlers
  const handleTraktOAuthLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanClientId = inputTraktClientId.trim();
    const cleanClientSecret = inputTraktClientSecret.trim();

    if (!cleanClientId) {
      setStatusMsg({
        text: 'Please enter your Trakt Client ID (from trakt.tv/oauth/applications) or use Quick Username Connect below.',
        type: 'error',
      });
      return;
    }

    setTraktCredentials(cleanClientId, cleanClientSecret);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let url = `/api/auth/trakt/login?redirect_uri=${encodeURIComponent(origin + '/api/auth/trakt/callback')}&client_id=${encodeURIComponent(cleanClientId)}`;
    if (cleanClientSecret) {
      url += `&client_secret=${encodeURIComponent(cleanClientSecret)}`;
    }
    window.location.href = url;
  };

  const handleTraktQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traktUsernameInput.trim()) {
      setStatusMsg({ text: 'Please enter your Trakt.tv username.', type: 'error' });
      return;
    }
    const cleanUsername = traktUsernameInput.trim().replace('@', '');
    setIsTraktQuickLoading(true);
    setStatusMsg({ text: `Connecting to @${cleanUsername}...`, type: 'success' });

    try {
      const userObj = {
        username: cleanUsername,
        name: cleanUsername,
        access_token: `token_user_${cleanUsername}`,
        expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000,
      };
      setTraktUser(userObj);
      setAuthMode('trakt');
      await syncWithTrakt();
      setStatusMsg({ text: `Connected and synced history for @${cleanUsername}!`, type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: 'Failed to sync with Trakt: ' + err.message, type: 'error' });
    } finally {
      setIsTraktQuickLoading(false);
    }
  };

  const handleTraktDisconnect = () => {
    setTraktUser(null);
    setTraktUsernameInput('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('multiverse_tracker_trakt_user_v1');
    }
    syncUserProfileToCloud({ trakt_username: null, trakt_token: null });
    setStatusMsg({ text: 'Trakt account disconnected successfully.', type: 'success' });
  };

  // VIP Code Redeem Handler
  const handleRedeemVipCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipCodeInput.trim()) {
      setStatusMsg({ text: 'Please enter a VIP code.', type: 'error' });
      return;
    }

    setIsRedeemingVip(true);
    try {
      const res = await fetch('/api/vip/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: vipCodeInput.trim(),
          username: traktUser?.username || currentUser?.email || 'Hero',
        }),
      });

      const data = await res.json();
      if (data.success) {
        settings.setSetting('isVipSupporter', true);
        triggerComicConfetti();
        setStatusMsg({ text: data.message || '👑 VIP Supporter unlocked!', type: 'success' });
        setVipCodeInput('');
      } else {
        setStatusMsg({ text: data.error || 'Invalid VIP code.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: 'Network error: ' + err.message, type: 'error' });
    } finally {
      setIsRedeemingVip(false);
    }
  };

  // Data Export/Import Handlers
  const handleExport = () => {
    const jsonStr = exportWatchlistJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multiverse-watchlist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Watchlist JSON downloaded!', type: 'success' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importWatchlistJson(content);
        if (success) {
          setStatusMsg({ text: 'Watchlist imported successfully!', type: 'success' });
        } else {
          setStatusMsg({ text: 'Invalid JSON backup format.', type: 'error' });
        }
      } catch (err: any) {
        setStatusMsg({ text: 'Import error: ' + err.message, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'account', label: 'Cloud Account', icon: User },
    { id: 'trakt', label: 'Trakt.tv', icon: Zap },
    { id: 'features', label: 'Features & UI', icon: Sliders },
    { id: 'byok', label: 'API Keys', icon: Key },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'donate', label: '⚡ Support Dev', icon: Coffee },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] z-10 overflow-hidden text-white flex flex-col my-8 max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-zinc-950 border-b-[3px] border-black">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-black border-2 border-black -skew-x-6 font-black">
                <Sliders className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-white">
                  Settings & Preferences
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Manage cloud account, Trakt sync, and UI features
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b-[3px] border-black bg-[#10121d] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusMsg(null);
                  }}
                  className={clsx(
                    'flex-1 min-w-[120px] py-3 px-3.5 flex items-center justify-center gap-2 font-display text-xs sm:text-sm font-bold uppercase transition select-none cursor-pointer border-r border-black/40',
                    isActive
                      ? 'bg-[#1c1f32] text-amber-400 border-b-2 border-amber-400 shadow-[inset_0_-2px_0_0_#f59e0b]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Alert Banner */}
          {statusMsg && (
            <div
              className={clsx(
                'p-3 border-b-2 border-black text-xs font-sans flex items-center gap-2',
                statusMsg.type === 'success' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              )}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: CLOUD ACCOUNT */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400">
                          Signed In User
                        </span>
                        <ComicBadge variant="green" size="sm">
                          <span className="flex items-center gap-1">
                            <Cloud className="w-3 h-3" /> Cloud Connected
                          </span>
                        </ComicBadge>
                      </div>
                      <div className="font-display font-black text-lg text-amber-400">
                        {currentUser.email}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-2 border-t border-zinc-800">
                        <div>
                          <span className="text-zinc-500 block">Watched Titles:</span>
                          <strong className="text-white">{totalWatchedCount} titles</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Trakt Linked:</span>
                          <strong className="text-white">{traktUser ? `@${traktUser.username}` : 'None'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <ComicButton
                        onClick={handleManualCloudSync}
                        disabled={isAuthLoading}
                        variant="cyan"
                        size="md"
                        className="flex-1"
                        leftIcon={<Cloud className="w-4 h-4" />}
                      >
                        Sync With Cloud
                      </ComicButton>
                      <ComicButton
                        onClick={handleSignOut}
                        disabled={isAuthLoading}
                        variant="danger"
                        size="md"
                        leftIcon={<LogOut className="w-4 h-4" />}
                      >
                        Sign Out
                      </ComicButton>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Sign in or create a free cloud account to synchronize your watched progress, Trakt token, and personal API keys across all your devices.
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full bg-zinc-950 border-2 border-black px-3.5 py-2.5 text-sm font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full bg-zinc-950 border-2 border-black px-3.5 py-2.5 text-sm font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <ComicButton
                      type="submit"
                      disabled={isAuthLoading}
                      variant="gold"
                      size="md"
                      className="w-full"
                    >
                      {isAuthLoading ? 'Processing...' : isSignUpMode ? 'Create Cloud Account' : 'Sign In'}
                    </ComicButton>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSignUpMode(!isSignUpMode)}
                        className="text-xs font-display uppercase text-zinc-400 hover:text-amber-400 underline transition cursor-pointer"
                      >
                        {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Create Free Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: TRAKT.TV */}
            {activeTab === 'trakt' && (
              <div className="space-y-5">
                <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Connect your Trakt.tv account to automatically import watched movies and episodes and push 2-way watch status in real time.
                </div>

                {traktUser ? (
                  <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E62429] text-white border-2 border-black -skew-x-6 font-black">
                          <Zap className="w-5 h-5 skew-x-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400 block">
                            Connected Account
                          </span>
                          <h4 className="font-display font-black text-lg text-rose-400">
                            @{traktUser.username}
                          </h4>
                        </div>
                      </div>
                      <ComicBadge variant="green" size="sm">
                        2-Way Sync Active
                      </ComicBadge>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <ComicButton
                        onClick={() => syncWithTrakt()}
                        disabled={isSyncing}
                        variant="gold"
                        size="sm"
                        className="flex-1"
                      >
                        {isSyncing ? 'Syncing...' : 'Sync History Now'}
                      </ComicButton>
                      <ComicButton
                        onClick={handleTraktDisconnect}
                        variant="danger"
                        size="sm"
                      >
                        Disconnect
                      </ComicButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Method 1: OAuth 2.0 with Client ID & Secret */}
                    <form onSubmit={handleTraktOAuthLogin} className="p-4 bg-zinc-950 border-2 border-black shadow-[3px_3px_0px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-sm uppercase text-amber-400">
                          1. Trakt 2-Way OAuth 2.0 (Recommended)
                        </h4>
                        <ComicBadge variant="marvel" size="sm">2-Way Sync</ComicBadge>
                      </div>

                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                        Enter your Trakt App keys from{' '}
                        <a
                          href="https://trakt.tv/oauth/applications/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 underline font-bold"
                        >
                          trakt.tv/oauth/applications/new ↗
                        </a>
                      </p>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                            Trakt Client ID
                          </label>
                          <input
                            type="text"
                            value={inputTraktClientId}
                            onChange={(e) => setInputTraktClientId(e.target.value)}
                            placeholder="e.g. 5a6ddbfaea8f5a6fa58dfc924bc01..."
                            className="w-full bg-zinc-900 border-2 border-black px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                            Trakt Client Secret
                          </label>
                          <input
                            type="password"
                            value={inputTraktClientSecret}
                            onChange={(e) => setInputTraktClientSecret(e.target.value)}
                            placeholder="e.g. e84c478a8f1bc45..."
                            className="w-full bg-zinc-900 border-2 border-black px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="p-2.5 bg-zinc-900/80 border border-zinc-700 text-[11px] font-sans text-zinc-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200">Required Trakt App Redirect URI:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const uri = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/trakt/callback` : 'https://multiverse-tracker.vercel.app/api/auth/trakt/callback';
                                navigator.clipboard.writeText(uri);
                                setStatusMsg({ text: 'Redirect URI copied to clipboard!', type: 'success' });
                              }}
                              className="text-amber-400 hover:text-amber-300 underline font-display uppercase cursor-pointer"
                            >
                              Copy URI
                            </button>
                          </div>
                          <code className="text-amber-300 font-mono block break-all text-[10px]">
                            {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/trakt/callback` : 'https://multiverse-tracker.vercel.app/api/auth/trakt/callback'}
                          </code>
                        </div>
                      </div>

                      <ComicButton
                        type="submit"
                        variant="danger"
                        size="md"
                        className="w-full bg-[#E62429]"
                        leftIcon={<Zap className="w-5 h-5 text-amber-300" />}
                      >
                        Authorize with Trakt.tv
                      </ComicButton>
                    </form>

                    {/* Method 2: Quick Username Connect */}
                    <form onSubmit={handleTraktQuickConnect} className="p-4 bg-zinc-950 border-2 border-black shadow-[3px_3px_0px_0px_#000000] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-black text-sm uppercase text-cyan-400">
                          2. Or Quick Sync by Username (No App Needed)
                        </h4>
                        <ComicBadge variant="cyan" size="sm">Quick Import</ComicBadge>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans">
                        Don't want to create an API app? Enter your public Trakt username to import watched history:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={traktUsernameInput}
                          onChange={(e) => setTraktUsernameInput(e.target.value)}
                          placeholder="e.g. filipmoco"
                          className="flex-1 bg-zinc-900 border-2 border-black px-3 py-2 text-sm font-sans text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                        />
                        <ComicButton
                          type="submit"
                          disabled={isTraktQuickLoading}
                          variant="cyan"
                          size="sm"
                        >
                          {isTraktQuickLoading ? 'Syncing...' : 'Connect'}
                        </ComicButton>
                      </div>
                    </form>

                    <div className="text-center pt-1">
                      <Link
                        href="/guide"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-amber-400 hover:text-amber-300 underline"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Need help? Read Full Trakt & TMDB Setup Guide
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FEATURES & UI TOGGLES */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Customize the application UI by toggling widgets and visual effects:
                </div>

                <div className="space-y-3">
                  {/* Toggle 1: Marathon Stats */}
                  <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <strong className="font-display text-sm uppercase tracking-wide text-white">
                          Marathon Stats & Superhero Rank
                        </strong>
                        <ComicBadge variant="cyan" size="sm">Widgets</ComicBadge>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans">
                        Shows total hours watched and dynamic superhero title badge on the tracklist.
                      </p>
                    </div>
                    <button
                      onClick={() => settings.toggleSetting('showMarathonStats')}
                      className={clsx(
                        'px-3.5 py-1.5 border-2 border-black font-display text-xs font-black uppercase transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                        settings.showMarathonStats ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {settings.showMarathonStats ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Toggle 2: Trailer Player & Where to Watch */}
                  <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <strong className="font-display text-sm uppercase tracking-wide text-white">
                          Trailers & Streaming Providers
                        </strong>
                        <ComicBadge variant="gold" size="sm">Details</ComicBadge>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans">
                        Embeds YouTube trailer video player and JustWatch streaming availability inside movie details.
                      </p>
                    </div>
                    <button
                      onClick={() => settings.toggleSetting('showTrailersAndStreaming')}
                      className={clsx(
                        'px-3.5 py-1.5 border-2 border-black font-display text-xs font-black uppercase transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                        settings.showTrailersAndStreaming ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {settings.showTrailersAndStreaming ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Toggle 3: Confetti Celebration */}
                  <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <strong className="font-display text-sm uppercase tracking-wide text-white">
                          Comic Confetti Celebrations
                        </strong>
                        <ComicBadge variant="marvel" size="sm">VFX</ComicBadge>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans">
                        Fires superhero-themed confetti blasts when completing phases or chapters.
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerComicConfetti('mcu')}
                        className="inline-flex items-center gap-1 text-[11px] font-display uppercase tracking-wider text-amber-400 hover:text-amber-300 underline pt-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Test Confetti Blast
                      </button>
                    </div>
                    <button
                      onClick={() => settings.toggleSetting('enableConfetti')}
                      className={clsx(
                        'px-3.5 py-1.5 border-2 border-black font-display text-xs font-black uppercase transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                        settings.enableConfetti ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {settings.enableConfetti ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Toggle 4: Greyscale Unwatched Posters */}
                  <div className="bg-zinc-950 border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <strong className="font-display text-sm uppercase tracking-wide text-white">
                          Atmospheric Unwatched Posters
                        </strong>
                        <ComicBadge variant="white" size="sm">Style</ComicBadge>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans">
                        Keeps unwatched posters in muted style until hovered or marked as watched.
                      </p>
                    </div>
                    <button
                      onClick={() => settings.toggleSetting('greyscaleUnwatched')}
                      className={clsx(
                        'px-3.5 py-1.5 border-2 border-black font-display text-xs font-black uppercase transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                        settings.greyscaleUnwatched ? 'bg-emerald-400 text-black' : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {settings.greyscaleUnwatched ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BYOK API KEYS */}
            {activeTab === 'byok' && (
              <form onSubmit={handleSaveByok} className="space-y-4">
                <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                  (Optional) Enter your personal TMDB API key to bypass all shared rate limits:
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                    The Movie Database (TMDB) API Key v3
                  </label>
                  <input
                    type="text"
                    value={inputTmdbKey}
                    onChange={(e) => setInputTmdbKey(e.target.value)}
                    placeholder="e.g. 15d2ea6d0dc1d476..."
                    className="w-full bg-zinc-950 border-2 border-black px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[11px] text-zinc-500 font-sans block mt-1">
                    Free keys are available at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">themoviedb.org/settings/api</a>
                  </span>
                </div>

                <ComicButton type="submit" variant="gold" size="md" className="w-full">
                  Save API Key
                </ComicButton>

                <div className="text-center pt-1">
                  <Link
                    href="/guide"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-amber-400 hover:text-amber-300 underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Step-by-Step TMDB Key Guide
                  </Link>
                </div>
              </form>
            )}

            {/* TAB 5: DATA & BACKUP */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Export your watch history as a portable JSON file, import backups, or reset universe progress:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ComicButton
                    onClick={handleExport}
                    variant="cyan"
                    size="md"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Export Backup JSON
                  </ComicButton>

                  <ComicButton
                    onClick={() => fileInputRef.current?.click()}
                    variant="gold"
                    size="md"
                    className="w-full"
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Import Backup JSON
                  </ComicButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <h4 className="font-display font-black text-xs uppercase text-rose-400">
                    Danger Zone: Reset Progress
                  </h4>
                  <div className="flex gap-2">
                    <ComicButton
                      onClick={() => {
                        resetProgress('mcu');
                        setStatusMsg({ text: 'MCU progress reset to 0.', type: 'success' });
                      }}
                      variant="dark"
                      size="sm"
                      className="flex-1"
                    >
                      Reset Marvel
                    </ComicButton>
                    <ComicButton
                      onClick={() => {
                        resetProgress('dcu');
                        setStatusMsg({ text: 'DC progress reset to 0.', type: 'success' });
                      }}
                      variant="dark"
                      size="sm"
                      className="flex-1"
                    >
                      Reset DC
                    </ComicButton>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SUPPORT DEV & REVOLUT DONATIONS */}
            {activeTab === 'donate' && (
              <div className="space-y-5">
                <div className="p-4 bg-gradient-to-br from-[#141624] to-[#1f1a3a] border-2 border-black shadow-[4px_4px_0px_0px_#000000] space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <ComicBadge variant="gold" size="sm">
                      <span className="flex items-center gap-1 font-bold">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        100% Free & Ad-Free
                      </span>
                    </ComicBadge>
                    <span className="text-[11px] text-zinc-400 font-sans">Powered by Revolut</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-black text-amber-400 uppercase tracking-wide">
                    Buy the Dev a Coffee ☕
                  </h3>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Multiverse Tracker has zero ads and is maintained as a passion project for Marvel and DC fans. If this tracker helps you organize your movie marathons, tossing a tip fuels hosting costs and caffeine for future features!
                  </p>
                </div>

                {/* Preset Quick Tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="https://revolut.me/fmoslavac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-zinc-950 hover:bg-zinc-900 border-2 border-black p-3.5 text-center shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer block"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition">☕</div>
                    <h4 className="font-display font-black text-sm uppercase text-amber-400">€2 Espresso</h4>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Quick energy boost</p>
                  </a>

                  <a
                    href="https://revolut.me/fmoslavac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-zinc-950 hover:bg-zinc-900 border-2 border-amber-400 p-3.5 text-center shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer block"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition">🍿</div>
                    <h4 className="font-display font-black text-sm uppercase text-amber-400">€5 Popcorn & Soda</h4>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Movie marathon fuel</p>
                  </a>

                  <a
                    href="https://revolut.me/fmoslavac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-zinc-950 hover:bg-zinc-900 border-2 border-black p-3.5 text-center shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer block"
                  >
                    <div className="text-2xl mb-1 group-hover:scale-110 transition">🦸‍♂️</div>
                    <h4 className="font-display font-black text-sm uppercase text-cyan-400">€10 Superhero</h4>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">Multiverse Legend</p>
                  </a>
                </div>

                {/* Primary Revolut Link Button */}
                <a
                  href="https://revolut.me/fmoslavac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <ComicButton
                    variant="gold"
                    size="lg"
                    className="w-full text-sm font-black"
                    leftIcon={<Coffee className="w-5 h-5 text-black" />}
                    rightIcon={<ExternalLink className="w-4 h-4 text-black" />}
                  >
                    Open Revolut.me/fmoslavac (Apple Pay / Card)
                  </ComicButton>
                </a>

                {/* VIP Supporter Code Redemption */}
                {settings.isVipSupporter ? (
                  <div className="p-4 bg-amber-950/40 border-2 border-amber-400 shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-400 text-black border-2 border-black -skew-x-6">
                        <Crown className="w-5 h-5 skew-x-6 text-black fill-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-display font-black text-sm uppercase text-amber-400">
                          👑 VIP Superhero Hero Active
                        </div>
                        <p className="text-[11px] text-zinc-300 font-sans">
                          Your golden VIP badge is proudly displayed on your Superhero Passport!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        settings.setSetting('isVipSupporter', false);
                        setStatusMsg({ text: 'VIP status deactivated.', type: 'success' });
                      }}
                      className="px-2.5 py-1 text-[11px] font-display uppercase border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRedeemVipCode} className="p-4 bg-zinc-950 border-2 border-amber-400/60 shadow-[3px_3px_0px_0px_#000000] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-display font-black text-xs uppercase text-amber-400">
                        <Crown className="w-4 h-4 text-amber-400" />
                        Redeem VIP Supporter Pass
                      </div>
                      <ComicBadge variant="gold" size="sm">Single-Use Code</ComicBadge>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Donated via Revolut? Enter the 1-time VIP code you received to unlock the permanent golden <strong>VIP HERO</strong> badge in your Superhero Passport:
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={vipCodeInput}
                        onChange={(e) => setVipCodeInput(e.target.value)}
                        placeholder="e.g. VIP-8492-MCU"
                        className="flex-1 bg-zinc-900 border-2 border-black px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 uppercase focus:outline-none focus:border-amber-400"
                      />
                      <ComicButton
                        type="submit"
                        disabled={isRedeemingVip}
                        variant="gold"
                        size="sm"
                      >
                        {isRedeemingVip ? 'Redeeming...' : 'Unlock VIP 👑'}
                      </ComicButton>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
