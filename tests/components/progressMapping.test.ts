import { describe, it, expect } from 'vitest';

function remaining(total: number, elapsed: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, (total - elapsed) / total));
}

describe('Progress mapping (remaining)', () => {
  it('is 1 at t=0 and 0 at t=total', () => {
    expect(remaining(60, 0)).toBe(1);
    expect(remaining(60, 60)).toBe(0);
  });

  it('is monotonic non-increasing', () => {
    const total = 30;
    const samples = [0, 5, 10, 15, 20, 25, 30].map((t) => remaining(total, t));
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeLessThanOrEqual(samples[i - 1]);
    }
  });

  it('clamps to [0..1]', () => {
    expect(remaining(60, -10)).toBe(1);
    expect(remaining(60, 120)).toBe(0);
  });

  it('handles zero total gracefully', () => {
    expect(remaining(0, 0)).toBe(0);
    expect(remaining(0, 10)).toBe(0);
  });

  it('agrees with numeric display at boundaries', () => {
    // At start: remaining = 1, display should show full time
    expect(remaining(180, 0)).toBe(1);
    
    // At end: remaining = 0, display should show 00:00
    expect(remaining(180, 180)).toBe(0);
    
    // At halfway: remaining = 0.5
    expect(remaining(180, 90)).toBe(0.5);
  });
});

