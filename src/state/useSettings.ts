import { create } from 'zustand';
import { getFromStorage, saveToStorage } from '@utils/storage';

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

// Storage schema version for migration
const STORAGE_KEY = 'boxing-timer-settings';
const STORAGE_VERSION = 1;

interface StoredSettings {
  version: number;
  settings: Settings;
}

interface SettingsStore extends Settings {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetToDefaults: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => {
    set((state) => ({
      ...state,
      [key]: value,
    }));
    // Auto-save on update
    get().saveToStorage();
  },

  resetToDefaults: () => {
    set(DEFAULT_SETTINGS);
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const stored = await getFromStorage<StoredSettings>(STORAGE_KEY);
      if (!stored) {
        // No stored settings, use defaults
        return;
      }

      // Migration: handle schema version changes
      if (stored.version !== STORAGE_VERSION) {
        // For now, just reset to defaults if version mismatch
        // In future, add migration logic here
        console.warn(`Settings version mismatch (${stored.version} vs ${STORAGE_VERSION}), using defaults`);
        return;
      }

      // Merge stored settings with defaults to handle new fields
      const mergedSettings: Settings = {
        ...DEFAULT_SETTINGS,
        ...stored.settings,
      };

      set(mergedSettings);
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      // Use defaults on error
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      const settingsToSave: Settings = {
        rounds: state.rounds,
        workDuration: state.workDuration,
        restDuration: state.restDuration,
        yellowThreshold: state.yellowThreshold,
        warmup: state.warmup,
        soundPack: state.soundPack,
        volume: state.volume,
        vibrationEnabled: state.vibrationEnabled,
        countdownEnabled: state.countdownEnabled,
      };

      const stored: StoredSettings = {
        version: STORAGE_VERSION,
        settings: settingsToSave,
      };

      await saveToStorage(STORAGE_KEY, stored);
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
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
