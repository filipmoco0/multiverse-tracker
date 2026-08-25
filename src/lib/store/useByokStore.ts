import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncUserProfileToCloud } from '../supabase/user-profile';

interface ByokState {
  tmdbApiKey: string;
  isCustomTmdbActive: boolean;
  setTmdbApiKey: (key: string) => void;
  clearKeys: () => void;
}

// SSR-Safe localStorage wrapper for Next.js prerendering
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useByokStore = create<ByokState>()(
  persist(
    (set) => ({
      tmdbApiKey: '',
      isCustomTmdbActive: false,

      setTmdbApiKey: (key: string) => {
        const trimmed = key.trim();
        set({
          tmdbApiKey: trimmed,
          isCustomTmdbActive: Boolean(trimmed),
        });
        syncUserProfileToCloud({ tmdb_api_key: trimmed || null });
      },

      clearKeys: () => {
        set({
          tmdbApiKey: '',
          isCustomTmdbActive: false,
        });
        syncUserProfileToCloud({ tmdb_api_key: null });
      },
    }),
    {
      name: 'multiverse_byok_keys_storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
