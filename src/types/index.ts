export type TimerState = 'idle' | 'countdown' | 'warmup' | 'work' | 'yellow' | 'rest' | 'complete';
export type LightColor = 'red' | 'yellow' | 'green' | 'off';
export type SoundPack = 'boxing-bell' | 'mma-horn' | 'beep';
export type CueType = 'start' | 'beep' | 'transition' | 'horn';

export interface TimerConfig {
  rounds: number | null; // null means infinite
  workDuration: number; // seconds
  restDuration: number; // seconds
  yellowThreshold: number; // seconds before work ends
  warmup: number; // seconds
  soundPack: SoundPack;
  volume: number; // 0-1
  vibrationEnabled: boolean;
  countdownEnabled: boolean;
}

export interface TimerStatus {
  state: TimerState;
  currentRound: number;
  totalRounds: number | null;
  elapsedSeconds: number;
  totalSeconds: number;
  displayTime: string;
  roundInfo: string;
  lightColor: LightColor;
  isRunning: boolean;
}

export interface AudioAsset {
  type: CueType;
  uri: string;
  duration: number; // in milliseconds
}
