import { render } from '@testing-library/react-native';
import { ProgressRing } from '@components/ProgressRing';
import { describe, it, expect } from 'vitest';

describe('ProgressRing Component', () => {
  describe('Rendering', () => {
    it('renders with initial props', () => {
      const { getByText } = render(<ProgressRing elapsed={0} total={180} displayTime="03:00" />);

      expect(getByText('03:00')).toBeTruthy();
      expect(getByText('0%')).toBeTruthy();
    });

    it('displays the provided time string', () => {
      const { getByText } = render(<ProgressRing elapsed={0} total={120} displayTime="02:00" />);

      expect(getByText('02:00')).toBeTruthy();
    });

    it('displays progress as percentage', () => {
      const { getByText } = render(<ProgressRing elapsed={30} total={120} displayTime="01:30" />);

      // 30/120 = 0.25 = 25%
      expect(getByText('25%')).toBeTruthy();
    });

    it('shows "Complete" when progress is 100%', () => {
      const { getByText } = render(<ProgressRing elapsed={120} total={120} displayTime="00:00" />);

      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates 0% progress at start', () => {
      const { getByText } = render(<ProgressRing elapsed={0} total={60} displayTime="01:00" />);

      expect(getByText('0%')).toBeTruthy();
    });

    it('calculates 50% progress at halfway point', () => {
      const { getByText } = render(<ProgressRing elapsed={30} total={60} displayTime="00:30" />);

      expect(getByText('50%')).toBeTruthy();
    });

    it('calculates 75% progress at 75%', () => {
      const { getByText } = render(<ProgressRing elapsed={45} total={60} displayTime="00:15" />);

      expect(getByText('75%')).toBeTruthy();
    });

    it('caps progress at 100%', () => {
      // elapsed > total (shouldn't happen but should handle gracefully)
      const { getByText } = render(<ProgressRing elapsed={150} total={120} displayTime="00:00" />);

      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero total duration', () => {
      const { getByText } = render(<ProgressRing elapsed={0} total={0} displayTime="00:00" />);

      expect(getByText('00:00')).toBeTruthy();
      expect(getByText('0%')).toBeTruthy();
    });

    it('handles large time values', () => {
      // 2 hour timer (7200 seconds)
      const { getByText } = render(<ProgressRing elapsed={3600} total={7200} displayTime="01:00:00" />);

      expect(getByText('01:00:00')).toBeTruthy();
      expect(getByText('50%')).toBeTruthy();
    });

    it('handles fractional seconds rounding', () => {
      // 33.33% should round to 33%
      const { getByText } = render(<ProgressRing elapsed={10} total={30} displayTime="00:20" />);

      expect(getByText('33%')).toBeTruthy();
    });

    it('updates when props change', () => {
      const { rerender, getByText, queryByText } = render(
        <ProgressRing elapsed={0} total={60} displayTime="01:00" />
      );

      expect(getByText('0%')).toBeTruthy();

      // Rerender with updated progress
      rerender(<ProgressRing elapsed={30} total={60} displayTime="00:30" />);

      expect(queryByText('0%')).toBeFalsy();
      expect(getByText('50%')).toBeTruthy();
      expect(getByText('00:30')).toBeTruthy();
    });
  });

  describe('Monotonic Progress', () => {
    it('never decreases progress', () => {
      // First render at 25% progress
      const { rerender, getByText, queryByText } = render(
        <ProgressRing elapsed={15} total={60} displayTime="00:45" />
      );

      expect(getByText('25%')).toBeTruthy();

      // Update to 50%
      rerender(<ProgressRing elapsed={30} total={60} displayTime="00:30" />);
      expect(queryByText('25%')).toBeFalsy();
      expect(getByText('50%')).toBeTruthy();

      // Stays at or increases, never decreases
      rerender(<ProgressRing elapsed={35} total={60} displayTime="00:25" />);
      expect(getByText('58%')).toBeTruthy(); // 35/60 = 58.33% rounded to 58%
    });
  });

  describe('Styling', () => {
    it('renders with correct container structure', () => {
      const { root } = render(<ProgressRing elapsed={0} total={60} displayTime="01:00" />);

      // Component should render without errors
      expect(root).toBeTruthy();
    });

    it('handles different display time formats', () => {
      const timeFormats = ['00:30', '01:30', '10:45', '59:59'];

      timeFormats.forEach((time) => {
        const { getByText } = render(<ProgressRing elapsed={0} total={60} displayTime={time} />);
        expect(getByText(time)).toBeTruthy();
      });
    });
  });
});
