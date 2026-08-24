'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Check, AlertCircle, Sparkles, Cloud, RefreshCw, LogOut } from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { createClient } from '@/lib/supabase/client';
import { loadUserProfileFromCloud, syncUserProfileToCloud } from '@/lib/supabase/user-profile';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useByokStore } from '@/lib/store/useByokStore';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const watchedIds = useWatchlistStore((s) => s.watchedIds);
  const traktUser = useWatchlistStore((s) => s.traktUser);
  const tmdbApiKey = useByokStore((s) => s.tmdbApiKey);
  const traktClientId = useByokStore((s) => s.traktClientId);

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check current auth status on open
  useEffect(() => {
    if (isOpen) {
      const supabase = createClient();
      if (supabase) {
        supabase.auth.getSession().then(({ data }) => {
          const user = data.session?.user || null;
          setCurrentUser(user);
          if (user) {
            loadUserProfileFromCloud(user.id);
          }
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setStatusMsg({ text: 'Database client not ready.', type: 'error' });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setStatusMsg({ text: error.message, type: 'error' });
      } else if (data.user) {
        setCurrentUser(data.user);
        setStatusMsg({ text: 'Signed in! Syncing cloud watchlist...', type: 'success' });
        
        // Load and hydrate profile
        await loadUserProfileFromCloud(data.user.id);

        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to sign in', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setStatusMsg({ text: 'Database client not ready.', type: 'error' });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setStatusMsg({ text: error.message, type: 'error' });
      } else if (data.user) {
        setCurrentUser(data.user);
        setStatusMsg({ text: 'Account created! Initializing cloud sync...', type: 'success' });

        // Save current local progress and keys to the new account
        await syncUserProfileToCloud({
          watched_ids: watchedIds,
          trakt_username: traktUser?.username || null,
          trakt_token: traktUser?.access_token || null,
          tmdb_api_key: tmdbApiKey || null,
        });

        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to sign up', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await syncUserProfileToCloud();
      if (currentUser?.id) {
        await loadUserProfileFromCloud(currentUser.id);
      }
      setStatusMsg({ text: 'Watchlist, Trakt & BYOK keys synced with cloud!', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: 'Sync failed: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
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
      useByokStore.getState().clearKeys();
      useWatchlistStore.setState({ authMode: 'guest', traktUser: null, supabaseUser: null, watchedIds: {} });
      setStatusMsg({ text: 'Signed out of cloud account and cleared device keys.', type: 'success' });
      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 500);
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-7 z-10 text-white space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500 border-2 border-black -skew-x-6 text-black font-black">
                <Cloud className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-wider uppercase text-cyan-400">
                  {currentUser ? 'Cloud Account' : 'Cloud Sync Account'}
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Keep watchlists, Trakt, and API keys synced across all your devices.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 border-2 border-black text-xs font-display uppercase tracking-wide flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000] ${
                statusMsg.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {statusMsg.text}
            </div>
          )}

          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              <div className="bg-zinc-950 border-2 border-black p-4 space-y-3 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display uppercase text-zinc-400">Signed In As:</span>
                  <ComicBadge variant="green" size="sm">Cloud Synced</ComicBadge>
                </div>
                <p className="font-mono text-sm text-cyan-300 break-all">{currentUser.email}</p>

                <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <span>Watched Titles:</span>
                    <strong className="text-white">{Object.keys(watchedIds).length} titles</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connected Trakt:</span>
                    <strong className="text-amber-400">{traktUser ? `@${traktUser.username}` : 'None'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BYOK TMDB Key:</span>
                    <strong className="text-cyan-400">{tmdbApiKey ? 'Configured' : 'None'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BYOK Trakt App:</span>
                    <strong className="text-marvel-crimson">{traktClientId ? 'Configured' : 'None'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ComicButton
                  type="button"
                  onClick={handleManualSync}
                  disabled={loading}
                  variant="gold"
                  size="md"
                  className="flex-1"
                  leftIcon={<RefreshCw className={`w-4 h-4 text-black ${loading ? 'animate-spin' : ''}`} />}
                >
                  Sync Now
                </ComicButton>

                <ComicButton
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="danger"
                  size="md"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </ComicButton>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Tabs */
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex border-2 border-black bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setStatusMsg(null); }}
                  className={`flex-1 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition ${
                    activeTab === 'signin' ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_0px_#000000]' : 'text-zinc-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setStatusMsg(null); }}
                  className={`flex-1 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition ${
                    activeTab === 'signup' ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_#000000]' : 'text-zinc-400'
                  }`}
                >
                  Create Free Account
                </button>
              </div>

              <form onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-zinc-950 border-2 border-black p-2.5 pl-9 text-xs text-white font-sans focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3 text-zinc-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950 border-2 border-black p-2.5 pl-9 text-xs text-white font-sans focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <ComicButton
                    variant={activeTab === 'signin' ? 'cyan' : 'gold'}
                    size="lg"
                    className="w-full"
                    type="submit"
                    disabled={loading}
                    leftIcon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-black" />}
                  >
                    {loading
                      ? 'Processing...'
                      : activeTab === 'signin'
                      ? 'Sign In & Restore Watchlist'
                      : 'Create Account & Sync'}
                  </ComicButton>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
