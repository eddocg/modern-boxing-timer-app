import { test, expect } from '@playwright/test';

test.describe('Timer Accuracy and Smoothness - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Text Jitter Prevention', () => {
    test('timer display has constant width as digits change', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const timeContainer = timerDisplay.locator('..'); // Parent container

      // Get initial bounding box
      const initialBox = await timeContainer.boundingBox();
      expect(initialBox).not.toBeNull();
      const initialWidth = initialBox!.width;

      // Start timer and wait for digits to change
      const startButton = page.locator('[data-testid="play-pause-button"]');
      await startButton.click();

      // Sample width at multiple points as timer counts down
      const widths: number[] = [initialWidth];
      
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(1000); // Wait 1 second
        const box = await timeContainer.boundingBox();
        if (box) {
          widths.push(box.width);
        }
      }

      // All widths should be the same (within 1px tolerance for subpixel rendering)
      const uniqueWidths = new Set(widths.map(w => Math.round(w)));
      expect(uniqueWidths.size).toBeLessThanOrEqual(2); // Allow 1px variance for subpixel
      
      // Verify width is constant (max difference < 2px)
      const maxWidth = Math.max(...widths);
      const minWidth = Math.min(...widths);
      expect(maxWidth - minWidth).toBeLessThan(2);
    });

    test('timer display uses monospace font', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      
      const fontFamily = await timerDisplay.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      // Should contain monospace
      expect(fontFamily.toLowerCase()).toContain('monospace');
    });

    test('timer display has fixed-width container', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const timeContainer = timerDisplay.locator('..');

      const width = await timeContainer.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // Should have explicit width (not auto)
      expect(width).not.toBe('auto');
      expect(parseFloat(width)).toBeGreaterThan(0);
    });
  });

  test.describe('Timer Accuracy', () => {
    test('timer counts down accurately over short duration', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const startButton = page.locator('[data-testid="play-pause-button"]');

      // Get initial time
      const initialTime = await timerDisplay.textContent();
      expect(initialTime).toMatch(/\d{2}:\d{2}/);

      // Start timer
      await startButton.click();

      // Wait 3 seconds
      await page.waitForTimeout(3000);

      // Get updated time
      const updatedTime = await timerDisplay.textContent();
      
      // Parse times
      const parseTime = (timeStr: string) => {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
      };

      const initialSeconds = parseTime(initialTime!);
      const updatedSeconds = parseTime(updatedTime!);
      const elapsed = initialSeconds - updatedSeconds;

      // Should have elapsed approximately 3 seconds (allow ±500ms for test timing)
      expect(elapsed).toBeGreaterThanOrEqual(2);
      expect(elapsed).toBeLessThanOrEqual(4);
    });

    test('timer maintains accuracy after pause/resume', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const startButton = page.locator('[data-testid="play-pause-button"]');

      await startButton.click();
      await page.waitForTimeout(1000);

      const timeBeforePause = await timerDisplay.textContent();
      await startButton.click(); // Pause
      await page.waitForTimeout(2000); // Wait 2 seconds while paused
      await startButton.click(); // Resume

      await page.waitForTimeout(1000);
      const timeAfterResume = await timerDisplay.textContent();

      // Parse times
      const parseTime = (timeStr: string) => {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
      };

      const beforeSeconds = parseTime(timeBeforePause!);
      const afterSeconds = parseTime(timeAfterResume!);
      const elapsed = beforeSeconds - afterSeconds;

      // Should have elapsed approximately 1 second (pause time doesn't count)
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Visibility Handling', () => {
    test('timer recalculates elapsed after tab visibility change', async ({ page, context }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const startButton = page.locator('[data-testid="play-pause-button"]');

      await startButton.click();
      await page.waitForTimeout(1000);

      const timeBeforeHide = await timerDisplay.textContent();

      // Simulate tab visibility change (hide)
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'hidden',
          writable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Wait while hidden
      await page.waitForTimeout(2000);

      // Simulate tab visibility change (show)
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await page.waitForTimeout(500);

      const timeAfterShow = await timerDisplay.textContent();

      // Parse times
      const parseTime = (timeStr: string) => {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
      };

      const beforeSeconds = parseTime(timeBeforeHide!);
      const afterSeconds = parseTime(timeAfterShow!);
      const elapsed = beforeSeconds - afterSeconds;

      // Should have elapsed approximately 1.5 seconds (1s before hide + 0.5s after show)
      // Allow some variance for test timing
      expect(elapsed).toBeGreaterThanOrEqual(1);
      expect(elapsed).toBeLessThanOrEqual(3);
    });
  });

  test.describe('Performance', () => {
    test('no visible frame drops during timer run', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const startButton = page.locator('[data-testid="play-pause-button"]');

      await startButton.click();

      // Collect frame times over 5 seconds
      const frameTimes: number[] = [];
      
      await page.evaluate(() => {
        let lastTime = performance.now();
        const times: number[] = [];
        
        const raf = () => {
          const now = performance.now();
          times.push(now - lastTime);
          lastTime = now;
          
          if (times.length < 300) { // ~5 seconds at 60 FPS
            requestAnimationFrame(raf);
          } else {
            (window as any).__frameTimes = times;
          }
        };
        
        requestAnimationFrame(raf);
      });

      // Wait for frame collection
      await page.waitForFunction(() => (window as any).__frameTimes !== undefined, { timeout: 10000 });

      const intervals = await page.evaluate(() => (window as any).__frameTimes);

      // Calculate metrics
      const averageInterval = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
      const framesOver32ms = intervals.filter((i: number) => i > 32).length;
      const percentOver32ms = (framesOver32ms / intervals.length) * 100;

      // Average should be close to 16.7ms (60 FPS)
      expect(averageInterval).toBeGreaterThan(10);
      expect(averageInterval).toBeLessThan(25);

      // Less than 1% of frames should exceed 32ms
      expect(percentOver32ms).toBeLessThan(1);
    });
  });
});

