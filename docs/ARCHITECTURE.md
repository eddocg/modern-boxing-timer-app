# Architecture

This document describes the high-level architecture of the Boxing Timer app.

## Overview

The Boxing Timer is built on React Native + Expo with a client-side state machine that drives the timer logic. The app has no network calls, no backend dependencies, and runs entirely on-device.

## State Machine (Timer FSM)

The core timer is a deterministic finite state machine implemented in `src/state/timerMachine.ts`.

### States

```
idle
  ↓ (user presses Start)
countdown (optional, 3-2-1 if enabled)
  ↓ (countdown complete or skipped)
work (green light)
  ├→ yellow (substate, last N seconds)
  ↓ (interval complete)
rest (red light)
  ├→ work (if more rounds)
  └→ complete (if final round)
```

### State Transitions

| Current | Trigger | Next |
|---------|---------|------|
| idle | start | countdown or work |
| countdown | tick(3) | work |
| work | tick(elapsed >= duration) | rest |
| work | tick(remaining <= yellowThreshold) | yellow |
| rest | tick(elapsed >= duration) | work or complete |
| complete | reset | idle |
| any | pause | paused |
| paused | resume | previous state |
| any | reset | idle |

### Key Properties

- **Monotonic Timestamps**: Uses `performance.now()` for elapsed time calculation
- **No setInterval Reliance**: Logic tick runs at 1 Hz with drift correction
- **Configurable Intervals**: Work, rest, warmup, yellow threshold all configurable
- **Infinite Rounds**: Default behavior; users can set fixed round count
- **Pause/Resume**: Full state preservation on pause

## Timing Model

### Layers

1. **Logic Tick (1 Hz)**
   - Core timer logic runs every ~1 second
   - Uses `DriftCorrectingScheduler` to prevent setInterval drift
   - Checks state transitions, updates elapsed time, triggers audio cues

2. **UI Animation (60 Hz)**
   - `requestAnimationFrame` drives smooth ProgressRing arc animation
   - Calculates progress as elapsed / total
   - Monotonically increasing (never goes backward)
   - Visual tick updates every 1 second (aligned with logic tick)

3. **Monotonic Time**
   - Elapsed time calculated as: `performance.now() - startTimestamp`
   - Never relies on state alone; always validates against monotonic clock
   - Handles pause/resume by adjusting startTimestamp

## Component Hierarchy

```
Root (_layout.tsx)
  ├─ TimerScreen (index.tsx)
  │  ├─ LightBeacon (green)
  │  ├─ LightBeacon (yellow)
  │  ├─ LightBeacon (red)
  │  ├─ ProgressRing
  │  │  └─ mm:ss display
  │  ├─ Round info text
  │  ├─ PrimaryButton (Play/Pause/Resume)
  │  └─ Settings gear icon
  │
  └─ SettingsScreen (settings.tsx)
     ├─ Rounds input
     ├─ Work duration input
     ├─ Rest duration input
     ├─ Yellow threshold input
     ├─ Warmup input
     ├─ Sound pack selector
     ├─ Volume slider
     ├─ Vibration toggle
     ├─ Countdown toggle
     ├─ Test sound button
     └─ Save/reset buttons
```

## State Management

### Zustand Stores

**useTimerStore** (`src/state/timerMachine.ts`)
- Holds: state, currentRound, elapsedSeconds, intervalSeconds
- Actions: start, pause, resume, reset, tick, transitionState
- Selectors: useTimerState, useCurrentRound, useElapsedSeconds, etc.

**useSettingsStore** (`src/state/useSettings.ts`)
- Holds: rounds, workDuration, restDuration, yellowThreshold, warmup, soundPack, volume, etc.
- Actions: updateSetting, resetToDefaults, loadFromStorage, saveToStorage
- Selectors: useRounds, useWorkDuration, etc.

### Why Zustand?

- Minimal boilerplate vs Redux
- Tree-shakeable, atomic selectors reduce re-renders
- Perfect for this use case: timer state + settings
- Plays well with React Native

## Audio Pipeline

### Preload Strategy

All audio assets are preloaded at app startup via `AudioManager` (`src/audio/index.ts`):

1. App initializes → calls `getAudioManager().initialize()`
2. Audio.setAudioModeAsync() configured for background play
3. Each asset (bell, double_bell, beep, horn) is preloaded into `Sound` instances
4. Instances are cached in a Map for zero-latency playback

### Cue Triggers

| Transition | Cue | Asset |
|-----------|-----|-------|
| idle → countdown/work | Single bell | bell.wav |
| work → yellow | Beep (each second) | beep.wav |
| work → rest | Double bell | double_bell.wav |
| rest → work | Single bell | bell.wav |
| complete | Long horn | horn.wav |

### Volume Control

- Global `AudioManager.setVolume(0-1)` controls all sounds
- Called when user changes volume in Settings
- Updates all cached Sound instances synchronously

## Styling

### NativeWind + Tailwind

- Uses `tailwind.config.js` with custom colors
- Boxing green (#00D26A), yellow (#FFD84D), red (#FF4D4F), bg (#0B0B0C)
- Fallback to `react-native` StyleSheet for complex transforms

### Dark Theme

- Default dark mode (`userInterfaceStyle: "dark"`)
- High-contrast colors for gym visibility (3–5 m readability)
- No light mode variant (Phase 0 scope)

## Performance Considerations

### Render Optimization

- **ProgressRing**: Throttled to ≤10 Hz via `requestAnimationFrame` + selective updates
- **LightBeacon**: Simple opacity-only animation, minimal re-renders
- **Settings**: Lazy-loaded, only renders when navigated to

### Memory & Bundle

- No large dependencies (Zustand ~2 KB, expo-av prebuilt)
- Audio assets cached, not streamed
- Strict TypeScript prevents memory leaks via type safety

### Audio Latency

- Preloaded assets → < 100 ms first play
- `.replayAsync()` on cached instances → < 50 ms subsequent plays
- Validated on Web, Android, iOS before Phase 2

## Testing Strategy

### Unit Tests (Vitest)

**timerMachine.test.ts**: FSM transitions, edge cases
- idle → countdown → work → yellow → rest → complete
- Pause/resume/reset behavior
- Monotonic time validation
- Round counting (infinite and fixed)
- Yellow threshold logic

**useSettings.test.ts**: Settings persistence
- Update and retrieve settings
- AsyncStorage round-trip
- Default values

**time.test.ts**: Utilities
- formatTime, getRoundInfo, MonotonicTimer, DriftCorrectingScheduler

### Component Tests (React Native Testing Library)

**LightBeacon.test.tsx**: Render and state
- Color rendering
- On/off opacity

**ProgressRing.test.tsx**: Progress display
- Elapsed/total calculation
- formatTime integration
- Monotonic progress verification

### E2E Tests (Playwright)

**e2e/smoke.spec.ts**: Web PWA flows
- Start/pause/resume timer
- Settings persistence
- Light state changes
- Sound triggers (mocked)

## Error Handling

- Error boundaries wrap screens (Phase 3)
- Graceful fallback for missing audio assets
- Console logging for dev; no crash reporting (privacy-first)
- Network errors not applicable (offline-only)

## Accessibility

### WCAG AA Targets

- Large font sizes (64px for timer display)
- High contrast: all colors meet AA standards
- Dynamic Type support for responsive scaling
- Screen reader announcements for state changes

### Haptic Feedback

- `expo-haptics` for state transitions (work → rest, etc.)
- Graceful fallback on unsupported devices
- Configurable in Settings

## Deployment

### Web PWA

```bash
npm run build:web
```

Output: `dist/` folder with:
- Static HTML, JS, CSS
- Service worker for offline
- Web app manifest
- Icons for home screen

### iOS & Android

```bash
npm run build:ios
npm run build:android
```

Uses **EAS Build**:
- No local Xcode/Android Studio needed
- Signed artifacts ready for app stores
- Requires EAS account (free tier available)

## Dependencies

### Core

- `expo`: SDK 50+ (LTS)
- `expo-router`: File-based routing
- `react-native`: Latest compatible
- `zustand`: State management
- `nativewind`: Tailwind for RN

### Audio & Haptics

- `expo-av`: Audio playback
- `expo-haptics`: Vibration/haptics
- `expo-keep-awake`: Screen stay-on

### Dev & Testing

- `typescript`: Type safety
- `vitest`: Unit testing
- `playwright`: E2E testing
- `eslint`, `prettier`: Linting/formatting

---

See [DECISIONS.md](./DECISIONS.md) for why these choices were made.
