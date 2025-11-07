import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '@state/useSettings';
import { getFromStorage, saveToStorage } from '@utils/storage';

// Mock storage
vi.mock('@utils/storage', () => ({
  getFromStorage: vi.fn(),
  saveToStorage: vi.fn(),
}));

describe('Settings Store', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSettingsStore.setState({
      rounds: null,
      workDuration: 180,
      restDuration: 60,
      yellowDuration: 10,
      warmup: 0,
      soundPack: 'boxing-bell',
      volume: 0.8,
      vibrationEnabled: true,
      countdownEnabled: false,
    });
    vi.clearAllMocks();
  });

  describe('Storage Persistence', () => {
    it('loads settings from storage', async () => {
      // Mock stored settings
      vi.mocked(getFromStorage).mockResolvedValue({
        version: 2,
        settings: {
          rounds: 5,
          workDuration: 120,
          restDuration: 45,
          yellowDuration: 15,
          warmup: 30,
          soundPack: 'mma-horn',
          volume: 0.9,
          vibrationEnabled: false,
          countdownEnabled: true,
        },
      });

      const store = useSettingsStore.getState();
      await store.loadFromStorage();

      const state = useSettingsStore.getState();
      expect(state.rounds).toBe(5);
      expect(state.workDuration).toBe(120);
      expect(state.restDuration).toBe(45);
      expect(state.yellowDuration).toBe(15);
      expect(state.warmup).toBe(30);
      expect(state.soundPack).toBe('mma-horn');
      expect(state.volume).toBe(0.9);
      expect(state.vibrationEnabled).toBe(false);
      expect(state.countdownEnabled).toBe(true);
    });

    it('uses defaults when no stored settings', async () => {
      vi.mocked(getFromStorage).mockResolvedValue(null);

      const store = useSettingsStore.getState();
      await store.loadFromStorage();

      const state = useSettingsStore.getState();
      expect(state.workDuration).toBe(180);
      expect(state.restDuration).toBe(60);
    });

    it('saves settings to storage on update', async () => {
      vi.mocked(saveToStorage).mockResolvedValue(undefined);

      const store = useSettingsStore.getState();
      store.updateSetting('workDuration', 120);

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(saveToStorage).toHaveBeenCalled();
      const callArgs = vi.mocked(saveToStorage).mock.calls[0];
      expect(callArgs[0]).toBe('boxing-timer-settings');
      expect(callArgs[1]).toMatchObject({
        version: 2,
        settings: expect.objectContaining({
          workDuration: 120,
        }),
      });
    });

    it('saves settings to storage on reset', async () => {
      vi.mocked(saveToStorage).mockResolvedValue(undefined);

      const store = useSettingsStore.getState();
      store.resetToDefaults();

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(saveToStorage).toHaveBeenCalled();
    });

    it('handles storage errors gracefully', async () => {
      vi.mocked(getFromStorage).mockRejectedValue(new Error('Storage error'));

      const store = useSettingsStore.getState();
      await store.loadFromStorage();

      // Should still have defaults
      const state = useSettingsStore.getState();
      expect(state.workDuration).toBe(180);
    });
  });

  describe('Settings Updates', () => {
    it('updates work duration', () => {
      const store = useSettingsStore.getState();
      store.updateSetting('workDuration', 120);

      const state = useSettingsStore.getState();
      expect(state.workDuration).toBe(120);
    });

    it('updates multiple settings', () => {
      const store = useSettingsStore.getState();
      store.updateSetting('workDuration', 120);
      store.updateSetting('restDuration', 45);

      const state = useSettingsStore.getState();
      expect(state.workDuration).toBe(120);
      expect(state.restDuration).toBe(45);
    });

    it('resets to defaults', () => {
      const store = useSettingsStore.getState();
      store.updateSetting('workDuration', 300);
      store.updateSetting('restDuration', 120);

      store.resetToDefaults();

      const state = useSettingsStore.getState();
      expect(state.workDuration).toBe(180);
      expect(state.restDuration).toBe(60);
    });
  });
});

