'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Check if dismissed before
    const dismissed = localStorage.getItem('multiverse_pwa_dismissed_v1');
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Delay prompt on iOS
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('Service worker registration failed:', err));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('multiverse_pwa_dismissed_v1', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#141624] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] p-4 text-white"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-black border-2 border-black -skew-x-6 font-black flex-shrink-0">
              <Smartphone className="w-5 h-5 skew-x-6" />
            </div>
            <div>
              <h4 className="font-display font-black text-sm uppercase text-amber-400">
                Install Multiverse App
              </h4>
              <p className="text-xs text-zinc-300 font-sans mt-0.5">
                Add to your home screen for full-screen offline experience!
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white border border-black transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="mt-3 pt-2.5 border-t border-zinc-800 text-[11px] font-sans text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span>1. Tap Share button</span>
              <Share className="w-3.5 h-3.5 inline" />
              <span>in Safari</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span>2. Select "Add to Home Screen"</span>
              <PlusSquare className="w-3.5 h-3.5 inline" />
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-2.5 border-t border-zinc-800 flex justify-end gap-2">
            <ComicButton
              onClick={handleInstallClick}
              variant="gold"
              size="sm"
              className="w-full"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Add to Home Screen
            </ComicButton>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
