import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncUserProfileToCloud } from '../supabase/user-profile';

export interface AppSettings {
  showMarathonStats: boolean;
  showTrailersAndStreaming: boolean;
  enableConfetti: boolean;
  greyscaleUnwatched: boolean;
  hideOneShots: boolean;
  hideSpecials: boolean;
}

interface SettingsStore extends AppSettings {
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  toggleSetting: (key: keyof AppSettings) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  showMarathonStats: true,
  showTrailersAndStreaming: true,
  enableConfetti: true,
  greyscaleUnwatched: true,
  hideOneShots: false,
  hideSpecials: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setSetting: (key, value) => {
        const next = { ...get(), [key]: value };
        set((state) => ({ ...state, [key]: value }));
        syncUserProfileToCloud({ settings: next });
      },

      toggleSetting: (key) => {
        const nextVal = !get()[key];
        const next = { ...get(), [key]: nextVal };
        set((state) => ({ ...state, [key]: nextVal }));
        syncUserProfileToCloud({ settings: next });
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
        syncUserProfileToCloud({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'multiverse_settings_v1',
    }
  )
);
