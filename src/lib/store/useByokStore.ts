import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { syncUserProfileToCloud } from '../supabase/user-profile';

interface ByokState {
  tmdbApiKey: string;
  traktClientId: string;
  traktClientSecret: string;
  isCustomTmdbActive: boolean;
  isCustomTraktActive: boolean;
  setTmdbApiKey: (key: string) => void;
  setTraktCredentials: (clientId: string, clientSecret?: string) => void;
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
      traktClientId: '',
      traktClientSecret: '',
      isCustomTmdbActive: false,
      isCustomTraktActive: false,

      setTmdbApiKey: (key: string) => {
        const trimmed = key.trim();
        set({
          tmdbApiKey: trimmed,
          isCustomTmdbActive: Boolean(trimmed),
        });
        syncUserProfileToCloud({ tmdb_api_key: trimmed || null });
      },

      setTraktCredentials: (clientId: string, clientSecret: string = '') => {
        const trimmedId = clientId.trim();
        const trimmedSecret = clientSecret.trim();
        set({
          traktClientId: trimmedId,
          traktClientSecret: trimmedSecret,
          isCustomTraktActive: Boolean(trimmedId),
        });
      },

      clearKeys: () => {
        set({
          tmdbApiKey: '',
          traktClientId: '',
          traktClientSecret: '',
          isCustomTmdbActive: false,
          isCustomTraktActive: false,
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
