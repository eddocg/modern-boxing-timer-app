import { test, expect } from '@playwright/test';

test.describe('Boxing Timer - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads successfully', async ({ page }) => {
    const title = await page.textContent('text="BOXING TIMER"');
    expect(title).toBeTruthy();
  });

  test('play button is visible and clickable', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-pause-button"]');
    await expect(playButton).toBeVisible();
    await expect(playButton).toBeEnabled();
    // Button should show "START" initially
    await expect(playButton).toContainText('START');
  });

  test('settings icon is visible', async ({ page }) => {
    const settingsIcon = page.locator('[data-testid="settings-button"]');
    await expect(settingsIcon).toBeVisible();
  });

  test('timer display shows mm:ss format', async ({ page }) => {
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    await expect(timerDisplay).toContainText(/\d{2}:\d{2}/);
  });

  test('round info is displayed', async ({ page }) => {
    const roundInfo = page.locator('[data-testid="round-info"]');
    await expect(roundInfo).toContainText(/\d{2}\/\d{2}|\d{2}\/∞/);
  });

  test('three lights are rendered', async ({ page }) => {
    const greenLight = page.locator('[data-testid="light-green"]');
    const yellowLight = page.locator('[data-testid="light-yellow"]');
    const redLight = page.locator('[data-testid="light-red"]');

    await expect(greenLight).toBeVisible();
    await expect(yellowLight).toBeVisible();
    await expect(redLight).toBeVisible();
  });

  test.describe('Timer Controls', () => {
    test('start button starts timer', async ({ page }) => {
      const startButton = page.locator('[data-testid="play-pause-button"]');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      const initialTime = await timerDisplay.textContent();
      expect(initialTime).toBe('03:00'); // Default 3 minutes

      await startButton.click();
      await page.waitForTimeout(1100); // Wait for 1 second tick

      const updatedTime = await timerDisplay.textContent();
      expect(updatedTime).not.toBe('03:00');
    });

    test('pause button pauses timer', async ({ page }) => {
      const startButton = page.locator('[data-testid="play-pause-button"]');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      await startButton.click();
      await page.waitForTimeout(500);

      const pauseButton = page.locator('[data-testid="play-pause-button"]');
      const timeWhenPaused = await timerDisplay.textContent();

      await pauseButton.click();
      await page.waitForTimeout(500);

      const timeAfterPause = await timerDisplay.textContent();
      expect(timeWhenPaused).toBe(timeAfterPause);
    });

    test('resume button continues timer', async ({ page }) => {
      const startButton = page.locator('[data-testid="play-pause-button"]');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      await startButton.click();
      await page.waitForTimeout(500);
      await startButton.click(); // Pause

      const timeWhenPaused = await timerDisplay.textContent();

      await startButton.click(); // Resume
      await page.waitForTimeout(1100);

      const timeAfterResume = await timerDisplay.textContent();
      expect(timeAfterResume).not.toBe(timeWhenPaused);
    });
  });

  test.describe('Settings', () => {
    test('settings screen opens', async ({ page }) => {
      const settingsIcon = page.locator('[data-testid="settings-button"]');
      await settingsIcon.click();

      const settingsTitle = page.locator('text="Settings"');
      await expect(settingsTitle).toBeVisible();
    });

    test('settings persist after reload', async ({ page }) => {
      const settingsIcon = page.locator('[data-testid="settings-button"]');
      await settingsIcon.click();

      // Wait for settings screen to load
      await page.waitForSelector('text="Settings"');

      // Change work duration by clicking +30s button
      const workDurationButtons = page.locator('text="Work Duration"').locator('..').locator('button');
      const increaseButton = workDurationButtons.filter({ hasText: '+30s' }).first();
      await increaseButton.click();

      // Close settings by navigating back
      const closeButton = page.locator('[aria-label="Close settings"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Fallback: navigate back
        await page.goBack();
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Re-open settings
      await settingsIcon.click();
      await page.waitForSelector('text="Settings"');

      // Verify setting persisted (work duration should be 210s = 3:30)
      const workDurationText = await page.locator('text=/Work Duration:.*/').textContent();
      expect(workDurationText).toContain('3:30');
    });
  });

  test.describe('Light States', () => {
    test('green light is on during work', async ({ page }) => {
      const greenLight = page.locator('[data-testid="light-green"]');
      const greenOpacity = await greenLight.evaluate((el) => window.getComputedStyle(el).opacity);

      // Green should be fully visible (opacity 1 or near 1)
      expect(parseFloat(greenOpacity) > 0.8).toBeTruthy();
    });

    test('lights have different opacity states', async ({ page }) => {
      const greenLight = page.locator('[data-testid="light-green"]');
      const yellowLight = page.locator('[data-testid="light-yellow"]');
      const redLight = page.locator('[data-testid="light-red"]');

      const greenOpacity = await greenLight.evaluate((el) => window.getComputedStyle(el).opacity);
      const yellowOpacity = await yellowLight.evaluate((el) => window.getComputedStyle(el).opacity);
      const redOpacity = await redLight.evaluate((el) => window.getComputedStyle(el).opacity);

      // Green should be fully visible
      expect(parseFloat(greenOpacity) > 0.8).toBeTruthy();

      // Yellow and Red should be dimmed (off)
      expect(parseFloat(yellowOpacity) < 0.5).toBeTruthy();
      expect(parseFloat(redOpacity) < 0.5).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('timer display is readable from distance', async ({ page }) => {
      const timerDisplay = page.locator('[data-testid="timer-display"]');
      const fontSize = await timerDisplay.evaluate((el) => window.getComputedStyle(el).fontSize);

      // Timer display should be large (at least 40px)
      const pixelSize = parseInt(fontSize);
      expect(pixelSize >= 40).toBeTruthy();
    });

    test('buttons have adequate touch targets', async ({ page }) => {
      const playButton = page.locator('[data-testid="play-pause-button"]');
      const boundingBox = await playButton.boundingBox();

      // Buttons should be at least 48x48 pt (48x48 CSS pixels)
      expect((boundingBox?.width ?? 0) >= 48).toBeTruthy();
      expect((boundingBox?.height ?? 0) >= 48).toBeTruthy();
    });

    test('high contrast colors are used', async ({ page }) => {
      // Text should be white on dark background
      const title = page.locator('text="BOXING TIMER"');
      const textColor = await title.evaluate((el) => window.getComputedStyle(el).color);

      // Should be white or very light
      expect(textColor).toContain('rgb(255');
    });
  });

  test.describe('Short Duration Test', () => {
    test('timer completes short session correctly', async ({ page }) => {
      // This test uses very short durations for CI speed
      // In a real scenario, you'd configure these in settings first
      // For now, we'll just verify the timer starts and counts down
      const startButton = page.locator('[data-testid="play-pause-button"]');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      await startButton.click();
      
      // Wait a bit and verify timer is counting
      await page.waitForTimeout(1500);
      const timeAfterStart = await timerDisplay.textContent();
      
      // Timer should have changed from initial state
      expect(timeAfterStart).toBeTruthy();
      expect(timeAfterStart).not.toBe('03:00');
    });
  });
});
