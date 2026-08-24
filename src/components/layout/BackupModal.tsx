'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Copy, Check, Save } from 'lucide-react';
import { useWatchlistStore } from '@/lib/store/useWatchlistStore';
import { ComicButton } from '../comic/ComicButton';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportWatchlistJson, importWatchlistJson } = useWatchlistStore();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonExport = exportWatchlistJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multiverse_watchlist_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importWatchlistJson(importText);
    if (success) {
      setStatusMessage('Progress successfully restored!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1200);
    } else {
      setStatusMessage('Invalid backup JSON. Please check and try again.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#151722] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 z-10 text-white space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-xl font-display font-black tracking-wider text-amber-400">
              GUEST WATCHLIST BACKUP & RESTORE
            </h3>
            <button
              onClick={onClose}
              className="bg-rose-600 hover:bg-rose-500 text-white p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Zero-database architecture saves your progress directly to your local device. You can export a backup or restore your progress to another device anytime!
          </p>

          {/* Export Section */}
          <div className="space-y-2 bg-zinc-900 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000]">
            <h4 className="text-xs font-display uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export Current Progress
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <ComicButton onClick={handleCopy} variant="white" size="sm" leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}>
                {copied ? 'Copied JSON!' : 'Copy to Clipboard'}
              </ComicButton>
              <ComicButton onClick={handleDownload} variant="gold" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                Save File (.json)
              </ComicButton>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2 bg-zinc-900 border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000]">
            <h4 className="text-xs font-display uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Restore from Backup JSON
            </h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your backup JSON here..."
              rows={3}
              className="w-full bg-zinc-950 border-2 border-black p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <ComicButton onClick={handleImport} variant="cyan" size="sm">
                Restore Progress
              </ComicButton>
              {statusMessage && (
                <span className="text-xs font-bold text-amber-300 font-sans animate-pulse">
                  {statusMessage}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
