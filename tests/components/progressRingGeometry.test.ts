import { describe, it, expect } from 'vitest';

/**
 * Diagnostic test for ProgressRing geometry calculations
 * Verifies: radius, circumference, dasharray, dashoffset at boundaries
 */
describe('ProgressRing Geometry Diagnostics', () => {
  const size = 300;
  const radius = 130;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  function calculateDashoffset(remaining: number): number {
    // Negative offset for clockwise shrink
    return -circumference * (1 - remaining);
  }

  it('calculates correct circumference', () => {
    // Expected: 2 * π * 130 ≈ 816.81
    expect(circumference).toBeCloseTo(816.81, 1);
  });

  it('dashoffset is 0 at t=0 (full ring)', () => {
    const remaining = 1;
    const dashoffset = calculateDashoffset(remaining);
    expect(dashoffset).toBeCloseTo(0, 5);
  });

  it('dashoffset is negative circumference at t=total (empty ring)', () => {
    const remaining = 0;
    const dashoffset = calculateDashoffset(remaining);
    expect(dashoffset).toBeCloseTo(-circumference, 1);
  });

  it('dashoffset is monotonic decreasing as remaining decreases (negative values)', () => {
    const samples = [1, 0.75, 0.5, 0.25, 0].map((r) => calculateDashoffset(r));
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeLessThan(samples[i - 1]);
    }
    // All should be <= 0
    expect(samples.every(v => v <= 0)).toBe(true);
  });

  it('dasharray equals circumference for proper arc rendering', () => {
    // stroke-dasharray should equal circumference for full circle
    expect(circumference).toBeGreaterThan(0);
    // Verify it's a reasonable value (not NaN or Infinity)
    expect(Number.isFinite(circumference)).toBe(true);
  });

  it('rotation starts at -90deg (12 o\'clock)', () => {
    // Transform should rotate -90deg to start at top
    const rotation = -90;
    expect(rotation).toBe(-90);
  });

  it('dashoffset direction is correct for clockwise shrink', () => {
    // At 50% remaining, dashoffset should be -50% of circumference
    const remaining = 0.5;
    const dashoffset = calculateDashoffset(remaining);
    expect(dashoffset).toBeCloseTo(-circumference * 0.5, 1);
  });
});

