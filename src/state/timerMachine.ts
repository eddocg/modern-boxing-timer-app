import { create } from 'zustand';
import { MonotonicTimer, DriftCorrectingScheduler, formatTime, getRoundInfo } from '../utils/time';
import { TimerState, LightColor, CueType } from '../types';

interface TimerStore {
  // State
  state: TimerState;
  currentRound: number;
  totalRounds: number | null; // null means infinite
  elapsedSeconds: number;
  totalSeconds: number; // total seconds in current interval
  isPaused: boolean;
  pausedElapsedSeconds: number; // saved elapsed time when paused

  // Config (can be updated before starting)
  workDuration: number; // seconds
  restDuration: number; // seconds
  yellowThreshold: number; // seconds before work ends
  warmupDuration: number; // seconds
  countdownEnabled: boolean;
  countdownDuration: number; // 3 seconds for countdown

  // Internal
  monotonic: MonotonicTimer | null;
  scheduler: DriftCorrectingScheduler | null;
  onStateChange: ((state: TimerState) => void) | null;
  onAudioCue: ((cue: CueType) => void) | null;

  // Configuration actions
  setConfig: (config: Partial<Pick<TimerStore, 'workDuration' | 'restDuration' | 'yellowThreshold' | 'warmupDuration' | 'totalRounds' | 'countdownEnabled'>>) => void;

  // Timer actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;

  // Subscriptions
  onStateChangeSubscribe: (callback: (state: TimerState) => void) => void;
  onAudioCueSubscribe: (callback: (cue: CueType) => void) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => {
  let currentMonotonic: MonotonicTimer | null = null;
  let currentScheduler: DriftCorrectingScheduler | null = null;

  return {
    // State
    state: 'idle',
    currentRound: 1,
    totalRounds: null,
    elapsedSeconds: 0,
    totalSeconds: 180, // 3 minutes work by default
    isPaused: false,
    pausedElapsedSeconds: 0,

    // Config
    workDuration: 180, // 3 minutes
    restDuration: 60, // 1 minute
    yellowThreshold: 10, // 10 seconds
    warmupDuration: 0,
    countdownEnabled: false,
    countdownDuration: 3,

    // Internal
    monotonic: null,
    scheduler: null,
    onStateChange: null,
    onAudioCue: null,

    // Configuration
    setConfig: (config) =>
      set((state) => ({
        ...state,
        ...config,
      })),

    // Timer logic
    start: () => {
      const state = get();

      // Stop any existing scheduler
      if (currentScheduler) {
        currentScheduler.stop();
      }

      // Initialize monotonic timer
      currentMonotonic = new MonotonicTimer();

      // Reset elapsed time
      set({
        elapsedSeconds: 0,
        pausedElapsedSeconds: 0,
        isPaused: false,
        currentRound: 1,
      });

      // Determine initial state
      const nextState = state.countdownEnabled ? 'countdown' : (state.warmupDuration > 0 ? 'warmup' : 'work');
      const nextTotalSeconds =
        nextState === 'countdown' ? state.countdownDuration : nextState === 'warmup' ? state.warmupDuration : state.workDuration;

      set({
        state: nextState as TimerState,
        totalSeconds: nextTotalSeconds,
        monotonic: currentMonotonic,
      });

      state.onStateChange?.(nextState as TimerState);

      // Emit audio cue
      if (nextState === 'work' || nextState === 'warmup') {
        state.onAudioCue?.('start');
      }

      // Start scheduler for 1 Hz ticks
      currentScheduler = new DriftCorrectingScheduler();
      set({ scheduler: currentScheduler });

      currentScheduler.start(() => {
        const store = get();
        if (store.isPaused || store.state === 'idle' || store.state === 'complete') {
          return;
        }

        // Calculate elapsed from monotonic timer
        if (!currentMonotonic) return;
        const elapsed = currentMonotonic.getElapsedSeconds();

        // Check if we've exceeded the current interval
        if (elapsed >= store.totalSeconds) {
          // Transition to next state
          transitionToNextState(store);
        } else {
          // Update elapsed and check for yellow phase
          set({ elapsedSeconds: Math.floor(elapsed) });

          // If in work state and approaching yellow threshold, switch to yellow
          if (store.state === 'work') {
            const secondsLeft = store.totalSeconds - Math.floor(elapsed);
            if (secondsLeft <= store.yellowThreshold && store.state === 'work') {
              set({ state: 'yellow' });
              store.onStateChange?.('yellow');
            }
          }

          // Emit beep during yellow phase
          if (store.state === 'yellow') {
            store.onAudioCue?.('beep');
          }
        }
      });
    },

    pause: () => {
      const state = get();
      if (state.state === 'idle' || state.state === 'complete') return;

      if (currentScheduler) {
        currentScheduler.stop();
      }

      set({
        isPaused: true,
        pausedElapsedSeconds: state.elapsedSeconds,
      });
    },

    resume: () => {
      const state = get();
      if (!state.isPaused) return;

      // Reinitialize monotonic timer with offset
      currentMonotonic = new MonotonicTimer();
      // Adjust so elapsed starts from pausedElapsedSeconds
      const adjustedStart = currentMonotonic.getElapsedSeconds();
      const timeOffset = state.pausedElapsedSeconds - adjustedStart;

      set({
        isPaused: false,
        monotonic: currentMonotonic,
      });

      // Restart scheduler
      if (currentScheduler) {
        currentScheduler.stop();
      }

      currentScheduler = new DriftCorrectingScheduler();
      set({ scheduler: currentScheduler });

      currentScheduler.start(() => {
        const store = get();
        if (store.isPaused || store.state === 'idle' || store.state === 'complete') {
          return;
        }

        if (!currentMonotonic) return;
        const elapsed = currentMonotonic.getElapsedSeconds() + timeOffset;

        if (elapsed >= store.totalSeconds) {
          transitionToNextState(store);
        } else {
          set({ elapsedSeconds: Math.floor(elapsed) });

          if (store.state === 'work') {
            const secondsLeft = store.totalSeconds - Math.floor(elapsed);
            if (secondsLeft <= store.yellowThreshold && store.state === 'work') {
              set({ state: 'yellow' });
              store.onStateChange?.('yellow');
            }
          }

          if (store.state === 'yellow') {
            store.onAudioCue?.('beep');
          }
        }
      });
    },

    reset: () => {
      if (currentScheduler) {
        currentScheduler.stop();
      }
      currentMonotonic = null;
      currentScheduler = null;

      set({
        state: 'idle',
        currentRound: 1,
        elapsedSeconds: 0,
        pausedElapsedSeconds: 0,
        isPaused: false,
        totalSeconds: 180,
        monotonic: null,
        scheduler: null,
      });
    },

    stop: () => {
      if (currentScheduler) {
        currentScheduler.stop();
      }
      currentMonotonic = null;
      currentScheduler = null;

      set({
        state: 'complete',
        monotonic: null,
        scheduler: null,
      });
    },

    onStateChangeSubscribe: (callback) => set({ onStateChange: callback }),
    onAudioCueSubscribe: (callback) => set({ onAudioCue: callback }),
  };
});

/**
 * Helper function to handle state transitions
 */
function transitionToNextState(store: ReturnType<typeof useTimerStore.getState>) {
  const { state, currentRound, totalRounds, workDuration, restDuration, onStateChange, onAudioCue } = store;

  let nextState: TimerState;
  let nextTotalSeconds: number;
  let nextRound = currentRound;

  switch (state) {
    case 'countdown':
      nextState = store.warmupDuration > 0 ? 'warmup' : 'work';
      nextTotalSeconds = nextState === 'warmup' ? store.warmupDuration : workDuration;
      onAudioCue?.('start');
      break;

    case 'warmup':
      nextState = 'work';
      nextTotalSeconds = workDuration;
      onAudioCue?.('start');
      break;

    case 'work':
    case 'yellow':
      nextState = 'rest';
      nextTotalSeconds = restDuration;
      onAudioCue?.('transition');
      break;

    case 'rest':
      // Check if we've completed all rounds
      if (totalRounds !== null && currentRound >= totalRounds) {
        nextState = 'complete';
        nextTotalSeconds = 0;
        onAudioCue?.('horn');
      } else {
        nextState = 'work';
        nextTotalSeconds = workDuration;
        nextRound = currentRound + 1;
        onAudioCue?.('start');
      }
      break;

    default:
      nextState = 'idle';
      nextTotalSeconds = 0;
  }

  useTimerStore.setState({
    state: nextState,
    totalSeconds: nextTotalSeconds,
    elapsedSeconds: 0,
    currentRound: nextRound,
  });

  onStateChange?.(nextState);
}

// ============================================
// Selectors - memoized hooks for components
// ============================================

export const useTimerStatus = () =>
  useTimerStore((state) => ({
    state: state.state,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    elapsedSeconds: state.elapsedSeconds,
    totalSeconds: state.totalSeconds,
    displayTime: formatTime(state.totalSeconds - state.elapsedSeconds),
    roundInfo: getRoundInfo(state.currentRound, state.totalRounds),
    lightColor: getLightColor(state.state, state.totalSeconds, state.elapsedSeconds, state.yellowThreshold),
    isRunning: state.state !== 'idle' && state.state !== 'complete' && !state.isPaused,
  }));

export const useTimerState = () => useTimerStore((state) => state.state);
export const useCurrentRound = () => useTimerStore((state) => state.currentRound);
export const useElapsedSeconds = () => useTimerStore((state) => state.elapsedSeconds);
export const useTotalSeconds = () => useTimerStore((state) => state.totalSeconds);
export const useDisplayTime = () =>
  useTimerStore((state) => formatTime(state.totalSeconds - state.elapsedSeconds));
export const useRoundInfo = () =>
  useTimerStore((state) => getRoundInfo(state.currentRound, state.totalRounds));
export const useLightColor = () =>
  useTimerStore((state) =>
    getLightColor(state.state, state.totalSeconds, state.elapsedSeconds, state.yellowThreshold)
  );
export const useIsRunning = () =>
  useTimerStore((state) => state.state !== 'idle' && state.state !== 'complete' && !state.isPaused);
export const useIsPaused = () => useTimerStore((state) => state.isPaused);

export const useTimerActions = () =>
  useTimerStore((state) => ({
    start: state.start,
    pause: state.pause,
    resume: state.resume,
    reset: state.reset,
    stop: state.stop,
    setConfig: state.setConfig,
    onStateChangeSubscribe: state.onStateChangeSubscribe,
    onAudioCueSubscribe: state.onAudioCueSubscribe,
  }));

/**
 * Determine which light should be on based on current state
 */
function getLightColor(state: TimerState, totalSeconds: number, elapsed: number, yellowThreshold: number): LightColor {
  switch (state) {
    case 'idle':
    case 'complete':
    case 'countdown':
      return 'off';
    case 'warmup':
      return 'green';
    case 'yellow':
      return 'yellow';
    case 'work': {
      const remaining = totalSeconds - elapsed;
      if (remaining <= yellowThreshold) {
        return 'yellow';
      }
      return 'green';
    }
    case 'rest':
      return 'red';
  }
}
