import { describe, it, expect } from 'vitest';
import { getLightColor } from '@state/timerMachine';
import type { TimerState } from '@types';

/**
 * Phase Lights Logic - Independent Phases Model
 * Verifies: exactly one light on, no overlap, deterministic state-based behavior
 * Phase order: work (green) → yellow → rest (red) → work (repeat)
 */
describe('Phase Lights Logic - Independent Phases', () => {
  describe('State-Based Light Mapping', () => {
    it('work state shows green', () => {
      expect(getLightColor('work')).toBe('green');
    });

    it('yellow state shows yellow', () => {
      expect(getLightColor('yellow')).toBe('yellow');
    });

    it('rest state shows red', () => {
      expect(getLightColor('rest')).toBe('red');
    });

    it('warmup state shows green', () => {
      expect(getLightColor('warmup')).toBe('green');
    });

    it('idle state shows off', () => {
      expect(getLightColor('idle')).toBe('off');
    });

    it('complete state shows off', () => {
      expect(getLightColor('complete')).toBe('off');
    });

    it('countdown state shows off', () => {
      expect(getLightColor('countdown')).toBe('off');
    });
  });

  describe('Single Light Rule - No Overlaps', () => {
    it('only one light on at any moment', () => {
      const states: TimerState[] = ['work', 'yellow', 'rest', 'warmup', 'idle', 'complete', 'countdown'];
      const lightColors = states.map(state => getLightColor(state));
      
      // Each state should map to exactly one light color
      states.forEach((state, index) => {
        const color = lightColors[index];
        expect(['green', 'yellow', 'red', 'off']).toContain(color);
      });
    });

    it('work and warmup both show green (no conflict)', () => {
      expect(getLightColor('work')).toBe('green');
      expect(getLightColor('warmup')).toBe('green');
      // Both are green, but they're different states, so no overlap issue
    });
  });

  describe('Phase Transitions - Light Changes', () => {
    it('work → yellow transition: green → yellow', () => {
      expect(getLightColor('work')).toBe('green');
      expect(getLightColor('yellow')).toBe('yellow');
    });

    it('yellow → rest transition: yellow → red', () => {
      expect(getLightColor('yellow')).toBe('yellow');
      expect(getLightColor('rest')).toBe('red');
    });

    it('rest → work transition: red → green', () => {
      expect(getLightColor('rest')).toBe('red');
      expect(getLightColor('work')).toBe('green');
    });
  });

  describe('Deterministic Behavior', () => {
    it('same state produces same light color', () => {
      const results = Array(10).fill(null).map(() => getLightColor('work'));
      expect(results.every(color => color === 'green')).toBe(true);
    });

    it('all states produce consistent results', () => {
      const states: TimerState[] = ['work', 'yellow', 'rest'];
      states.forEach(state => {
        const result1 = getLightColor(state);
        const result2 = getLightColor(state);
        const result3 = getLightColor(state);
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });

  describe('No Threshold Logic', () => {
    it('work state always shows green regardless of elapsed time', () => {
      // In the new model, work state always shows green
      // Yellow is a separate phase, not a threshold-based visual
      expect(getLightColor('work')).toBe('green');
    });

    it('yellow state always shows yellow regardless of elapsed time', () => {
      // Yellow is now a full independent phase
      expect(getLightColor('yellow')).toBe('yellow');
    });
  });
});
