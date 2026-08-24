'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Check, ExternalLink, ShieldCheck, AlertCircle, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { useByokStore } from '@/lib/store/useByokStore';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({ isOpen, onClose }) => {
  const {
    tmdbApiKey,
    traktClientId,
    traktClientSecret,
    isCustomTmdbActive,
    isCustomTraktActive,
    setTmdbApiKey,
    setTraktCredentials,
    clearKeys,
  } = useByokStore();

  const [inputTmdb, setInputTmdb] = useState(tmdbApiKey);
  const [inputTraktId, setInputTraktId] = useState(traktClientId);
  const [inputTraktSecret, setInputTraktSecret] = useState(traktClientSecret);

  const [isTestingTmdb, setIsTestingTmdb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestTmdbKey = async () => {
    if (!inputTmdb.trim()) {
      setTestResult({ success: false, message: 'Please enter a TMDB API Key first.' });
      return;
    }

    setIsTestingTmdb(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.themoviedb.org/3/authentication?api_key=${encodeURIComponent(inputTmdb.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({ success: true, message: 'TMDB API Key is valid and authenticated!' });
      } else {
        setTestResult({ success: false, message: data.status_message || 'Invalid TMDB API Key.' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection failed.' });
    } finally {
      setIsTestingTmdb(false);
    }
  };

  const handleSave = () => {
    setTmdbApiKey(inputTmdb);
    setTraktCredentials(inputTraktId, inputTraktSecret);
    setTestResult({ success: true, message: 'BYOK keys saved locally in your browser!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClearAll = () => {
    clearKeys();
    setInputTmdb('');
    setInputTraktId('');
    setInputTraktSecret('');
    setTestResult({ success: true, message: 'All custom keys cleared.' });
  };

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

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] p-6 sm:p-8 z-10 text-white space-y-6 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 border-2 border-black -skew-x-6 text-black font-black">
                <Key className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-black tracking-wider uppercase text-amber-400">
                  BYOK: Bring Your Own API Keys
                </h3>
                <p className="text-xs text-zinc-300 font-sans">
                  Use your personal free API keys for zero rate-limits and private API usage.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Privacy Notice */}
          <div className="bg-zinc-950 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000] flex items-start gap-2.5 text-xs text-zinc-300 font-sans">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-display uppercase tracking-wide">100% Client-Side Privacy:</strong>
              <p className="mt-0.5">
                Your keys are stored exclusively in your browser’s <code>localStorage</code>. They are never sent to external third-party servers.
              </p>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-3 border-2 border-black font-display uppercase text-xs sm:text-sm flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000] ${
                testResult.success ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
              }`}
            >
              {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult.message}
            </div>
          )}

          {/* Section 1: TMDB API Key */}
          <div className="bg-[#161824] border-[3px] border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold uppercase text-base text-cyan-400">1. TMDB API Key</span>
                {isCustomTmdbActive ? (
                  <ComicBadge variant="green" size="sm">Custom Key Active</ComicBadge>
                ) : (
                  <ComicBadge variant="dark" size="sm">Default Key</ComicBadge>
                )}
              </div>

              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-display uppercase text-amber-400 hover:underline flex items-center gap-1"
              >
                Get Free TMDB Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Used for poster galleries, movie/show synopses, and exact TMDB ID lookups.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={inputTmdb}
                onChange={(e) => setInputTmdb(e.target.value)}
                placeholder="Paste your TMDB API Key (e.g. 15d2ea6d0dc1d...)"
                className="w-full bg-zinc-950 border-2 border-black p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />

              <div className="flex justify-end">
                <ComicButton
                  type="button"
                  onClick={handleTestTmdbKey}
                  disabled={isTestingTmdb || !inputTmdb.trim()}
                  variant="cyan"
                  size="sm"
                  leftIcon={isTestingTmdb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                >
                  {isTestingTmdb ? 'Testing Key...' : 'Validate Key'}
                </ComicButton>
              </div>
            </div>
          </div>

          {/* Section 2: Trakt.tv Client ID & Secret */}
          <div className="bg-[#161824] border-[3px] border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold uppercase text-base text-marvel-crimson">2. Trakt.tv OAuth App</span>
                {isCustomTraktActive ? (
                  <ComicBadge variant="green" size="sm">Custom Trakt App Active</ComicBadge>
                ) : (
                  <ComicBadge variant="dark" size="sm">Public App</ComicBadge>
                )}
              </div>

              <a
                href="https://trakt.tv/oauth/applications"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-display uppercase text-amber-400 hover:underline flex items-center gap-1"
              >
                Create Free Trakt App <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Used for OAuth watch history syncing and 1-click Trakt scrobbling. Redirect URI: <code>https://your-domain.vercel.app/api/auth/trakt/callback</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Trakt Client ID
                </label>
                <input
                  type="text"
                  value={inputTraktId}
                  onChange={(e) => setInputTraktId(e.target.value)}
                  placeholder="Trakt Client ID"
                  className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Trakt Client Secret
                </label>
                <input
                  type="password"
                  value={inputTraktSecret}
                  onChange={(e) => setInputTraktSecret(e.target.value)}
                  placeholder="Trakt Client Secret"
                  className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-black">
            <ComicButton
              type="button"
              onClick={handleClearAll}
              variant="dark"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
            >
              Clear Custom Keys
            </ComicButton>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ComicButton type="button" onClick={onClose} variant="dark" size="sm">
                Cancel
              </ComicButton>
              <ComicButton
                type="button"
                onClick={handleSave}
                variant="gold"
                size="md"
                className="flex-1 sm:flex-initial"
                leftIcon={<Check className="w-4 h-4 text-black" />}
              >
                Save BYOK Keys
              </ComicButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
