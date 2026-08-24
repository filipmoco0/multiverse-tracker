'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { useRouter } from 'next/navigation';

interface TraktAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraktAuthModal: React.FC<TraktAuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { setTraktUser, setAuthMode, syncWithTrakt, isSyncing } = useWatchlistStore();

  const [activeTab, setActiveTab] = useState<'quick' | 'oauth'>('quick');
  const [usernameInput, setUsernameInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [redirectUri, setRedirectUri] = useState('https://multiverse-tracker.vercel.app/api/auth/trakt/callback');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/auth/trakt/callback`);
    }
  }, []);

  if (!isOpen) return null;

  const hasClientId = Boolean(process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID);

  const handleQuickConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setStatusMsg({ text: 'Please enter your Trakt.tv username', type: 'error' });
      return;
    }

    const cleanUsername = usernameInput.trim().replace('@', '');
    const userObj = {
      username: cleanUsername,
      name: cleanUsername,
      access_token: tokenInput.trim() || `token_user_${cleanUsername}`,
      expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000,
    };

    setTraktUser(userObj);
    setAuthMode('trakt');
    setStatusMsg({ text: `Connected as @${cleanUsername}! Syncing watch history...`, type: 'success' });

    // Trigger sync
    try {
      await syncWithTrakt();
    } catch (err) {
      console.warn(err);
    }

    setTimeout(() => {
      onClose();
      router.push('/select');
    }, 1200);
  };

  const handleOAuthLogin = () => {
    if (!hasClientId) {
      setStatusMsg({
        text: 'Trakt OAuth app is not configured yet. Use the Instant Connect tab or configure Trakt API keys.',
        type: 'error',
      });
      return;
    }
    window.location.href = '/api/auth/trakt/login';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-xl bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 z-10 text-white space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E62429] border-2 border-black -skew-x-6 text-white font-black">
                <Zap className="w-5 h-5 skew-x-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black tracking-wider text-white uppercase">
                Connect Trakt.tv Account
              </h3>
            </div>
            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-2 border-black bg-zinc-950 p-1">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition ${
                activeTab === 'quick' ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_#000000]' : 'text-zinc-400'
              }`}
            >
              Instant Connect (Username)
            </button>
            <button
              onClick={() => setActiveTab('oauth')}
              className={`flex-1 py-1.5 font-display text-xs sm:text-sm font-bold uppercase transition ${
                activeTab === 'oauth' ? 'bg-[#E62429] text-white shadow-[2px_2px_0px_0px_#000000]' : 'text-zinc-400'
              }`}
            >
              Trakt OAuth 2.0
            </button>
          </div>

          {statusMsg && (
            <div
              className={`p-3 border-2 border-black text-xs font-sans font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000] ${
                statusMsg.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {statusMsg.text}
            </div>
          )}

          {activeTab === 'quick' ? (
            /* TAB 1: Instant Username Connect */
            <form onSubmit={handleQuickConnect} className="space-y-4">
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Enter your public Trakt.tv username to sync your watched movies and TV series across all MCU and DCU timelines instantly!
              </p>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Trakt.tv Username *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-zinc-400">@</span>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. superhero_fan or movielover"
                    className="w-full bg-zinc-950 border-2 border-black p-2.5 pl-8 text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Optional Trakt Personal Token
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste access token for 2-way push syncing (optional)"
                  className="w-full bg-zinc-950 border-2 border-black p-2.5 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <ComicButton variant="gold" size="lg" className="w-full" type="submit" leftIcon={<Zap className="w-4 h-4 text-black" />}>
                  {isSyncing ? 'Connecting & Syncing...' : 'Link Trakt Profile'}
                </ComicButton>
              </div>
            </form>
          ) : (
            /* TAB 2: Trakt OAuth 2.0 App Setup */
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Connect securely through Trakt’s official OAuth authorization window.
              </p>

              <div className="bg-zinc-900 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display uppercase text-zinc-400">OAuth Client ID Status:</span>
                  <ComicBadge variant={hasClientId ? 'green' : 'dark'} size="sm">
                    {hasClientId ? 'CONFIGURED' : 'OPTIONAL SETUP'}
                  </ComicBadge>
                </div>

                {!hasClientId && (
                  <div className="text-[11px] text-zinc-400 font-sans space-y-1.5 pt-2 border-t border-zinc-800">
                    <p className="font-bold text-amber-300">How to configure custom Trakt OAuth:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to <a href="https://trakt.tv/oauth/applications" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">trakt.tv/oauth/applications <ExternalLink className="w-2.5 h-2.5" /></a></li>
                      <li>Create an app with Redirect URI: <code className="bg-black px-1.5 py-0.5 text-amber-300 border border-zinc-700 text-[10px] break-all">{redirectUri}</code></li>
                      <li>Add your Client ID & Secret in <strong>BYOK Settings</strong> or environment variables.</li>
                    </ol>
                  </div>
                )}
              </div>

              <ComicButton
                onClick={handleOAuthLogin}
                variant="danger"
                size="lg"
                className="w-full bg-[#E62429]"
                leftIcon={<Zap className="w-5 h-5 text-amber-300" />}
              >
                Authorize on Trakt.tv
              </ComicButton>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
