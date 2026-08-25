'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ComicBadge } from '@/components/comic/ComicBadge';
import { ComicButton } from '@/components/comic/ComicButton';
import { FranchiseMedia, Universe, MediaType } from '@/lib/types';
import { MCU_SEED_DATA } from '@/lib/seed/mcu-seed';
import { DCU_SEED_DATA } from '@/lib/seed/dcu-seed';
import { PosterPickerModal } from '@/components/admin/PosterPickerModal';
import { ByokModal } from '@/components/settings/ByokModal';
import { useByokStore } from '@/lib/store/useByokStore';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  Download,
  ShieldCheck,
  Film,
  Tv,
  Sparkles,
  Check,
  Lock,
  Image as ImageIcon,
  Key,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Selected universe tab
  const [selectedUniverse, setSelectedUniverse] = useState<Universe>('mcu');

  // Tracklist state
  const [mediaList, setMediaList] = useState<FranchiseMedia[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Auto-fill State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'movie' | 'show'>('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Exact TMDB ID Lookup State
  const [lookupTmdbId, setLookupTmdbId] = useState('');
  const [lookupType, setLookupType] = useState<MediaType>('movie');
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Form State for Add / Edit
  const [formUniverse, setFormUniverse] = useState<Universe>('mcu');
  const [formTitle, setFormTitle] = useState('');
  const [formMediaType, setFormMediaType] = useState<MediaType>('movie');
  const [formReleaseOrder, setFormReleaseOrder] = useState<number>(1);
  const [formChronoOrder, setFormChronoOrder] = useState<number | string>('');
  const [formPhase, setFormPhase] = useState('Phase 5');
  const [formPosterPath, setFormPosterPath] = useState('');
  const [formReleaseDate, setFormReleaseDate] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formTmdbId, setFormTmdbId] = useState<string | number>('');
  const [formTraktId, setFormTraktId] = useState<string | number>('');
  const [formIsReleased, setFormIsReleased] = useState(true);

  // Poster Picker Modal State
  const [isPosterPickerOpen, setIsPosterPickerOpen] = useState(false);
  const [pickerTargetItem, setPickerTargetItem] = useState<{
    id?: string;
    title: string;
    tmdbId?: number | null;
    mediaType: MediaType;
    currentPoster?: string | null;
  } | null>(null);

  // BYOK Modal State
  const [isByokModalOpen, setIsByokModalOpen] = useState(false);

  // Notification message
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Supabase connection status
  const [dbSource, setDbSource] = useState<'supabase' | 'seed'>('seed');
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Load media dynamically from live API / Supabase
  const loadMedia = async (universe: Universe) => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch(`/api/media?universe=${universe}`);
      if (res.ok) {
        const data = await res.json();
        if (data.media && data.media.length > 0) {
          setMediaList(data.media);
          setDbSource(data.source || 'seed');
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from /api/media, using fallback:', e);
    } finally {
      setIsLoadingMedia(false);
    }
    const fallback = universe === 'mcu' ? MCU_SEED_DATA : DCU_SEED_DATA;
    setMediaList(fallback);
  };

  useEffect(() => {
    loadMedia(selectedUniverse);
  }, [selectedUniverse]);

  // Check persisted admin session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('multiverse_admin_auth');
      if (stored === 'true') {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput, password: adminPassInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('multiverse_admin_auth', 'true');
        }
        setAuthError('');
      } else {
        setAuthError(data.error || 'Invalid admin email or security passcode.');
      }
    } catch (err: any) {
      setAuthError('Authentication request failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('multiverse_admin_auth');
    }
  };

  // 1. Live text search TMDB with scoped type
  const handleSearchApi = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const { tmdbApiKey } = useByokStore.getState();
      const headers: Record<string, string> = {};
      if (tmdbApiKey) headers['x-tmdb-api-key'] = tmdbApiKey;

      const typeParam = searchScope !== 'all' ? `&type=${searchScope}` : '';
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}${typeParam}`, { headers });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Direct Exact TMDB ID Lookup
  const handleDirectTmdbLookup = async () => {
    if (!lookupTmdbId.trim()) return;
    setIsLookingUp(true);
    try {
      const { tmdbApiKey } = useByokStore.getState();
      const headers: Record<string, string> = {};
      if (tmdbApiKey) headers['x-tmdb-api-key'] = tmdbApiKey;

      const res = await fetch(`/api/tmdb/lookup?id=${encodeURIComponent(lookupTmdbId.trim())}&type=${lookupType}`, { headers });
      const data = await res.json();

      if (data.result) {
        handleSelectSearchResult(data.result);
        setStatusMsg({ text: `Directly fetched "${data.result.title}" (TMDB ID: ${lookupTmdbId})!`, type: 'success' });
        setLookupTmdbId('');
      } else {
        setStatusMsg({ text: data.error || 'Movie/Show not found for this TMDB ID', type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Failed to lookup TMDB ID', type: 'error' });
    } finally {
      setIsLookingUp(false);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setFormTitle(result.title || '');
    setFormMediaType(result.media_type || 'movie');
    setFormPosterPath(result.poster_path || '');
    setFormReleaseDate(result.release_date || '');
    setFormOverview(result.overview || '');
    setFormTmdbId(result.tmdb_id || '');
    setFormTraktId(result.trakt_id || '');
    if (result.phase_or_chapter) setFormPhase(result.phase_or_chapter);
    if (result.universe) setFormUniverse(result.universe);

    const currentMax = mediaList.reduce((max, item) => Math.max(max, item.release_order), 0);
    setFormReleaseOrder(currentMax + 1);

    setSearchResults([]);
    setSearchQuery('');
    setStatusMsg({ text: `Auto-filled metadata for "${result.title}"!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setStatusMsg({ text: 'Title is required.', type: 'error' });
      return;
    }

    const newItem: FranchiseMedia = {
      id: editingId || `${formUniverse}-${Date.now()}`,
      universe: formUniverse,
      title: formTitle.trim(),
      media_type: formMediaType,
      release_order: Number(formReleaseOrder) || 1,
      chronological_order: formChronoOrder ? Number(formChronoOrder) : null,
      phase_or_chapter: formPhase.trim() || (formUniverse === 'mcu' ? 'Phase 5' : 'DCEU Era'),
      poster_path: formPosterPath.trim() || null,
      release_date: formReleaseDate.trim() || null,
      overview: formOverview.trim() || null,
      tmdb_id: formTmdbId ? Number(formTmdbId) : null,
      trakt_id: formTraktId ? Number(formTraktId) : null,
      is_released: formIsReleased,
    };

    let updatedList: FranchiseMedia[];
    if (editingId) {
      updatedList = mediaList.map((item) => (item.id === editingId ? newItem : item));
      setMediaList(updatedList);
      setStatusMsg({ text: `Updated "${newItem.title}"!`, type: 'success' });
      setEditingId(null);
    } else {
      updatedList = [...mediaList, newItem].sort((a, b) => a.release_order - b.release_order);
      setMediaList(updatedList);
      setStatusMsg({ text: `Added "${newItem.title}" to tracklist!`, type: 'success' });
    }

    // Auto-save to local seed file and database
    saveToCodebase(updatedList, formUniverse);

    resetForm();
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const saveToCodebase = async (listToSave: FranchiseMedia[] = mediaList, universeToSave: Universe = selectedUniverse) => {
    try {
      const res = await fetch('/api/admin/save-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universe: universeToSave, mediaList: listToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: data.message || 'Saved successfully!', type: 'success' });
        if (data.supabaseSaved) setDbSource('supabase');
      } else {
        setStatusMsg({ text: `Save Error: ${data.error || 'Database save failed.'}`, type: 'error' });
      }
    } catch (e: any) {
      console.error('Save to codebase error:', e);
      setStatusMsg({ text: `Network Error: ${e.message}`, type: 'error' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormPosterPath('');
    setFormReleaseDate('');
    setFormOverview('');
    setFormTmdbId('');
    setFormTraktId('');
    setFormChronoOrder('');
    const currentMax = mediaList.reduce((max, item) => Math.max(max, item.release_order), 0);
    setFormReleaseOrder(currentMax + 1);
  };

  const handleEditItem = (item: FranchiseMedia) => {
    setEditingId(item.id);
    setFormUniverse(item.universe);
    setFormTitle(item.title);
    setFormMediaType(item.media_type);
    setFormReleaseOrder(item.release_order);
    setFormChronoOrder(item.chronological_order !== null ? item.chronological_order : '');
    setFormPhase(item.phase_or_chapter);
    setFormPosterPath(item.poster_path || '');
    setFormReleaseDate(item.release_date || '');
    setFormOverview(item.overview || '');
    setFormTmdbId(item.tmdb_id || '');
    setFormTraktId(item.trakt_id || '');
    setFormIsReleased(item.is_released);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updatedList = mediaList.filter((item) => item.id !== id);
      setMediaList(updatedList);
      saveToCodebase(updatedList, selectedUniverse);
      setStatusMsg({ text: `Deleted "${title}" and updated codebase!`, type: 'success' });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Open Poster Picker from Form
  const handleOpenFormPosterPicker = () => {
    setPickerTargetItem({
      title: formTitle || 'Current Item',
      tmdbId: formTmdbId ? Number(formTmdbId) : null,
      mediaType: formMediaType,
      currentPoster: formPosterPath,
    });
    setIsPosterPickerOpen(true);
  };

  // Open Poster Picker directly from Table Row
  const handleOpenRowPosterPicker = (item: FranchiseMedia) => {
    setPickerTargetItem({
      id: item.id,
      title: item.title,
      tmdbId: item.tmdb_id,
      mediaType: item.media_type,
      currentPoster: item.poster_path,
    });
    setIsPosterPickerOpen(true);
  };

  // Handle Poster selection callback
  const handlePosterSelected = (newPosterUrl: string) => {
    if (pickerTargetItem?.id) {
      // Updated directly in table list
      const updatedList = mediaList.map((item) =>
        item.id === pickerTargetItem.id ? { ...item, poster_path: newPosterUrl } : item
      );
      setMediaList(updatedList);
      saveToCodebase(updatedList, selectedUniverse);
      setStatusMsg({ text: `Updated poster for "${pickerTargetItem.title}" and saved to codebase!`, type: 'success' });
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      // Updated in active form
      setFormPosterPath(newPosterUrl);
    }
  };

  const handleExportSeed = () => {
    const jsonStr = JSON.stringify(mediaList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedUniverse}_curated_seed_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141624] border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-display font-black tracking-wider text-white uppercase">
                Curator Admin Gate
              </h2>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Curate tracklists, select official poster artwork, and configure chronological orders.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Admin Email
                </label>
                <input
                  type="text"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="admin@multiversetracker.com"
                  className="w-full bg-zinc-950 border-2 border-black p-2.5 text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Security Passcode
                </label>
                <input
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder="Enter passcode (e.g. multiverse2025)"
                  className="w-full bg-zinc-950 border-2 border-black p-2.5 text-sm text-white font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              {authError && (
                <div className="text-xs text-rose-400 font-bold font-sans">{authError}</div>
              )}

              <ComicButton variant="gold" size="lg" className="w-full" type="submit">
                Authorize Curator
              </ComicButton>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Admin Dashboard Header */}
        <section className="bg-[#141624] border-[4px] border-black shadow-[6px_6px_0px_0px_#000000] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <ComicBadge variant="gold" size="sm">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> CURATOR ADMIN MODE
                </span>
              </ComicBadge>
              <ComicBadge variant="white" size="sm">
                {mediaList.length} Titles
              </ComicBadge>
              {dbSource === 'supabase' ? (
                <ComicBadge variant="green" size="sm">
                  ⚡ Cloud Supabase Active
                </ComicBadge>
              ) : (
                <ComicBadge variant="dark" size="sm">
                  📁 Seed Storage Mode
                </ComicBadge>
              )}
            </div>
            <h1 className="text-3xl font-display font-black uppercase text-white tracking-wider">
              Tracklist & Poster Curator Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ComicButton
              onClick={() => saveToCodebase(mediaList, selectedUniverse)}
              variant="gold"
              size="sm"
              leftIcon={<Save className="w-4 h-4 text-black" />}
            >
              Save All to Codebase
            </ComicButton>
            <ComicButton
              onClick={() => setIsByokModalOpen(true)}
              variant="dark"
              size="sm"
              leftIcon={<Key className="w-4 h-4 text-cyan-400" />}
            >
              BYOK Keys
            </ComicButton>
            <ComicButton onClick={handleExportSeed} variant="cyan" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export JSON
            </ComicButton>
            <ComicButton onClick={handleLogout} variant="danger" size="sm" leftIcon={<Lock className="w-4 h-4" />}>
              Exit Admin
            </ComicButton>
          </div>
        </section>

        {/* Universe Switcher for Admin */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedUniverse('mcu');
              setFormUniverse('mcu');
              setFormPhase('Phase 5');
            }}
            className={clsx(
              'px-6 py-2 border-[3px] border-black font-display text-base font-bold uppercase transition select-none cursor-pointer',
              selectedUniverse === 'mcu'
                ? 'bg-marvel-crimson text-white shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white shadow-[2px_2px_0px_0px_#000000]'
            )}
          >
            Manage Marvel Multiverse ({MCU_SEED_DATA.length} Entries)
          </button>
          <button
            onClick={() => {
              setSelectedUniverse('dcu');
              setFormUniverse('dcu');
              setFormPhase('Chapter 1: Gods & Monsters');
            }}
            className={clsx(
              'px-6 py-2 border-[3px] border-black font-display text-base font-bold uppercase transition select-none cursor-pointer',
              selectedUniverse === 'dcu'
                ? 'bg-[#005792] text-white shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white shadow-[2px_2px_0px_0px_#000000]'
            )}
          >
            Manage DC Universe ({DCU_SEED_DATA.length} Entries)
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={clsx(
              'p-3 border-2 border-black font-display uppercase tracking-wider text-sm flex items-center gap-2 shadow-[3px_3px_0px_0px_#000000]',
              statusMsg.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
            )}
          >
            <Check className="w-4 h-4" />
            {statusMsg.text}
          </div>
        )}

        {/* 1. TMDB Query / Exact ID Lookup & Add/Edit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Two Lookup Methods (Scoped Search & Exact TMDB ID) */}
          <div className="space-y-4">
            {/* Box A: Search by Title */}
            <div className="bg-[#161824] border-[3px] border-black p-4 shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <h3 className="text-base font-display font-bold uppercase text-amber-400 flex items-center gap-2 border-b-2 border-black pb-2">
                <Search className="w-4 h-4" /> 1A. Search by Title
              </h3>

              {/* Scope filter */}
              <div className="flex gap-1 bg-zinc-950 p-1 border-2 border-black text-xs font-display">
                <button
                  onClick={() => setSearchScope('all')}
                  className={clsx('flex-1 py-1 uppercase', searchScope === 'all' ? 'bg-amber-400 text-black' : 'text-zinc-400')}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchScope('movie')}
                  className={clsx('flex-1 py-1 uppercase', searchScope === 'movie' ? 'bg-amber-400 text-black' : 'text-zinc-400')}
                >
                  Movies
                </button>
                <button
                  onClick={() => setSearchScope('show')}
                  className={clsx('flex-1 py-1 uppercase', searchScope === 'show' ? 'bg-amber-400 text-black' : 'text-zinc-400')}
                >
                  TV Shows
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchApi()}
                  placeholder="e.g. Spider-Man 2, Daredevil..."
                  className="flex-1 bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                />
                <ComicButton onClick={handleSearchApi} disabled={isSearching} variant="gold" size="sm">
                  {isSearching ? '...' : 'Search'}
                </ComicButton>
              </div>

              {/* Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-2 border-2 border-black p-2 bg-zinc-950">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSearchResult(res)}
                      className="p-2 bg-zinc-900 hover:bg-amber-400 hover:text-black border border-zinc-700 hover:border-black cursor-pointer transition flex items-center gap-3 text-xs"
                    >
                      {res.poster_path && (
                        <img src={res.poster_path} alt="" className="w-8 h-12 object-cover border border-black" />
                      )}
                      <div className="flex-1">
                        <div className="font-display font-bold text-sm">{res.title}</div>
                        <div className="text-[10px] opacity-75 font-sans">
                          {res.media_type?.toUpperCase()} • {res.release_date || 'TBD'} • ID: {res.tmdb_id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box B: Exact TMDB ID Lookup */}
            <div className="bg-[#161824] border-[3px] border-black p-4 shadow-[5px_5px_0px_0px_#000000] space-y-3">
              <h3 className="text-base font-display font-bold uppercase text-cyan-400 flex items-center gap-2 border-b-2 border-black pb-2">
                <Key className="w-4 h-4" /> 1B. Direct Exact TMDB ID Lookup
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Enter an exact TMDB ID to pull metadata without search ambiguity (e.g. <code>299534</code> for Avengers: Endgame).
              </p>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={lookupType}
                  onChange={(e) => setLookupType(e.target.value as MediaType)}
                  className="bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-400"
                >
                  <option value="movie">Movie</option>
                  <option value="show">TV Show</option>
                </select>
                <input
                  type="text"
                  value={lookupTmdbId}
                  onChange={(e) => setLookupTmdbId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDirectTmdbLookup()}
                  placeholder="TMDB ID"
                  className="col-span-2 bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-400"
                />
              </div>

              <ComicButton
                onClick={handleDirectTmdbLookup}
                disabled={isLookingUp || !lookupTmdbId.trim()}
                variant="cyan"
                size="sm"
                className="w-full"
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                {isLookingUp ? 'Fetching TMDB ID...' : 'Fetch by Exact ID'}
              </ComicButton>
            </div>
          </div>

          {/* Right Columns (Span 2): Add / Edit Form with Live Poster Preview */}
          <div className="lg:col-span-2 bg-[#161824] border-[3px] border-black p-5 shadow-[5px_5px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-lg font-display font-bold uppercase text-amber-400 flex items-center gap-2">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Edit Entry & Choose Poster' : '2. Add Curated Entry'}
              </h3>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs font-display text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Poster Live Preview & Picker Button */}
                <div className="flex flex-col items-center justify-start space-y-2">
                  <div className="w-32 aspect-[2/3] bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden relative flex items-center justify-center">
                    {formPosterPath ? (
                      <img
                        src={formPosterPath}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center p-2 text-zinc-500 font-display text-xs">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        No Poster
                      </div>
                    )}
                  </div>

                  <ComicButton
                    type="button"
                    onClick={handleOpenFormPosterPicker}
                    disabled={!formTmdbId && !formTitle}
                    variant="cyan"
                    size="sm"
                    className="w-full text-center"
                    leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
                  >
                    Select Poster Art
                  </ComicButton>
                </div>

                {/* Form Inputs Grid */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Spider-Man: Beyond the Spider-Verse"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Media Type
                      </label>
                      <select
                        value={formMediaType}
                        onChange={(e) => setFormMediaType(e.target.value as MediaType)}
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      >
                        <option value="movie">Movie</option>
                        <option value="show">TV Show</option>
                        <option value="special">Special Presentation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Universe
                      </label>
                      <select
                        value={formUniverse}
                        onChange={(e) => setFormUniverse(e.target.value as Universe)}
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      >
                        <option value="mcu">MCU / Marvel</option>
                        <option value="dcu">DCU / DC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Phase / Chapter
                      </label>
                      <input
                        type="text"
                        value={formPhase}
                        onChange={(e) => setFormPhase(e.target.value)}
                        placeholder="Phase 5 / Fox X-Men"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Release #
                      </label>
                      <input
                        type="number"
                        value={formReleaseOrder}
                        onChange={(e) => setFormReleaseOrder(Number(e.target.value))}
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Chrono #
                      </label>
                      <input
                        type="number"
                        value={formChronoOrder}
                        onChange={(e) => setFormChronoOrder(e.target.value)}
                        placeholder="optional"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        TMDB ID
                      </label>
                      <input
                        type="number"
                        value={formTmdbId}
                        onChange={(e) => setFormTmdbId(e.target.value)}
                        placeholder="e.g. 569094"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Release Date
                      </label>
                      <input
                        type="date"
                        value={formReleaseDate}
                        onChange={(e) => setFormReleaseDate(e.target.value)}
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Manual Poster Override Text Input */}
                  <div>
                    <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                      Poster Image URL (Manual Override)
                    </label>
                    <input
                      type="text"
                      value={formPosterPath}
                      onChange={(e) => setFormPosterPath(e.target.value)}
                      placeholder="https://image.tmdb.org/t/p/w500/... or custom image URL"
                      className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                  Synopsis / Overview
                </label>
                <textarea
                  rows={2}
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="Plot summary..."
                  className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <ComicButton variant={editingId ? 'cyan' : 'gold'} size="md" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                  {editingId ? 'Save Changes' : 'Add to Tracklist'}
                </ComicButton>
              </div>
            </form>
          </div>
        </div>

        {/* 2. Live Editable Media Table with Poster Picker Action */}
        <section className="bg-[#161824] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 flex-wrap gap-2">
            <h3 className="text-xl font-display font-black uppercase text-white tracking-wider">
              {selectedUniverse.toUpperCase()} Tracklist Live Table ({mediaList.length} Entries)
            </h3>
            <span className="text-xs text-zinc-400 font-sans">
              Click <ImageIcon className="w-3 h-3 inline text-amber-400 mx-1" /> on any row to swap posters from TMDB gallery instantly!
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-zinc-950 font-display uppercase text-zinc-400 border-b-2 border-black">
                <tr>
                  <th className="p-2.5">Rel #</th>
                  <th className="p-2.5">Chrono #</th>
                  <th className="p-2.5">Poster</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Phase / Universe</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">TMDB ID</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {mediaList.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-2.5 font-display font-bold text-amber-400">#{item.release_order}</td>
                    <td className="p-2.5 font-display font-bold text-cyan-400">
                      {item.chronological_order ? `#${item.chronological_order}` : '—'}
                    </td>
                    <td className="p-2.5">
                      <div
                        onClick={() => handleOpenRowPosterPicker(item)}
                        className="relative w-8 h-12 bg-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer group overflow-hidden"
                        title="Click to select alternative poster"
                      >
                        {item.poster_path ? (
                          <img src={item.poster_path} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 m-auto text-zinc-600" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-amber-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-white max-w-xs truncate">{item.title}</td>
                    <td className="p-2.5">
                      <ComicBadge variant="dark" size="sm">
                        {item.phase_or_chapter}
                      </ComicBadge>
                    </td>
                    <td className="p-2.5 capitalize">{item.media_type}</td>
                    <td className="p-2.5 text-zinc-400 font-mono">{item.tmdb_id || '—'}</td>
                    <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenRowPosterPicker(item)}
                        className="p-1.5 bg-amber-400 hover:bg-amber-300 text-black border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Choose Poster Art"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-black border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Edit title"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Delete title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Poster Selection Gallery Modal */}
      {pickerTargetItem && (
        <PosterPickerModal
          isOpen={isPosterPickerOpen}
          onClose={() => setIsPosterPickerOpen(false)}
          title={pickerTargetItem.title}
          tmdbId={pickerTargetItem.tmdbId}
          mediaType={pickerTargetItem.mediaType}
          currentPosterPath={pickerTargetItem.currentPoster}
          onSelectPoster={handlePosterSelected}
        />
      )}

      {/* BYOK Settings Modal */}
      <ByokModal isOpen={isByokModalOpen} onClose={() => setIsByokModalOpen(false)} />

      <Footer />
    </div>
  );
}
