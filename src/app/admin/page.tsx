'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowUp,
  ArrowDown,
  Layers,
  ListOrdered,
  Filter,
  SlidersHorizontal,
  FolderEdit,
  ArrowUpDown,
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

  // Filter & Search Table State
  const [tableFilterQuery, setTableFilterQuery] = useState('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');

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

  // Unique phases extracted in sequence
  const uniquePhases = useMemo(() => {
    const list: string[] = [];
    for (const item of mediaList) {
      const p = item.phase_or_chapter?.trim() || (selectedUniverse === 'mcu' ? 'Phase 1' : 'Chapter 1');
      if (!list.includes(p)) list.push(p);
    }
    return list;
  }, [mediaList, selectedUniverse]);

  // Load media dynamically from live API / Supabase
  const loadMedia = async (universe: Universe) => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch(`/api/media?universe=${universe}&_t=${Date.now()}`);
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

      try {
        // 1. Direct delete from database
        await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        // 2. Sync full remaining list to seed and database
        await saveToCodebase(updatedList, selectedUniverse);
        setStatusMsg({ text: `Permanently deleted "${title}" from tracklist and database!`, type: 'success' });
      } catch (err: any) {
        console.error('Delete error:', err);
        setStatusMsg({ text: `Deleted locally, but sync error: ${err.message}`, type: 'error' });
      }

      setTimeout(() => setStatusMsg(null), 3500);
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

  // ----------------------------------------------------
  // PHASE & ITEM REORDERING HANDLERS
  // ----------------------------------------------------

  // Move Single Item Up in Table
  const handleMoveRowUp = async (index: number) => {
    if (index <= 0) return;
    const updated = [...mediaList];
    const item = updated[index];
    const prevItem = updated[index - 1];

    // Swap positions
    updated[index] = prevItem;
    updated[index - 1] = item;

    // Renumber release order sequentially
    updated.forEach((m, idx) => {
      m.release_order = idx + 1;
    });

    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Moved "${item.title}" up to #${index}!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // Move Single Item Down in Table
  const handleMoveRowDown = async (index: number) => {
    if (index >= mediaList.length - 1) return;
    const updated = [...mediaList];
    const item = updated[index];
    const nextItem = updated[index + 1];

    // Swap positions
    updated[index] = nextItem;
    updated[index + 1] = item;

    // Renumber release order sequentially
    updated.forEach((m, idx) => {
      m.release_order = idx + 1;
    });

    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Moved "${item.title}" down to #${index + 2}!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // Move Entire Phase Up
  const handleMovePhaseUp = async (phaseName: string) => {
    const phaseIndex = uniquePhases.indexOf(phaseName);
    if (phaseIndex <= 0) return;
    const prevPhase = uniquePhases[phaseIndex - 1];

    const currentPhaseItems = mediaList.filter((m) => m.phase_or_chapter === phaseName);
    const prevPhaseItems = mediaList.filter((m) => m.phase_or_chapter === prevPhase);

    const updated: FranchiseMedia[] = [];
    let inserted = false;

    for (const item of mediaList) {
      if (item.phase_or_chapter === prevPhase) {
        if (!inserted) {
          updated.push(...currentPhaseItems);
          inserted = true;
        }
        updated.push(item);
      } else if (item.phase_or_chapter === phaseName) {
        continue;
      } else {
        updated.push(item);
      }
    }

    updated.forEach((m, idx) => {
      m.release_order = idx + 1;
    });

    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Moved Phase "${phaseName}" ahead of "${prevPhase}"!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Move Entire Phase Down
  const handleMovePhaseDown = async (phaseName: string) => {
    const phaseIndex = uniquePhases.indexOf(phaseName);
    if (phaseIndex >= uniquePhases.length - 1) return;
    const nextPhase = uniquePhases[phaseIndex + 1];

    const currentPhaseItems = mediaList.filter((m) => m.phase_or_chapter === phaseName);

    const updated: FranchiseMedia[] = [];
    for (const item of mediaList) {
      if (item.phase_or_chapter === phaseName) {
        continue;
      }
      updated.push(item);
    }

    const lastNextIdx = updated.findLastIndex((u) => u.phase_or_chapter === nextPhase);
    if (lastNextIdx !== -1) {
      updated.splice(lastNextIdx + 1, 0, ...currentPhaseItems);
    } else {
      updated.push(...currentPhaseItems);
    }

    updated.forEach((m, idx) => {
      m.release_order = idx + 1;
    });

    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Moved Phase "${phaseName}" after "${nextPhase}"!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Quick Inline Phase Change for a Single Item
  const handleQuickPhaseChange = async (itemId: string, newPhase: string) => {
    if (!newPhase.trim()) return;
    const updated = mediaList.map((item) =>
      item.id === itemId ? { ...item, phase_or_chapter: newPhase.trim() } : item
    );
    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Updated phase to "${newPhase.trim()}"!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  // Batch Rename Phase Across All Matching Items
  const handleRenamePhase = async (oldPhaseName: string) => {
    const newName = prompt(`Enter new name for phase "${oldPhaseName}":`, oldPhaseName);
    if (!newName || !newName.trim() || newName.trim() === oldPhaseName) return;

    const count = mediaList.filter((m) => m.phase_or_chapter === oldPhaseName).length;
    const updated = mediaList.map((item) =>
      item.phase_or_chapter === oldPhaseName ? { ...item, phase_or_chapter: newName.trim() } : item
    );

    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Renamed "${oldPhaseName}" to "${newName.trim()}" across ${count} items!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Normalize Release Orders to Strict 1..N
  const handleNormalizeOrders = async () => {
    const updated = [...mediaList].sort((a, b) => a.release_order - b.release_order);
    updated.forEach((m, idx) => {
      m.release_order = idx + 1;
    });
    setMediaList(updated);
    await saveToCodebase(updated, selectedUniverse);
    setStatusMsg({ text: `Re-indexed all ${updated.length} entries sequentially (1..${updated.length})!`, type: 'success' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Filtered media list for the live table
  const filteredMediaList = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesPhase = selectedPhaseFilter === 'all' || item.phase_or_chapter === selectedPhaseFilter;
      const matchesQuery =
        !tableFilterQuery.trim() ||
        item.title.toLowerCase().includes(tableFilterQuery.toLowerCase()) ||
        String(item.tmdb_id || '').includes(tableFilterQuery) ||
        (item.phase_or_chapter || '').toLowerCase().includes(tableFilterQuery.toLowerCase());
      return matchesPhase && matchesQuery;
    });
  }, [mediaList, selectedPhaseFilter, tableFilterQuery]);

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

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Universe Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141624] border-[3px] border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000000]">
          <div>
            <div className="flex items-center gap-2">
              <ComicBadge variant="gold" size="sm">
                CURATOR MODE
              </ComicBadge>
              <span
                className={clsx(
                  'text-[10px] font-display font-bold uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]',
                  dbSource === 'supabase' ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'
                )}
              >
                {dbSource === 'supabase' ? 'Cloud Database Connected' : 'Seed Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-wider mt-1">
              Multiverse Tracklist & Phase Editor
            </h1>
          </div>

          {/* Universe Tab Buttons & Admin Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedUniverse('mcu');
                setSelectedPhaseFilter('all');
                setFormUniverse('mcu');
                setFormPhase('Phase 5');
              }}
              className={clsx(
                'px-4 py-2 font-display text-sm font-bold uppercase transition border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                selectedUniverse === 'mcu'
                  ? 'bg-marvel-crimson text-white shadow-[3px_3px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              )}
            >
              Marvel MCU ({selectedUniverse === 'mcu' ? mediaList.length : '154'})
            </button>

            <button
              onClick={() => {
                setSelectedUniverse('dcu');
                setSelectedPhaseFilter('all');
                setFormUniverse('dcu');
                setFormPhase('Chapter 1: Gods & Monsters');
              }}
              className={clsx(
                'px-4 py-2 font-display text-sm font-bold uppercase transition border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer',
                selectedUniverse === 'dcu'
                  ? 'bg-[#005792] text-white shadow-[3px_3px_0px_0px_#000000]'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              )}
            >
              DC Universe ({selectedUniverse === 'dcu' ? mediaList.length : '131'})
            </button>

            <button
              onClick={() => setIsByokModalOpen(true)}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              title="API Keys (BYOK)"
            >
              <Key className="w-3.5 h-3.5" />
              <span>TMDB Key</span>
            </button>

            <button
              onClick={handleExportSeed}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              title="Download JSON Seed File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Seed</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Global Status Toast Notification */}
        {statusMsg && (
          <div
            className={clsx(
              'p-3.5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] text-xs font-sans font-bold flex items-center justify-between animate-in fade-in duration-200',
              statusMsg.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
            )}
          >
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="hover:opacity-75 font-display text-sm cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* PHASE CONTROL CENTER & REORDERING SUITE             */}
        {/* ---------------------------------------------------- */}
        <section className="bg-[#141624] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-display font-black uppercase text-white tracking-wider">
                Phase & Chapter Control Center ({uniquePhases.length} Active Phases)
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleNormalizeOrders}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-display text-xs font-bold uppercase flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title="Renumber all releases sequentially from 1 to N"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Re-index All Orders (1..{mediaList.length})</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-sans">
            Manage storyline phases below. Use <strong>▲ / ▼</strong> on each phase badge to shift entire storylines and all their titles in the timeline, or click <strong>Rename</strong> to update a phase name across all titles at once.
          </p>

          {/* Interactive Phase Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            {uniquePhases.map((phase, idx) => {
              const phaseCount = mediaList.filter((m) => m.phase_or_chapter === phase).length;
              return (
                <div
                  key={phase}
                  className={clsx(
                    'bg-zinc-950 border-2 border-black p-2.5 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between gap-2 transition hover:border-amber-400',
                    selectedPhaseFilter === phase && 'ring-2 ring-amber-400 bg-[#1e1c14]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-xs text-white truncate" title={phase}>
                      {idx + 1}. {phase}
                    </span>
                    <span className="text-[10px] font-sans font-bold bg-zinc-800 text-amber-400 px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]">
                      {phaseCount} titles
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMovePhaseUp(phase)}
                        disabled={idx === 0}
                        className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-amber-400 border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Move entire phase UP"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMovePhaseDown(phase)}
                        disabled={idx === uniquePhases.length - 1}
                        className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-amber-400 border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Move entire phase DOWN"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRenamePhase(phase)}
                        className="px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display text-[10px] font-bold uppercase border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                        title="Rename this phase for all titles"
                      >
                        Rename
                      </button>

                      <button
                        onClick={() => setSelectedPhaseFilter(selectedPhaseFilter === phase ? 'all' : phase)}
                        className={clsx(
                          'px-2 py-0.5 font-display text-[10px] font-bold uppercase border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer',
                          selectedPhaseFilter === phase
                            ? 'bg-amber-400 text-black font-black'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        )}
                        title="Filter table below to show only this phase"
                      >
                        {selectedPhaseFilter === phase ? 'Filtered' : 'Filter'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* ADD / EDIT FORM & TMDB DISCOVERY SUITE              */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: TMDB Discovery */}
          <div className="bg-[#161824] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <div className="border-b-2 border-black pb-2">
              <h2 className="text-lg font-display font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                Auto-Fill TMDB Metadata
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Deadpool & Wolverine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchApi()}
                  className="flex-1 bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                />
                <ComicButton
                  variant="gold"
                  size="sm"
                  onClick={handleSearchApi}
                  disabled={isSearching}
                >
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </ComicButton>
              </div>

              {/* Exact TMDB ID Direct Lookup */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <span className="text-[11px] font-display uppercase tracking-wider text-zinc-400 block">
                  Or Lookup by Exact TMDB ID:
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="TMDB ID (e.g. 533535)"
                    value={lookupTmdbId}
                    onChange={(e) => setLookupTmdbId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDirectTmdbLookup()}
                    className="flex-1 bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <select
                    value={lookupType}
                    onChange={(e) => setLookupType(e.target.value as MediaType)}
                    className="bg-zinc-950 border-2 border-black p-1 text-xs text-white font-sans"
                  >
                    <option value="movie">Movie</option>
                    <option value="show">TV Show</option>
                  </select>
                  <ComicButton
                    variant="cyan"
                    size="sm"
                    onClick={handleDirectTmdbLookup}
                    disabled={isLookingUp}
                  >
                    {isLookingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Lookup'}
                  </ComicButton>
                </div>
              </div>

              {/* TMDB Search Results List */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <span className="text-xs font-display uppercase text-zinc-400">
                    Matches ({searchResults.length}):
                  </span>
                  {searchResults.map((result, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectSearchResult(result)}
                      className="flex items-center gap-3 p-2 bg-zinc-950 hover:bg-zinc-900 border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer transition"
                    >
                      {result.poster_path ? (
                        <img src={result.poster_path} alt="" className="w-8 h-12 object-cover border border-black" />
                      ) : (
                        <div className="w-8 h-12 bg-zinc-800 border border-black flex items-center justify-center">
                          <Film className="w-4 h-4 text-zinc-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-white truncate">{result.title}</div>
                        <div className="text-[10px] text-zinc-400">
                          {result.release_date || 'TBA'} • {result.media_type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 2 Columns: Add / Edit Media Form */}
          <div className="lg:col-span-2 bg-[#161824] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h2 className="text-lg font-display font-black uppercase text-white tracking-wider flex items-center gap-2">
                {editingId ? <Edit3 className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                {editingId ? 'Edit Release Details' : 'Add New Title to Tracklist'}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-zinc-400 hover:text-white underline font-display cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Poster Preview & Picker Button */}
                <div className="sm:col-span-1 flex flex-col items-center gap-2">
                  <div
                    onClick={handleOpenFormPosterPicker}
                    className="relative w-28 h-40 bg-zinc-950 border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center overflow-hidden cursor-pointer group"
                    title="Click to choose poster from gallery"
                  >
                    {formPosterPath ? (
                      <img src={formPosterPath} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
                        <span className="text-[10px] text-zinc-500 font-display uppercase">No Poster</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-amber-400 transition-opacity p-2 text-center">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-display font-bold uppercase">Change Art</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenFormPosterPicker}
                    className="text-[10px] font-display font-bold uppercase text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3" /> Select Poster
                  </button>
                </div>

                {/* Form Fields */}
                <div className="sm:col-span-3 space-y-3">
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
                        placeholder="Movie or Show title..."
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Type
                      </label>
                      <select
                        value={formMediaType}
                        onChange={(e) => setFormMediaType(e.target.value as MediaType)}
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      >
                        <option value="movie">Movie</option>
                        <option value="show">TV Show</option>
                        <option value="special">Special</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        Phase / Chapter
                      </label>
                      <input
                        type="text"
                        list="phase-options"
                        value={formPhase}
                        onChange={(e) => setFormPhase(e.target.value)}
                        placeholder="Phase 5 / Fox X-Men"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                      <datalist id="phase-options">
                        {uniquePhases.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
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
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-display uppercase tracking-wider text-zinc-400 mb-1">
                        TMDB ID
                      </label>
                      <input
                        type="number"
                        value={formTmdbId}
                        onChange={(e) => setFormTmdbId(e.target.value)}
                        placeholder="e.g. 569094"
                        className="w-full bg-zinc-950 border-2 border-black p-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  <ComicButton variant={editingId ? 'cyan' : 'gold'} size="md" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                    {editingId ? 'Save Changes' : 'Add to Tracklist'}
                  </ComicButton>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* LIVE EDITABLE MEDIA TABLE WITH REORDER & PHASE TOOLS */}
        {/* ---------------------------------------------------- */}
        <section className="bg-[#161824] border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-display font-black uppercase text-white tracking-wider">
                {selectedUniverse.toUpperCase()} Tracklist Live Table ({filteredMediaList.length} / {mediaList.length} Titles)
              </h3>
              <span className="text-xs text-zinc-400 font-sans">
                Use <strong>▲ / ▼</strong> to reorder release sequence or change phases directly inline!
              </span>
            </div>

            {/* Table Search & Phase Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-zinc-950 border-2 border-black px-2.5 py-1">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter table..."
                  value={tableFilterQuery}
                  onChange={(e) => setTableFilterQuery(e.target.value)}
                  className="bg-transparent text-xs text-white font-sans focus:outline-none w-32 sm:w-48"
                />
                {tableFilterQuery && (
                  <button onClick={() => setTableFilterQuery('')} className="text-zinc-500 hover:text-white text-xs cursor-pointer">
                    ✕
                  </button>
                )}
              </div>

              <select
                value={selectedPhaseFilter}
                onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                className="bg-zinc-950 border-2 border-black px-2 py-1 text-xs text-white font-display uppercase font-bold cursor-pointer"
              >
                <option value="all">All Phases ({uniquePhases.length})</option>
                {uniquePhases.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-zinc-950 font-display uppercase text-zinc-400 border-b-2 border-black">
                <tr>
                  <th className="p-2.5">Reorder</th>
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
                {filteredMediaList.map((item, idx) => {
                  const globalIndex = mediaList.findIndex((m) => m.id === item.id);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/60 transition">
                      {/* Move Up / Move Down Sequence Buttons */}
                      <td className="p-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveRowUp(globalIndex)}
                            disabled={globalIndex <= 0}
                            className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-25 text-amber-400 border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                            title="Move title UP in release order"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveRowDown(globalIndex)}
                            disabled={globalIndex >= mediaList.length - 1}
                            className="p-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-25 text-amber-400 border border-black shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                            title="Move title DOWN in release order"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

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

                      {/* Inline Phase Selector */}
                      <td className="p-2.5">
                        <select
                          value={item.phase_or_chapter || ''}
                          onChange={(e) => handleQuickPhaseChange(item.id, e.target.value)}
                          className="bg-zinc-950 border border-black px-2 py-1 text-[11px] text-zinc-200 font-display uppercase font-bold focus:outline-none focus:border-amber-400 max-w-[180px] truncate cursor-pointer"
                        >
                          {uniquePhases.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
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
                  );
                })}
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
