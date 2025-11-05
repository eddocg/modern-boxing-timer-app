/**
 * Audio system for Boxing Timer
 * Preloads all audio assets and manages playback
 */

import { Audio } from 'expo-av';
import type { CueType } from '../types';

export class AudioManager {
  private soundInstances: Map<CueType, Audio.Sound> = new Map();
  private volume: number = 0.8;
  private isInitialized: boolean = false;

  /**
   * Initialize and preload all audio assets
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      // Preload audio assets
      // Assets will be added in Phase 1
      console.log('Audio manager initialized');

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Preload a specific sound asset
   */
  async preloadSound(cueType: CueType, uri: string): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.setVolumeAsync(this.volume);
      this.soundInstances.set(cueType, sound);
      console.log(`Preloaded sound: ${cueType}`);
    } catch (error) {
      console.error(`Failed to preload sound ${cueType}:`, error);
    }
  }

  /**
   * Play a cue with low latency
   */
  async playCue(cueType: CueType): Promise<void> {
    try {
      const sound = this.soundInstances.get(cueType);
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error(`Failed to play cue ${cueType}:`, error);
    }
  }

  /**
   * Set volume for all sounds (0-1)
   */
  async setVolume(newVolume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, newVolume));

    for (const sound of this.soundInstances.values()) {
      await sound.setVolumeAsync(this.volume);
    }
  }

  /**
   * Clean up and unload all sounds
   */
  async cleanup(): Promise<void> {
    for (const sound of this.soundInstances.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
    this.soundInstances.clear();
    this.isInitialized = false;
  }

  /**
   * Check if audio manager is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}
