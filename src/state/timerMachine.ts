import { create } from 'zustand';
import { MonotonicTimer, DriftCorrectingScheduler, formatTime, getRoundInfo } from '../utils/time';
import { TimerState, LightColor, CueType } from '../types';
import { Platform } from 'react-native';
import { AppState, AppStateStatus } from 'react-native';

interface TimerStore {
  // State
  state: TimerState;
  currentRound: number;
  totalRounds: number | null; // null means infinite
  elapsedSeconds: number;
  totalSeconds: number; // total seconds in current interval
  isPaused: boolean;
  pausedElapsedSeconds: number; // saved elapsed time when paused

  // Timing tracking (for accurate pause/resume)
  startEpoch: number | null; // performance.now() when timer started
  pauseStartTime: number | null; // performance.now() when paused
  totalPausedTime: number; // cumulative paused time in ms

  // Config (can be updated before starting)
  workDuration: number; // seconds - Green phase duration
  restDuration: number; // seconds - Red phase duration
  yellowDuration: number; // seconds - Yellow phase duration
  warmupDuration: number; // seconds
  countdownEnabled: boolean;
  countdownDuration: number; // 3 seconds for countdown

  // Internal
  monotonic: MonotonicTimer | null;
  scheduler: DriftCorrectingScheduler | null;
  onStateChange: ((state: TimerState) => void) | null;
  onAudioCue: ((cue: CueType) => void) | null;

  // Configuration actions
  setConfig: (config: Partial<Pick<TimerStore, 'workDuration' | 'restDuration' | 'yellowDuration' | 'warmupDuration' | 'totalRounds' | 'countdownEnabled'>>) => void;

  // Timer actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
  skip: () => void;

  // Subscriptions
  onStateChangeSubscribe: (callback: (state: TimerState) => void) => void;
  onAudioCueSubscribe: (callback: (cue: CueType) => void) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => {
  let currentMonotonic: MonotonicTimer | null = null;
  let currentScheduler: DriftCorrectingScheduler | null = null;
  let visibilityHandler: (() => void) | null = null;
  let appStateSubscription: { remove: () => void } | null = null;

  /**
   * Calculate elapsed time accurately accounting for pauses
   */
  const calculateElapsed = (): number => {
    const state = get();
    if (!state.startEpoch) return 0;

    const now = performance.now();
    let pausedTime = state.totalPausedTime;

    // If currently paused, add the current pause duration
    if (state.isPaused && state.pauseStartTime) {
      pausedTime += now - state.pauseStartTime;
    }

    const elapsedMs = now - state.startEpoch - pausedTime;
    return Math.max(0, elapsedMs / 1000);
  };

  /**
   * Handle visibility/app state changes to recalculate elapsed time
   */
  const handleVisibilityChange = () => {
    const state = get();
    if (state.state === 'idle' || state.state === 'complete' || state.isPaused) {
      return;
    }

    // Recalculate elapsed time to account for any time that passed while backgrounded
    // This ensures accuracy when the app/tab comes back to foreground
    const elapsed = calculateElapsed();
    set({ elapsedSeconds: Math.floor(elapsed) });
  };

  /**
   * Setup visibility change listeners
   */
  const setupVisibilityListeners = () => {
    // Clean up existing listeners
    if (visibilityHandler) {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
      visibilityHandler = null;
    }

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }

    // Web: use document.visibilitychange
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      visibilityHandler = handleVisibilityChange;
      document.addEventListener('visibilitychange', visibilityHandler);
    }

    // React Native: use AppState
    if (Platform.OS !== 'web') {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          handleVisibilityChange();
        }
      };

      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }
  };

  /**
   * Clean up visibility listeners
   */
  const cleanupVisibilityListeners = () => {
    if (visibilityHandler) {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
      visibilityHandler = null;
    }

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  };

  return {
    // State
    state: 'idle',
    currentRound: 1,
    totalRounds: null,
    elapsedSeconds: 0,
    totalSeconds: 180, // 3 minutes work by default
    isPaused: false,
    pausedElapsedSeconds: 0,
    startEpoch: null,
    pauseStartTime: null,
    totalPausedTime: 0,

    // Config
    workDuration: 180, // 3 minutes - Green phase
    restDuration: 60, // 1 minute - Red phase
    yellowDuration: 10, // 10 seconds - Yellow phase
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

      // Initialize monotonic timer (for display updates)
      currentMonotonic = new MonotonicTimer();

      const now = performance.now();

      // Reset elapsed time
      set({
        elapsedSeconds: 0,
        pausedElapsedSeconds: 0,
        isPaused: false,
        currentRound: 1,
        startEpoch: now,
        pauseStartTime: null,
        totalPausedTime: 0,
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

      // Setup visibility listeners for accurate timing when backgrounded
      setupVisibilityListeners();

      currentScheduler.start(() => {
        const store = get();
        if (store.isPaused || store.state === 'idle' || store.state === 'complete') {
          return;
        }

        // Calculate elapsed from epoch accounting for pauses
        const elapsed = calculateElapsed();

        // Check if we've exceeded the current interval
        if (elapsed >= store.totalSeconds) {
          // Transition to next state
          transitionToNextState(store);
        } else {
          // Update elapsed time
          set({ elapsedSeconds: Math.floor(elapsed) });
        }
      });
    },

    pause: () => {
      const state = get();
      if (state.state === 'idle' || state.state === 'complete') return;

      if (currentScheduler) {
        currentScheduler.stop();
      }

      const now = performance.now();
      const elapsed = calculateElapsed();

      set({
        isPaused: true,
        pausedElapsedSeconds: Math.floor(elapsed),
        pauseStartTime: now,
      });
    },

    resume: () => {
      const state = get();
      if (!state.isPaused || !state.pauseStartTime || !state.startEpoch) return;

      const now = performance.now();
      // Add the current pause duration to total paused time
      const pauseDuration = now - state.pauseStartTime;
      const newTotalPausedTime = state.totalPausedTime + pauseDuration;

      set({
        isPaused: false,
        pauseStartTime: null,
        totalPausedTime: newTotalPausedTime,
      });

      // Restart scheduler
      if (currentScheduler) {
        currentScheduler.stop();
      }

      currentScheduler = new DriftCorrectingScheduler();
      set({ scheduler: currentScheduler });

      // Setup visibility listeners for accurate timing when backgrounded
      setupVisibilityListeners();

      currentScheduler.start(() => {
        const store = get();
        if (store.isPaused || store.state === 'idle' || store.state === 'complete') {
          return;
        }

        // Calculate elapsed from epoch accounting for pauses
        const elapsed = calculateElapsed();

        if (elapsed >= store.totalSeconds) {
          transitionToNextState(store);
        } else {
          set({ elapsedSeconds: Math.floor(elapsed) });
        }
      });
    },

    skip: () => {
      const state = get();
      if (state.state === 'idle' || state.state === 'complete') return;

      // Skip current phase by transitioning to next state immediately
      transitionToNextState(state);
    },

    reset: () => {
      if (currentScheduler) {
        currentScheduler.stop();
      }
      currentMonotonic = null;
      currentScheduler = null;
      cleanupVisibilityListeners();

      set({
        state: 'idle',
        currentRound: 1,
        elapsedSeconds: 0,
        pausedElapsedSeconds: 0,
        isPaused: false,
        totalSeconds: 180,
        startEpoch: null,
        pauseStartTime: null,
        totalPausedTime: 0,
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
      cleanupVisibilityListeners();

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
  const { state, currentRound, totalRounds, workDuration, restDuration, yellowDuration, onStateChange, onAudioCue } = store;

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
      nextState = 'yellow';
      nextTotalSeconds = yellowDuration;
      onAudioCue?.('transition');
      break;

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

  // Reset timing for the new phase
  const now = performance.now();
  useTimerStore.setState({
    state: nextState,
    totalSeconds: nextTotalSeconds,
    elapsedSeconds: 0,
    currentRound: nextRound,
    startEpoch: now,
    pauseStartTime: null,
    totalPausedTime: 0,
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
    lightColor: getLightColor(state.state),
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
  useTimerStore((state) => getLightColor(state.state));
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
    skip: state.skip,
    onStateChangeSubscribe: state.onStateChangeSubscribe,
    onAudioCueSubscribe: state.onAudioCueSubscribe,
  }));

/**
 * Determine which light should be on based on current state
 * Lights are purely state-driven - each phase has exactly one light
 * Phase order: work (green) → yellow → rest (red) → work (repeat)
 */
export function getLightColor(state: TimerState): LightColor {
  switch (state) {
    case 'idle':
    case 'complete':
    case 'countdown':
      return 'off';
    
    case 'warmup':
    case 'work':
      return 'green';
    
    case 'yellow':
      return 'yellow';
    
    case 'rest':
      return 'red';
    
    default:
      return 'off';
  }
}
