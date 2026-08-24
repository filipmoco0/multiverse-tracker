'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Image as ImageIcon, Sparkles, ExternalLink, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { ComicButton } from '../comic/ComicButton';
import { ComicBadge } from '../comic/ComicBadge';
import { MediaType } from '@/lib/types';
import { useByokStore } from '@/lib/store/useByokStore';

interface PosterItem {
  url: string;
  width?: number;
  height?: number;
  vote_average?: number;
  language?: string | null;
}

interface PosterPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tmdbId?: number | null;
  mediaType: MediaType;
  currentPosterPath?: string | null;
  onSelectPoster: (posterUrl: string) => void;
}

export const PosterPickerModal: React.FC<PosterPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  tmdbId,
  mediaType,
  currentPosterPath,
  onSelectPoster,
}) => {
  const [posters, setPosters] = useState<PosterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentPosterPath || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tmdbId) {
      fetchPosters(tmdbId, mediaType);
      setSelectedUrl(currentPosterPath || '');
    } else if (isOpen) {
      setPosters([]);
    }
  }, [isOpen, tmdbId, mediaType, currentPosterPath]);

  const fetchPosters = async (id: number, type: MediaType) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { tmdbApiKey } = useByokStore.getState();
      const headers: Record<string, string> = {};
      if (tmdbApiKey) headers['x-tmdb-api-key'] = tmdbApiKey;

      const res = await fetch(`/api/tmdb/images?id=${id}&type=${type}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPosters(data.posters || []);
        if (!data.posters || data.posters.length === 0) {
          setErrorMsg('No alternative posters found in TMDB gallery for this title.');
        }
      } else {
        setErrorMsg('Failed to load gallery from TMDB.');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedUrl) {
      onSelectPoster(selectedUrl);
      onClose();
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      onSelectPoster(customUrlInput.trim());
      onClose();
    }
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

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-[#141624] border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] p-6 z-10 text-white space-y-5 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-[3px] border-black pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400 border-2 border-black -skew-x-6 text-black font-black">
                <ImageIcon className="w-5 h-5 skew-x-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black tracking-wider uppercase text-amber-400">
                  Select Official Poster Art
                </h3>
                <p className="text-xs text-zinc-300 font-sans">
                  Choose from official TMDB gallery artwork for <strong className="text-white">"{title}"</strong> (TMDB ID: {tmdbId || 'N/A'})
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

          {/* Posters Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <span className="font-display uppercase tracking-wider text-sm">
                  Loading TMDB Poster Gallery...
                </span>
              </div>
            ) : errorMsg && posters.length === 0 ? (
              <div className="bg-zinc-900 border-2 border-black p-6 text-center text-sm font-sans text-zinc-400 space-y-2">
                <p>{errorMsg}</p>
                <p className="text-xs text-zinc-500">You can paste any custom image URL below to override.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display uppercase tracking-wider text-zinc-400">
                    Found {posters.length} Posters (Click to select)
                  </span>
                  {selectedUrl && (
                    <ComicBadge variant="green" size="sm">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Poster Selected
                      </span>
                    </ComicBadge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {posters.map((poster, index) => {
                    const isSelected = selectedUrl === poster.url;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedUrl(poster.url)}
                        className={`relative aspect-[2/3] border-[3px] transition cursor-pointer overflow-hidden group ${
                          isSelected
                            ? 'border-amber-400 shadow-[4px_4px_0px_0px_#F59E0B] ring-2 ring-amber-400'
                            : 'border-black shadow-[3px_3px_0px_0px_#000000] hover:border-white'
                        }`}
                      >
                        <img
                          src={poster.url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-1 bg-emerald-500 text-black border border-black shadow-[2px_2px_0px_0px_#000000] font-black z-10">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        {/* Dimensions / Language Tag */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 flex items-center justify-between border-t border-black">
                          <span>{poster.language ? poster.language.toUpperCase() : 'EN'}</span>
                          {poster.width && poster.height && (
                            <span>{poster.width}x{poster.height}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Manual URL Override & Apply Actions */}
          <div className="pt-3 border-t-2 border-black space-y-3 bg-[#161824] -mx-6 -mb-6 p-6">
            {/* Custom URL Input */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Or paste any custom image URL (https://...)"
                  className="w-full bg-zinc-950 border-2 border-black p-2 pl-8 text-xs font-sans text-white focus:outline-none focus:border-cyan-400 shadow-[2px_2px_0px_0px_#000000]"
                />
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3 pointer-events-none" />
              </div>
              <ComicButton
                onClick={handleApplyCustomUrl}
                disabled={!customUrlInput.trim()}
                variant="cyan"
                size="sm"
              >
                Use Custom URL
              </ComicButton>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400 font-sans truncate max-w-sm">
                {selectedUrl ? `Selected: ${selectedUrl.slice(0, 45)}...` : 'Select a poster above to apply'}
              </span>
              <div className="flex items-center gap-2">
                <ComicButton onClick={onClose} variant="dark" size="sm">
                  Cancel
                </ComicButton>
                <ComicButton
                  onClick={handleApply}
                  disabled={!selectedUrl}
                  variant="gold"
                  size="md"
                  leftIcon={<Check className="w-4 h-4 text-black" />}
                >
                  Confirm Selected Poster
                </ComicButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
