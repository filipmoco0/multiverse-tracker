'use client';

import React, { useState, useEffect } from 'react';
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
    isCustomTmdbActive,
    setTmdbApiKey,
    clearKeys,
  } = useByokStore();

  const [inputTmdb, setInputTmdb] = useState(tmdbApiKey);
  const [isTestingTmdb, setIsTestingTmdb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync inputs whenever modal opens or store keys update
  useEffect(() => {
    if (isOpen) {
      setInputTmdb(tmdbApiKey || '');
      setTestResult(null);
    }
  }, [isOpen, tmdbApiKey]);

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
    setTestResult({ success: true, message: 'TMDB API key saved!' });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClearAll = () => {
    clearKeys();
    setInputTmdb('');
    setTestResult({ success: true, message: 'Custom TMDB key cleared.' });
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
          className="relative w-full max-w-lg bg-[#141624] border-[4px] border-black p-6 shadow-[10px_10px_0px_0px_#000000] z-10 space-y-6 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 text-black border-2 border-black font-black -skew-x-6">
                <Key className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl uppercase tracking-wider text-white">
                  TMDB API Key (BYOK)
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Bring your own The Movie Database API key
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 border-2 border-black font-sans text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-rose-950 text-rose-300 border-rose-500'
              }`}
            >
              {testResult.success ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult.message}
            </div>
          )}

          {/* Section: TMDB API Key */}
          <div className="bg-[#161824] border-[3px] border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold uppercase text-base text-cyan-400">TMDB API Key v3</span>
                {isCustomTmdbActive ? (
                  <ComicBadge variant="green" size="sm">Custom Key Active</ComicBadge>
                ) : (
                  <ComicBadge variant="dark" size="sm">Built-in Key</ComicBadge>
                )}
              </div>

              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-display uppercase text-amber-400 hover:underline flex items-center gap-1"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Powers poster artwork, release dates, overviews, ratings, and video trailers.
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-black">
            <ComicButton
              type="button"
              onClick={handleClearAll}
              variant="dark"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
            >
              Clear Custom Key
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
                Save TMDB Key
              </ComicButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
