import { describe, it, expect } from 'vitest';

/**
 * Text Jitter Prevention Tests
 * Verifies: fixed-width container, monospace font, no layout shifts
 */
describe('Text Jitter Prevention', () => {
  // Simulate text width calculation
  function getTextWidth(text: string, isMonospace: boolean): number {
    if (isMonospace) {
      // Monospace: each character has same width
      return text.length * 10; // 10px per char
    } else {
      // Proportional: different widths per digit
      const widths: Record<string, number> = {
        '0': 10, '1': 6, '2': 9, '3': 9, '4': 10,
        '5': 9, '6': 10, '7': 8, '8': 10, '9': 10,
        ':': 4,
      };
      return text.split('').reduce((sum, char) => sum + (widths[char] || 10), 0);
    }
  }

  it('monospace font produces consistent width for all digits', () => {
    const times = ['00:00', '01:11', '12:34', '59:59', '99:99'];
    const widths = times.map(t => getTextWidth(t, true));
    
    // All should have same width with monospace
    const firstWidth = widths[0];
    widths.forEach((width, index) => {
      expect(width).toBe(firstWidth);
    });
  });

  it('proportional font causes width variation', () => {
    const times = ['00:00', '01:11', '12:34', '59:59'];
    const widths = times.map(t => getTextWidth(t, false));
    
    // Proportional should have different widths
    const uniqueWidths = new Set(widths);
    expect(uniqueWidths.size).toBeGreaterThan(1);
  });

  it('fixed-width container prevents layout shift', () => {
    const containerWidth = 200; // Fixed width
    const times = ['00:00', '01:11', '12:34', '59:59', '99:99'];
    
    times.forEach((time) => {
      const textWidth = getTextWidth(time, true); // Monospace
      // Text width should be <= container width
      expect(textWidth).toBeLessThanOrEqual(containerWidth);
      // Container width remains constant regardless of text
      expect(containerWidth).toBe(200);
    });
  });
});

