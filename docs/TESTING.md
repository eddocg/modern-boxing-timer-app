# Testing Strategy

## Overview

Boxing Timer uses a three-tier testing approach: unit tests, component tests, and E2E tests. Target coverage is **90%+ for core state logic** (timerMachine.ts).

## Test Files Structure

```
tests/
├── state/
│   ├── timerMachine.test.ts       # FSM transitions, selectors
│   └── useSettings.test.ts        # Settings store and persistence
├── utils/
│   └── time.test.ts               # formatTime, MonotonicTimer, scheduler
├── components/
│   ├── LightBeacon.test.tsx       # Light rendering and state
│   └── ProgressRing.test.tsx      # Progress calculation and monotonic verification

e2e/
└── smoke.spec.ts                  # Playwright Web PWA smoke tests
```

## Unit Tests (Vitest)

### timerMachine.test.ts

**Test Suites**:

1. **FSM State Transitions**
   - `idle → countdown → work` (with countdown enabled)
   - `idle → work` (without countdown)
   - `work → yellow` (when elapsed >= yellowThreshold)
   - `yellow → rest` (when work interval complete)
   - `rest → work` (next round)
   - `rest → complete` (final round)
   - `complete → idle` (reset)

2. **Pause/Resume**
   - Pause from any state preserves state
   - Resume returns to previous state
   - Elapsed time doesn't advance while paused

3. **Reset**
   - Reset from any state returns to `idle`
   - Counters reset to initial values
   - Time resets to 0

4. **Infinite vs Fixed Rounds**
   - Infinite rounds (null): transitions from rest → work indefinitely
   - Fixed rounds: transitions from rest → complete on final round
   - Round counter increments correctly

5. **Monotonic Time Validation**
   - Elapsed time never decreases
   - Elapsed time >= logical elapsed
   - Drift correction maintains consistency

6. **Selectors**
   - `useTimerState()` returns current state
   - `useCurrentRound()` returns correct round number
   - `useElapsedSeconds()` returns elapsed time

**Coverage Target**: 95%+ for timerMachine.ts

### useSettings.test.ts

**Test Suites**:

1. **Settings Updates**
   - `updateSetting()` updates individual settings
   - Multiple updates don't interfere with each other
   - Settings persist after updates

2. **Defaults**
   - Default values loaded correctly on init
   - `resetToDefaults()` clears all changes

3. **Persistence** (AsyncStorage)
   - `saveToStorage()` persists all settings
   - `loadFromStorage()` retrieves saved settings
   - Round-trip: save → load → verify identity

**Coverage Target**: 90%+ for useSettings.ts

### time.test.ts

**Test Suites**:

1. **formatTime()**
   - 0s → "00:00"
   - 59s → "00:59"
   - 60s → "01:00"
   - 3661s → "61:01"
   - Padding with zeros

2. **getRoundInfo()**
   - `getRoundInfo(1, 12)` → "01/12"
   - `getRoundInfo(5, 12)` → "05/12"
   - `getRoundInfo(1, null)` → "01/∞"
   - Correct padding

3. **MonotonicTimer**
   - Elapsed time increases monotonically
   - Reset() resets timer
   - Never goes backward

4. **DriftCorrectingScheduler**
   - Callback fires at ~1 Hz (1000 ± 50 ms)
   - Detects and corrects setInterval drift
   - Stop() clears interval
   - isRunning() returns correct state

**Coverage Target**: 90%+

## Component Tests (React Native Testing Library)

### LightBeacon.test.tsx

```typescript
it('renders with correct color', () => {
  const { getByTestId } = render(<LightBeacon color="green" isOn={true} />);
  expect(getByTestId('beacon')).toHaveClass('bg-boxing-green');
});

it('shows different opacity based on isOn', () => {
  const { rerender, getByTestId } = render(<LightBeacon color="red" isOn={true} />);
  expect(getByTestId('beacon')).toHaveClass('opacity-100');

  rerender(<LightBeacon color="red" isOn={false} />);
  expect(getByTestId('beacon')).toHaveClass('opacity-30');
});
```

### ProgressRing.test.tsx

```typescript
it('displays correct elapsed time', () => {
  const { getByText } = render(
    <ProgressRing elapsed={30} total={180} displayTime="00:30" />
  );
  expect(getByText('00:30')).toBeDefined();
});

it('calculates progress correctly', () => {
  const { getByText } = render(
    <ProgressRing elapsed={90} total={180} displayTime="01:30" />
  );
  expect(getByText('50%')).toBeDefined(); // 90/180 = 50%
});

it('progress is monotonic', () => {
  let elapsed = 0;
  const { rerender } = render(
    <ProgressRing elapsed={elapsed} total={180} displayTime="00:00" />
  );

  for (let i = 1; i <= 180; i++) {
    elapsed = i;
    rerender(<ProgressRing elapsed={elapsed} total={180} displayTime={formatTime(i)} />);
    // Verify progress increases
  }
});
```

**Coverage Target**: 85%+ for component logic

## E2E Tests (Playwright)

### e2e/smoke.spec.ts

**Browser**: Chromium (Web PWA)

**Test Scenarios**:

1. **Timer Starts**
   ```typescript
   test('should start timer when play button pressed', async ({ page }) => {
     await page.goto('http://localhost:3000');
     await page.click('button:has-text("Play")');
     const timer = await page.textContent('[data-testid="timer-display"]');
     expect(timer).toMatch(/\d{2}:\d{2}/);
   });
   ```

2. **Pause/Resume**
   ```typescript
   test('should pause and resume timer', async ({ page }) => {
     await page.click('button:has-text("Play")');
     await page.waitForTimeout(500);
     const elapsedBeforePause = await page.textContent('[data-testid="timer-display"]');

     await page.click('button:has-text("Pause")');
     await page.waitForTimeout(500);
     const elapsedAfterPause = await page.textContent('[data-testid="timer-display"]');

     expect(elapsedBeforePause).toBe(elapsedAfterPause); // Time didn't advance
   });
   ```

3. **Settings Persistence**
   ```typescript
   test('should persist settings to local storage', async ({ page }) => {
     await page.click('a[aria-label="settings"]');
     await page.fill('input[name="work-duration"]', '5:00');
     await page.click('button:has-text("Save")');

     await page.reload();
     const workDuration = await page.inputValue('input[name="work-duration"]');
     expect(workDuration).toBe('5:00');
   });
   ```

4. **Light State Changes**
   ```typescript
   test('should show green light during work', async ({ page }) => {
     await page.click('button:has-text("Play")');
     const greenLight = await page.locator('[data-testid="light-green"]');
     expect(await greenLight.evaluate((el) => el.className)).toContain('opacity-100');
   });
   ```

5. **Sound Triggers** (mocked)
   ```typescript
   test('should trigger sound on work start', async ({ page }) => {
     const audioPlaySpy = await page.evaluate(() => {
       window.audioPlayLog = [];
       // Intercept Audio.Sound.play() calls
     });

     await page.click('button:has-text("Play")');
     await page.waitForTimeout(500);
     // Verify bell sound was queued
   });
   ```

## Running Tests

### Unit & Component Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run single test file
npm run test -- src/state/timerMachine.test.ts

# Run with coverage report
npm run test -- --coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run in headed mode (see browser)
npm run e2e:headed

# Run specific test
npm run e2e -- e2e/smoke.spec.ts

# Debug test
npm run e2e -- --debug
```

## Mocking Strategy

### Audio Mocking

Audio assets don't exist in Phase 0. Mock for testing:

```typescript
// In test setup
vi.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: vi.fn().mockResolvedValue({
        sound: {
          playAsync: vi.fn().mockResolvedValue(undefined),
          setVolumeAsync: vi.fn().mockResolvedValue(undefined),
          unloadAsync: vi.fn().mockResolvedValue(undefined),
        },
      }),
    },
  },
}));
```

### AsyncStorage Mocking

```typescript
const mockStorage = {};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key) => Promise.resolve(mockStorage[key])),
    setItem: vi.fn((key, value) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
  },
}));
```

## Coverage Requirements

| Module | Target | Critical |
|--------|--------|----------|
| timerMachine.ts | 95% | Yes (core FSM) |
| useSettings.ts | 90% | Yes (state) |
| time.ts | 90% | Yes (utilities) |
| Components | 85% | No |
| Audio | 80% | No |
| Utils | 80% | No |

## Pre-Commit Testing

Husky + lint-staged runs before every commit:

```bash
# Runs automatically on git commit
npm run lint:fix
npm run type-check
npm run test
```

Prevent commit if any fail.

## CI Integration

GitHub Actions runs full suite on every push:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm run test
- name: Run E2E
  run: npm run e2e
- name: Type check
  run: npm run type-check
```

## Post-Phase 1 Testing

- Phase 2: Accessibility testing (WCAG AA audit with tools)
- Phase 3: Real device testing (iPhone, Android), performance profiling

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) for testing approach rationale.
