/**
 * Format seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get round info string
 */
export function getRoundInfo(currentRound: number, totalRounds: number | null): string {
  const roundStr = currentRound.toString().padStart(2, '0');
  if (totalRounds === null) {
    return `${roundStr}/∞`;
  }
  return `${roundStr}/${totalRounds.toString().padStart(2, '0')}`;
}

/**
 * Monotonic timer helper - calculates elapsed time from start
 */
export class MonotonicTimer {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Get elapsed time in seconds since timer started
   */
  getElapsedSeconds(): number {
    return (performance.now() - this.startTime) / 1000;
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.startTime = performance.now();
  }
}

/**
 * Drift-correcting scheduler
 * Ensures 1 Hz ticks even with setInterval drift
 */
export class DriftCorrectingScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private lastTickTime: number = 0;
  private targetInterval: number = 1000; // 1 second

  start(callback: () => void): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.lastTickTime = performance.now();

    this.intervalId = setInterval(() => {
      const now = performance.now();
      const drift = now - this.lastTickTime - this.targetInterval;

      // Correct for drift by adjusting next interval
      const nextInterval = Math.max(1, this.targetInterval - drift);

      callback();
      this.lastTickTime = now;
    }, this.targetInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
