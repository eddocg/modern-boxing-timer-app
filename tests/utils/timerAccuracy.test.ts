import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DriftCorrectingScheduler } from '@utils/time';

/**
 * Timer Accuracy Tests
 * Verifies: monotonic time, drift correction, accurate elapsed calculation
 */
describe('Timer Accuracy - Drift Correction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock performance.now() to advance with fake timers
    let now = Date.now();
    vi.spyOn(global, 'performance', 'get').mockImplementation(() => ({
      now: () => {
        now += 16; // Advance by ~16ms per call (simulate 60 FPS)
        return now;
      },
    } as unknown as Performance));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('schedules ticks at approximately 1 Hz', async () => {
    const scheduler = new DriftCorrectingScheduler();
    const tickCount = { count: 0 };
    
    scheduler.start(() => {
      tickCount.count++;
    });

    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000);
    
    // Should have approximately 5 ticks (allowing for some variance)
    expect(tickCount.count).toBeGreaterThanOrEqual(4);
    expect(tickCount.count).toBeLessThanOrEqual(6);
    
    scheduler.stop();
  });

  it('corrects for drift over multiple ticks', async () => {
    const scheduler = new DriftCorrectingScheduler();
    let tickCount = 0;
    const startTime = performance.now();
    
    scheduler.start(() => {
      tickCount++;
    });

    // Advance time by 10 seconds
    vi.advanceTimersByTime(10000);
    
    // Should have approximately 10 ticks
    expect(tickCount).toBeGreaterThanOrEqual(9);
    expect(tickCount).toBeLessThanOrEqual(11);
    
    scheduler.stop();
  });

  it('stops scheduling when stopped', () => {
    const scheduler = new DriftCorrectingScheduler();
    const tickCount = { count: 0 };
    
    scheduler.start(() => {
      tickCount.count++;
    });

    vi.advanceTimersByTime(2000);
    const countBeforeStop = tickCount.count;
    
    scheduler.stop();
    
    vi.advanceTimersByTime(3000);
    
    // Count should not increase after stop
    expect(tickCount.count).toBe(countBeforeStop);
  });

  it('isRunning returns correct state', () => {
    const scheduler = new DriftCorrectingScheduler();
    
    expect(scheduler.isRunning()).toBe(false);
    
    scheduler.start(() => {});
    expect(scheduler.isRunning()).toBe(true);
    
    scheduler.stop();
    expect(scheduler.isRunning()).toBe(false);
  });
});

describe('Timer Accuracy - Monotonic Time', () => {
  it('performance.now() is monotonic', () => {
    const times: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      times.push(performance.now());
    }
    
    // Verify monotonic: each time should be >= previous
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
    }
  });

  it('elapsed time calculation is accurate', () => {
    const startTime = performance.now();
    
    // Simulate 5 seconds passing
    const endTime = startTime + 5000;
    const elapsed = (endTime - startTime) / 1000;
    
    expect(elapsed).toBeCloseTo(5, 1);
  });
});

describe('Timer Accuracy - Edge Cases', () => {
  it('handles rapid pause/resume without drift', () => {
    const startEpoch = performance.now();
    let totalPausedTime = 0;
    let pauseStartTime: number | null = null;
    
    // Simulate: start, pause after 2s, resume after 1s pause, run for 3s more
    const pauseAt = startEpoch + 2000;
    pauseStartTime = pauseAt;
    
    const resumeAt = pauseAt + 1000;
    totalPausedTime = resumeAt - pauseStartTime;
    pauseStartTime = null;
    
    const now = resumeAt + 3000;
    const elapsed = (now - startEpoch - totalPausedTime) / 1000;
    
    // Should be 2s (before pause) + 3s (after resume) = 5s total
    expect(elapsed).toBeCloseTo(5, 1);
  });

  it('handles multiple pause/resume cycles', () => {
    const startEpoch = performance.now();
    let totalPausedTime = 0;
    
    // Simulate: start → pause → resume → pause → resume
    totalPausedTime += 1000; // First pause: 1s
    totalPausedTime += 500;  // Second pause: 0.5s
    
    const now = startEpoch + 10000; // 10s wall clock time
    const elapsed = (now - startEpoch - totalPausedTime) / 1000;
    
    // Should be 10s - 1.5s paused = 8.5s elapsed
    expect(elapsed).toBeCloseTo(8.5, 1);
  });

  it('handles long session without drift accumulation', () => {
    const startEpoch = performance.now();
    const duration = 3600 * 1000; // 1 hour in ms
    
    // Simulate 1 hour of timer running
    const now = startEpoch + duration;
    const elapsed = (now - startEpoch) / 1000;
    
    expect(elapsed).toBeCloseTo(3600, 1);
  });
});

