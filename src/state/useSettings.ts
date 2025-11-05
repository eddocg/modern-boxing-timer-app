import { create } from 'zustand';

interface Settings {
  rounds: number | null; // null means infinite
  workDuration: number; // in seconds
  restDuration: number; // in seconds
  yellowThreshold: number; // in seconds (how many seconds left to trigger yellow)
  warmup: number; // in seconds
  soundPack: 'boxing-bell' | 'mma-horn' | 'beep';
  volume: number; // 0-1
  vibrationEnabled: boolean;
  countdownEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  rounds: null, // infinite
  workDuration: 180, // 3 minutes
  restDuration: 60, // 1 minute
  yellowThreshold: 10, // 10 seconds
  warmup: 0,
  soundPack: 'boxing-bell',
  volume: 0.8,
  vibrationEnabled: true,
  countdownEnabled: false,
};

interface SettingsStore extends Settings {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetToDefaults: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  resetToDefaults: () => set(DEFAULT_SETTINGS),

  loadFromStorage: async () => {
    // Will be implemented in Phase 1 with AsyncStorage
    console.log('Loading settings from storage');
  },

  saveToStorage: async () => {
    // Will be implemented in Phase 1 with AsyncStorage
    console.log('Saving settings to storage');
  },
}));

// Selectors
export const useRounds = () => useSettingsStore((state) => state.rounds);
export const useWorkDuration = () => useSettingsStore((state) => state.workDuration);
export const useRestDuration = () => useSettingsStore((state) => state.restDuration);
export const useYellowThreshold = () => useSettingsStore((state) => state.yellowThreshold);
export const useWarmup = () => useSettingsStore((state) => state.warmup);
export const useSoundPack = () => useSettingsStore((state) => state.soundPack);
export const useVolume = () => useSettingsStore((state) => state.volume);
export const useVibrationEnabled = () => useSettingsStore((state) => state.vibrationEnabled);
export const useCountdownEnabled = () => useSettingsStore((state) => state.countdownEnabled);
