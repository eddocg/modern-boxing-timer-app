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
    const playButton = page.locator('button:has-text("Play")');
    await expect(playButton).toBeVisible();
    await expect(playButton).toBeEnabled();
  });

  test('settings icon is visible', async ({ page }) => {
    const settingsIcon = page.locator('[aria-label="settings"]');
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
    test('play button starts timer', async ({ page }) => {
      const playButton = page.locator('button:has-text("Play")');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      const initialTime = await timerDisplay.textContent();
      expect(initialTime).toBe('00:00');

      await playButton.click();
      await page.waitForTimeout(1100); // Wait for 1 second tick

      const updatedTime = await timerDisplay.textContent();
      expect(updatedTime).not.toBe('00:00');
    });

    test('pause button pauses timer', async ({ page }) => {
      const playButton = page.locator('button:has-text("Play")');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      await playButton.click();
      await page.waitForTimeout(500);

      const pauseButton = page.locator('button:has-text("Pause")');
      const timeWhenPaused = await timerDisplay.textContent();

      await pauseButton.click();
      await page.waitForTimeout(500);

      const timeAfterPause = await timerDisplay.textContent();
      expect(timeWhenPaused).toBe(timeAfterPause);
    });

    test('resume button continues timer', async ({ page }) => {
      const playButton = page.locator('button:has-text("Play")');
      const pauseButton = page.locator('button:has-text("Pause")');
      const timerDisplay = page.locator('[data-testid="timer-display"]');

      await playButton.click();
      await page.waitForTimeout(500);
      await pauseButton.click();

      const timeWhenPaused = await timerDisplay.textContent();

      const resumeButton = page.locator('button:has-text("Resume")');
      await resumeButton.click();
      await page.waitForTimeout(1100);

      const timeAfterResume = await timerDisplay.textContent();
      expect(timeAfterResume).not.toBe(timeWhenPaused);
    });
  });

  test.describe('Settings', () => {
    test('settings modal opens', async ({ page }) => {
      const settingsIcon = page.locator('[aria-label="settings"]');
      await settingsIcon.click();

      const settingsTitle = page.locator('text="Settings"');
      await expect(settingsTitle).toBeVisible();
    });

    test('settings persist after reload', async ({ page }) => {
      const settingsIcon = page.locator('[aria-label="settings"]');
      await settingsIcon.click();

      // Change a setting (work duration)
      const workDurationInput = page.locator('input[name="work-duration"]');
      await workDurationInput.clear();
      await workDurationInput.fill('5:00');

      // Close settings
      const closeButton = page.locator('button:has-text("Done")');
      await closeButton.click();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Re-open settings
      await settingsIcon.click();

      // Verify setting persisted
      const savedDuration = await workDurationInput.inputValue();
      expect(savedDuration).toBe('5:00');
    });

    test('test sound button is clickable', async ({ page }) => {
      const settingsIcon = page.locator('[aria-label="settings"]');
      await settingsIcon.click();

      const testSoundButton = page.locator('button:has-text("Test Sound")');
      await expect(testSoundButton).toBeVisible();
      await expect(testSoundButton).toBeEnabled();
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
      const playButton = page.locator('button:has-text("Play")');
      const boundingBox = await playButton.boundingBox();

      // Buttons should be at least 48x48 pt (48x48 CSS pixels)
      expect(boundingBox?.width ?? 0 >= 48).toBeTruthy();
      expect(boundingBox?.height ?? 0 >= 48).toBeTruthy();
    });

    test('high contrast colors are used', async ({ page }) => {
      // Text should be white on dark background
      const title = page.locator('text="BOXING TIMER"');
      const textColor = await title.evaluate((el) => window.getComputedStyle(el).color);

      // Should be white or very light
      expect(textColor).toContain('rgb(255');
    });
  });
});
