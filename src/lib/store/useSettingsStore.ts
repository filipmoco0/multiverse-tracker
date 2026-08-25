import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  showMarathonStats: boolean;
  showTrailersAndStreaming: boolean;
  enableConfetti: boolean;
  greyscaleUnwatched: boolean;
  isVipSupporter: boolean;
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
  isVipSupporter: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setSetting: (key, value) => {
        set((state) => ({ ...state, [key]: value }));
      },

      toggleSetting: (key) => {
        set((state) => ({ ...state, [key]: !state[key] }));
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: 'multiverse_settings_v1',
    }
  )
);
