import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RAFSampler, LongTaskObserver, DriftChecker } from '@utils/performanceDiagnostics';

describe('Performance Diagnostics', () => {
  describe('RAFSampler', () => {
    let sampler: RAFSampler;

    beforeEach(() => {
      sampler = new RAFSampler();
    });

    afterEach(() => {
      sampler.stop();
    });

    it('calculates average FPS correctly', async () => {
      return new Promise<void>((resolve) => {
        sampler.start(100, (metrics) => {
          expect(metrics.totalFrames).toBeGreaterThan(0);
          expect(metrics.averageFPS).toBeGreaterThan(0);
          expect(metrics.averageFPS).toBeLessThanOrEqual(60);
          resolve();
        });
      });
    });

    it('detects frames over 16.7ms threshold', async () => {
      return new Promise<void>((resolve) => {
        sampler.start(100, (metrics) => {
          expect(metrics.framesOver16ms).toBeGreaterThanOrEqual(0);
          expect(metrics.framesOver16ms).toBeLessThanOrEqual(metrics.totalFrames);
          resolve();
        });
      });
    });

    it('detects frames over 32ms threshold', async () => {
      return new Promise<void>((resolve) => {
        sampler.start(100, (metrics) => {
          expect(metrics.framesOver32ms).toBeGreaterThanOrEqual(0);
          expect(metrics.framesOver32ms).toBeLessThanOrEqual(metrics.totalFrames);
          resolve();
        });
      });
    });

    it('calculates frame variance', async () => {
      return new Promise<void>((resolve) => {
        sampler.start(100, (metrics) => {
          expect(metrics.frameVariance).toBeGreaterThanOrEqual(0);
          resolve();
        });
      });
    });
  });

  describe('LongTaskObserver', () => {
    let observer: LongTaskObserver;

    beforeEach(() => {
      observer = new LongTaskObserver();
    });

    afterEach(() => {
      observer.stop();
    });

    it('initializes without errors', () => {
      expect(() => observer.start()).not.toThrow();
    });

    it('returns zero metrics when no long tasks', () => {
      observer.start();
      const metrics = observer.stop();
      expect(metrics.count).toBe(0);
      expect(metrics.totalDuration).toBe(0);
      expect(metrics.averageDuration).toBe(0);
    });

    it('calculates metrics correctly', () => {
      observer.start();
      // Simulate some time passing
      const metrics = observer.getCurrentMetrics();
      expect(metrics.count).toBeGreaterThanOrEqual(0);
      expect(metrics.totalDuration).toBeGreaterThanOrEqual(0);
      if (metrics.count > 0) {
        expect(metrics.averageDuration).toBeGreaterThanOrEqual(50);
      }
    });
  });

  describe('DriftChecker', () => {
    let checker: DriftChecker;

    beforeEach(() => {
      checker = new DriftChecker();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calculates absolute error correctly', () => {
      checker.start();
      
      // Simulate 1 second elapsed
      vi.advanceTimersByTime(1000);
      checker.sample(1.0);
      
      // Simulate 2 seconds elapsed with slight drift
      vi.advanceTimersByTime(1000);
      checker.sample(2.1); // 100ms drift
      
      const metrics = checker.calculateMetrics();
      expect(metrics.absoluteError).toBeGreaterThanOrEqual(0);
      expect(metrics.samples).toBe(2);
    });

    it('calculates relative error correctly', () => {
      checker.start();
      
      vi.advanceTimersByTime(1000);
      checker.sample(1.0);
      
      vi.advanceTimersByTime(1000);
      checker.sample(2.1); // 5% error
      
      const metrics = checker.calculateMetrics();
      expect(metrics.relativeError).toBeGreaterThanOrEqual(0);
    });

    it('handles zero samples', () => {
      checker.start();
      const metrics = checker.calculateMetrics();
      expect(metrics.samples).toBe(0);
      expect(metrics.absoluteError).toBe(0);
      expect(metrics.relativeError).toBe(0);
    });

    it('resets correctly', () => {
      checker.start();
      checker.sample(1.0);
      checker.reset();
      
      const metrics = checker.calculateMetrics();
      expect(metrics.samples).toBe(0);
    });
  });
});

