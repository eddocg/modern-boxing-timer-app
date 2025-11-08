/**
 * Performance diagnostics utilities for timer accuracy and smoothness
 */

export interface RAFMetrics {
  averageFPS: number;
  frameVariance: number;
  framesOver16ms: number;
  framesOver32ms: number;
  totalFrames: number;
}

export interface LongTaskMetrics {
  count: number;
  totalDuration: number;
  averageDuration: number;
}

export interface DriftMetrics {
  absoluteError: number; // milliseconds
  relativeError: number; // percentage
  samples: number;
}

/**
 * RAF Frame Sampler
 * Samples requestAnimationFrame intervals to measure frame rate and variance
 */
export class RAFSampler {
  private frameTimes: number[] = [];
  private startTime: number = 0;
  private sampleDuration: number = 10000; // 10 seconds
  private rafId: number | null = null;
  private onComplete: ((metrics: RAFMetrics) => void) | null = null;

  /**
   * Start sampling RAF frames for specified duration
   */
  start(durationMs: number = 10000, onComplete?: (metrics: RAFMetrics) => void): void {
    this.sampleDuration = durationMs;
    this.onComplete = onComplete || null;
    this.frameTimes = [];
    this.startTime = performance.now();

    const sample = (timestamp: number) => {
      const elapsed = timestamp - this.startTime;
      
      if (elapsed >= this.sampleDuration) {
        this.stop();
        const metrics = this.calculateMetrics();
        this.onComplete?.(metrics);
        return;
      }

      this.frameTimes.push(timestamp);
      this.rafId = requestAnimationFrame(sample);
    };

    this.rafId = requestAnimationFrame(sample);
  }

  /**
   * Stop sampling
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Calculate metrics from collected frame times
   */
  calculateMetrics(): RAFMetrics {
    if (this.frameTimes.length < 2) {
      return {
        averageFPS: 0,
        frameVariance: 0,
        framesOver16ms: 0,
        framesOver32ms: 0,
        totalFrames: 0,
      };
    }

    // Calculate frame intervals
    const intervals: number[] = [];
    for (let i = 1; i < this.frameTimes.length; i++) {
      intervals.push(this.frameTimes[i] - this.frameTimes[i - 1]);
    }

    // Calculate average FPS
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const averageFPS = 1000 / averageInterval;

    // Calculate variance
    const variance = intervals.reduce((sum, interval) => {
      const diff = interval - averageInterval;
      return sum + diff * diff;
    }, 0) / intervals.length;
    const frameVariance = Math.sqrt(variance);

    // Count frames over thresholds
    const framesOver16ms = intervals.filter(i => i > 16.7).length;
    const framesOver32ms = intervals.filter(i => i > 32).length;

    return {
      averageFPS,
      frameVariance,
      framesOver16ms,
      framesOver32ms,
      totalFrames: intervals.length,
    };
  }

  /**
   * Get current metrics without stopping
   */
  getCurrentMetrics(): RAFMetrics {
    return this.calculateMetrics();
  }
}

/**
 * Long Tasks Observer
 * Uses PerformanceObserver to detect tasks >50ms
 */
export class LongTaskObserver {
  private observer: PerformanceObserver | null = null;
  private longTasks: PerformanceEntry[] = [];
  private onTask?: (entry: PerformanceEntry) => void;

  /**
   * Start observing long tasks
   */
  start(onTask?: (entry: PerformanceEntry) => void): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }

    this.onTask = onTask;
    this.longTasks = [];

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTasks.push(entry);
          this.onTask?.(entry);
        }
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observation not supported:', error);
    }
  }

  /**
   * Stop observing and return metrics
   */
  stop(): LongTaskMetrics {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.longTasks.length === 0) {
      return {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }

    const totalDuration = this.longTasks.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);

    return {
      count: this.longTasks.length,
      totalDuration,
      averageDuration: totalDuration / this.longTasks.length,
    };
  }

  /**
   * Get current metrics without stopping
   */
  getCurrentMetrics(): LongTaskMetrics {
    if (this.longTasks.length === 0) {
      return {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }

    const totalDuration = this.longTasks.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);

    return {
      count: this.longTasks.length,
      totalDuration,
      averageDuration: totalDuration / this.longTasks.length,
    };
  }
}

/**
 * Drift Checker
 * Compares displayed timer time with performance.now() to detect drift
 */
export class DriftChecker {
  private startTime: number = 0;
  private expectedElapsed: number = 0;
  private samples: Array<{ timestamp: number; displayed: number; expected: number }> = [];

  /**
   * Start drift checking
   */
  start(): void {
    this.startTime = performance.now();
    this.expectedElapsed = 0;
    this.samples = [];
  }

  /**
   * Record a sample
   */
  sample(displayedElapsedSeconds: number): void {
    const now = performance.now();
    const expectedElapsedMs = now - this.startTime;
    const expectedElapsedSeconds = expectedElapsedMs / 1000;

    this.samples.push({
      timestamp: now,
      displayed: displayedElapsedSeconds,
      expected: expectedElapsedSeconds,
    });
  }

  /**
   * Calculate drift metrics
   */
  calculateMetrics(): DriftMetrics {
    if (this.samples.length === 0) {
      return {
        absoluteError: 0,
        relativeError: 0,
        samples: 0,
      };
    }

    // Calculate absolute error for each sample
    const errors = this.samples.map(s => {
      const errorMs = Math.abs(s.displayed - s.expected) * 1000;
      return errorMs;
    });

    // Find maximum absolute error
    const absoluteError = Math.max(...errors);

    // Calculate average relative error
    const relativeErrors = this.samples.map(s => {
      if (s.expected === 0) return 0;
      return Math.abs((s.displayed - s.expected) / s.expected) * 100;
    });
    const relativeError = relativeErrors.reduce((a, b) => a + b, 0) / relativeErrors.length;

    return {
      absoluteError,
      relativeError,
      samples: this.samples.length,
    };
  }

  /**
   * Reset checker
   */
  reset(): void {
    this.startTime = 0;
    this.expectedElapsed = 0;
    this.samples = [];
  }
}

