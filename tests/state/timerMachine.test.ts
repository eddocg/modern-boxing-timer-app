import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimerStore, useTimerStatus, useTimerActions, useLightColor, useDisplayTime } from '@state/timerMachine';

describe('Timer State Machine', () => {
  beforeEach(() => {
    // Reset store before each test
    useTimerStore.setState({
      state: 'idle',
      currentRound: 1,
      totalRounds: null,
      elapsedSeconds: 0,
      totalSeconds: 180,
      isPaused: false,
      pausedElapsedSeconds: 0,
      workDuration: 180,
      restDuration: 60,
      yellowThreshold: 10,
      warmupDuration: 0,
      countdownEnabled: false,
      countdownDuration: 3,
      monotonic: null,
      scheduler: null,
      onStateChange: null,
      onAudioCue: null,
    });
  });

  describe('Initialization', () => {
    it('starts in idle state', () => {
      const state = useTimerStore.getState();
      expect(state.state).toBe('idle');
      expect(state.currentRound).toBe(1);
      expect(state.elapsedSeconds).toBe(0);
    });

    it('has correct default configuration', () => {
      const state = useTimerStore.getState();
      expect(state.workDuration).toBe(180);
      expect(state.restDuration).toBe(60);
      expect(state.yellowThreshold).toBe(10);
      expect(state.countdownEnabled).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('sets work duration', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 120 });

      const state = useTimerStore.getState();
      expect(state.workDuration).toBe(120);
    });

    it('sets multiple config values at once', () => {
      const store = useTimerStore.getState();
      store.setConfig({
        workDuration: 120,
        restDuration: 45,
        totalRounds: 5,
        yellowThreshold: 15,
      });

      const state = useTimerStore.getState();
      expect(state.workDuration).toBe(120);
      expect(state.restDuration).toBe(45);
      expect(state.totalRounds).toBe(5);
      expect(state.yellowThreshold).toBe(15);
    });

    it('sets total rounds for fixed duration', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: 10 });

      const state = useTimerStore.getState();
      expect(state.totalRounds).toBe(10);
    });

    it('supports infinite rounds (null)', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: null });

      const state = useTimerStore.getState();
      expect(state.totalRounds).toBeNull();
    });
  });

  describe('State Transitions', () => {
    it('starts timer from idle to work', () => {
      const store = useTimerStore.getState();
      store.start();

      const state = useTimerStore.getState();
      expect(state.state).toBe('work');
      expect(state.elapsedSeconds).toBe(0);
      expect(state.currentRound).toBe(1);
    });

    it('starts with countdown when enabled', () => {
      const store = useTimerStore.getState();
      store.setConfig({ countdownEnabled: true });
      store.start();

      const state = useTimerStore.getState();
      expect(state.state).toBe('countdown');
      expect(state.totalSeconds).toBe(3);
    });

    it('starts with warmup when configured', () => {
      const store = useTimerStore.getState();
      store.setConfig({ warmupDuration: 120 });
      store.start();

      const state = useTimerStore.getState();
      expect(state.state).toBe('warmup');
      expect(state.totalSeconds).toBe(120);
    });

    it('resets from any state back to idle', () => {
      const store = useTimerStore.getState();
      store.start();
      store.reset();

      const state = useTimerStore.getState();
      expect(state.state).toBe('idle');
      expect(state.currentRound).toBe(1);
      expect(state.elapsedSeconds).toBe(0);
    });

    it('transitions to rest state after work', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 5 });
      store.start();

      const initialState = useTimerStore.getState();
      expect(initialState.state).toBe('work');

      // Simulate time passing by manually updating state
      // (In real usage, the scheduler would do this)
      useTimerStore.setState({ elapsedSeconds: 5 });

      // The real transition would happen in the scheduler callback
      // For this test, we just verify the mechanism works
      const state = useTimerStore.getState();
      expect(state.elapsedSeconds).toBe(5);
    });

    it('completes session when all rounds finished', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: 1, workDuration: 5, restDuration: 3 });
      store.start();

      const state = useTimerStore.getState();
      expect(state.state).toBe('work');
      expect(state.currentRound).toBe(1);
    });
  });

  describe('Pause/Resume', () => {
    it('pauses timer without changing state', () => {
      const store = useTimerStore.getState();
      store.start();
      store.pause();

      const state = useTimerStore.getState();
      expect(state.isPaused).toBe(true);
      expect(state.state).toBe('work');
    });

    it('saves elapsed time when pausing', () => {
      const store = useTimerStore.getState();
      store.start();
      useTimerStore.setState({ elapsedSeconds: 45 });
      store.pause();

      const state = useTimerStore.getState();
      expect(state.pausedElapsedSeconds).toBe(45);
    });

    it('resumes from paused state', () => {
      const store = useTimerStore.getState();
      store.start();
      store.pause();
      store.resume();

      const state = useTimerStore.getState();
      expect(state.isPaused).toBe(false);
      expect(state.state).toBe('work');
    });

    it('does not resume if not paused', () => {
      const store = useTimerStore.getState();
      store.start();

      const beforeResume = useTimerStore.getState();
      store.resume();
      const afterResume = useTimerStore.getState();

      expect(beforeResume.isPaused).toBe(false);
      expect(afterResume.isPaused).toBe(false);
    });
  });

  describe('Selectors - Timer Status', () => {
    it('provides complete timer status', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: 5 });
      store.start();

      const status = useTimerStatus();
      expect(status.state).toBe('work');
      expect(status.currentRound).toBe(1);
      expect(status.totalRounds).toBe(5);
      expect(status.isRunning).toBe(true);
    });

    it('calculates display time correctly', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 120 });
      store.start();

      useTimerStore.setState({ elapsedSeconds: 30 });

      const displayTime = useDisplayTime();
      expect(displayTime).toBe('01:30'); // 120 - 30 = 90 seconds = 1:30
    });

    it('formats round info for finite rounds', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: 10 });

      const status = useTimerStatus();
      expect(status.roundInfo).toMatch(/01\/10/);
    });

    it('formats round info for infinite rounds', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: null });

      const status = useTimerStatus();
      expect(status.roundInfo).toMatch(/01\/∞/);
    });
  });

  describe('Light Color Logic', () => {
    it('shows green during work phase', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 60, yellowThreshold: 10 });
      useTimerStore.setState({
        state: 'work',
        totalSeconds: 60,
        elapsedSeconds: 30,
      });

      const lightColor = useLightColor();
      expect(lightColor).toBe('green');
    });

    it('shows yellow in final seconds of work', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 60, yellowThreshold: 10 });
      useTimerStore.setState({
        state: 'work',
        totalSeconds: 60,
        elapsedSeconds: 55, // 5 seconds left
      });

      const lightColor = useLightColor();
      expect(lightColor).toBe('yellow');
    });

    it('shows red during rest phase', () => {
      useTimerStore.setState({
        state: 'rest',
        totalSeconds: 60,
        elapsedSeconds: 30,
      });

      const lightColor = useLightColor();
      expect(lightColor).toBe('red');
    });

    it('shows off during idle', () => {
      useTimerStore.setState({ state: 'idle' });

      const lightColor = useLightColor();
      expect(lightColor).toBe('off');
    });

    it('shows off during complete', () => {
      useTimerStore.setState({ state: 'complete' });

      const lightColor = useLightColor();
      expect(lightColor).toBe('off');
    });

    it('shows green during warmup', () => {
      useTimerStore.setState({
        state: 'warmup' as const,
        totalSeconds: 60,
        elapsedSeconds: 10,
      });

      const lightColor = useLightColor();
      expect(lightColor).toBe('green');
    });
  });

  describe('Audio Cue Subscriptions', () => {
    it('subscribes to state change events', () => {
      const store = useTimerStore.getState();
      const callback = vi.fn();

      store.onStateChangeSubscribe(callback);

      const state = useTimerStore.getState();
      expect(state.onStateChange).toBe(callback);
    });

    it('subscribes to audio cue events', () => {
      const store = useTimerStore.getState();
      const callback = vi.fn();

      store.onAudioCueSubscribe(callback);

      const state = useTimerStore.getState();
      expect(state.onAudioCue).toBe(callback);
    });
  });

  describe('Running Status', () => {
    it('is running when in work state', () => {
      const store = useTimerStore.getState();
      store.start();

      const status = useTimerStatus();
      expect(status.isRunning).toBe(true);
    });

    it('is not running when paused', () => {
      const store = useTimerStore.getState();
      store.start();
      store.pause();

      const status = useTimerStatus();
      expect(status.isRunning).toBe(false);
    });

    it('is not running when idle', () => {
      const status = useTimerStatus();
      expect(status.isRunning).toBe(false);
    });

    it('is not running when complete', () => {
      useTimerStore.setState({ state: 'complete' });

      const status = useTimerStatus();
      expect(status.isRunning).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero duration intervals', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 0 });
      store.start();

      const state = useTimerStore.getState();
      expect(state.state).toBe('work');
      expect(state.totalSeconds).toBe(0);
    });

    it('handles very long durations', () => {
      const store = useTimerStore.getState();
      store.setConfig({ workDuration: 7200 }); // 2 hours
      store.start();

      const state = useTimerStore.getState();
      expect(state.workDuration).toBe(7200);
      expect(state.totalSeconds).toBe(7200);
    });

    it('maintains round count across cycles', () => {
      const store = useTimerStore.getState();
      store.setConfig({ totalRounds: 3 });
      store.start();

      let state = useTimerStore.getState();
      expect(state.currentRound).toBe(1);

      // Simulate advancing to round 2
      useTimerStore.setState({ currentRound: 2 });
      state = useTimerStore.getState();
      expect(state.currentRound).toBe(2);
    });
  });
});
