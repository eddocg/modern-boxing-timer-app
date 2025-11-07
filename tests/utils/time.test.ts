import { describe, it, expect } from 'vitest';
import { formatTime, getRoundInfo, MonotonicTimer, DriftCorrectingScheduler } from '@utils/time';

describe('Time Utilities', () => {
  describe('formatTime', () => {
    it('formats 0 seconds as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('formats seconds as mm:ss', () => {
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(180)).toBe('03:00');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('pads with zeros', () => {
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
    });
  });

  describe('getRoundInfo', () => {
    it('formats round info as "XX/YY"', () => {
      expect(getRoundInfo(1, 12)).toBe('01/12');
      expect(getRoundInfo(5, 12)).toBe('05/12');
      expect(getRoundInfo(12, 12)).toBe('12/12');
    });

    it('formats infinite rounds as "XX/∞"', () => {
      expect(getRoundInfo(1, null)).toBe('01/∞');
      expect(getRoundInfo(5, null)).toBe('05/∞');
    });

    it('pads round numbers with zeros', () => {
      expect(getRoundInfo(1, 12)).toBe('01/12');
      expect(getRoundInfo(9, 3)).toBe('09/03');
    });
  });

  describe('MonotonicTimer', () => {
    it('initializes with start time', () => {
      const timer = new MonotonicTimer();
      expect(timer.getElapsedSeconds()).toBeGreaterThanOrEqual(0);
    });

    it('increases elapsed time monotonically', async () => {
      const timer = new MonotonicTimer();
      const elapsed1 = timer.getElapsedSeconds();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const elapsed2 = timer.getElapsedSeconds();
      expect(elapsed2).toBeGreaterThan(elapsed1);
    });

    it('resets timer', () => {
      const timer = new MonotonicTimer();
      const elapsed1 = timer.getElapsedSeconds();

      timer.reset();
      const elapsed2 = timer.getElapsedSeconds();

      expect(elapsed2).toBeLessThan(elapsed1 + 0.1); // Should be close to 0
    });
  });

  describe('DriftCorrectingScheduler', () => {
    it('calls callback on start', async () => {
      const scheduler = new DriftCorrectingScheduler();
      let callCount = 0;

      scheduler.start(() => {
        callCount++;
      });

      // Wait for at least one callback (setInterval fires after ~1s)
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      expect(callCount).toBeGreaterThanOrEqual(1);
      scheduler.stop();
    });

    it('stops scheduler', async () => {
      const scheduler = new DriftCorrectingScheduler();

      scheduler.start(() => {});

      // Verify it's running
      expect(scheduler.isRunning()).toBe(true);

      scheduler.stop();

      // Wait a bit to ensure stop took effect
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(scheduler.isRunning()).toBe(false);
    });

    it('reports running state correctly', () => {
      const scheduler = new DriftCorrectingScheduler();
      expect(scheduler.isRunning()).toBe(false);

      scheduler.start(() => {});
      expect(scheduler.isRunning()).toBe(true);

      scheduler.stop();
      expect(scheduler.isRunning()).toBe(false);
    });
  });
});
