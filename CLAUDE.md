# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Boxing Timer** is a production-ready cross-platform timer app built with React Native + Expo that mimics a classic gym mechanical timer with three lights (green=work, yellow=final-seconds, red=rest) and loud gym sounds. Targets iOS, Android, and Web (PWA). Default behavior: runs indefinitely until stopped.

**Key Constraints:**
- Do NOT create, initialize, commit, push, fork, or open PRs. Generate code/files only; user handles VCS locally.
- Do NOT run dev servers, simulators, or long-running tasks. Provide commands only.
- Circular timer visibly reduces once per second; progress arc updates every 1s.
- Keep audio assets small and license-clear. No network calls. No analytics by default.

## Tech Stack

- **Framework:** React Native + Expo (SDK LTS), Expo Router
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind-RN); fallback to StyleSheet for perf
- **State Management:** Zustand or Jotai (no Redux unless critical)
- **Audio:** expo-av with preloaded WAV/OGG assets; ensure low-latency playback
- **Timing:** requestAnimationFrame + performance.now(); 1 Hz logic tick with drift correction
- **Icons:** @expo/vector-icons
- **Build Tools:** EAS (native), static export (Web PWA)
- **Testing:** Vitest + React Native Testing Library; Playwright for Web E2E
- **Lint/Format:** ESLint, Prettier, Husky + lint-staged
- **License:** MIT

## Repository Structure

Once Phase 0 is complete, the repo follows this layout:

```
modern-boxing-timer-app/
├── docs/
│   ├── README.md                  (quick start, features, commands)
│   ├── ARCHITECTURE.md            (state machine, component tree, timing model, audio pipeline)
│   ├── DECISIONS.md               (ADRs)
│   ├── ROADMAP.md                 (phases, milestones, backlog)
│   ├── TESTING.md                 (unit, integration, E2E)
│   ├── ACCESSIBILITY.md           (targets, checks, test plan)
│   ├── SOUND-LICENSING.md         (sources and licenses)
│   ├── PRIVACY.md                 (no analytics by default)
│   ├── OPERATIONS.md              (builds, signing, release checklist)
│   ├── CONTRIBUTING.md            (branching, PR checks, code style)
│   └── RELEASES.md                (versioning, changelog, store notes)
├── src/
│   ├── app/
│   │   ├── index.tsx              (TimerScreen - main view)
│   │   └── settings.tsx           (SettingsScreen)
│   ├── components/
│   │   ├── LightBeacon.tsx        (red/yellow/green light with glow)
│   │   ├── ProgressRing.tsx       (circular timer arc, 1s ticks)
│   │   └── PrimaryButton.tsx      (Play/Pause/Resume button)
│   ├── state/
│   │   ├── timerMachine.ts        (deterministic FSM + selectors)
│   │   └── useSettings.ts         (settings hook, async storage)
│   ├── audio/
│   │   ├── index.ts               (preload, playCue, volume control)
│   │   └── assets/                (bell.wav, double_bell.wav, beep.wav, horn.wav)
│   ├── utils/
│   │   └── time.ts                (timer utilities)
│   ├── theme/
│   │   └── tokens.ts              (color, spacing, typography)
│   └── types/
│       └── index.ts               (TypeScript definitions)
├── e2e/
│   └── smoke.spec.ts              (Playwright Web E2E smoke tests)
├── tests/
│   ├── state/
│   │   └── timerMachine.test.ts   (unit tests for FSM)
│   ├── components/
│   │   └── ProgressRing.test.tsx  (component tests)
│   └── audio/
│       └── index.test.ts          (audio preload and cue tests)
├── .github/
│   └── workflows/
│       └── ci.yml                 (GitHub Actions CI config - for local reference only)
├── app.json                       (Expo config with PWA settings)
├── tsconfig.json                  (TypeScript strict mode)
├── package.json
├── .eslintrc.js
├── .prettierrc
├── .husky/                        (pre-commit hooks)
├── .gitignore
└── CLAUDE.md                      (this file)
```

## Common Commands

All commands assume you're in the project root.

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Development

**Web (PWA) - Dev Mode:**
```bash
npm run web
```
(Runs on http://localhost:8081 by default)

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

### Linting & Formatting

**Run ESLint:**
```bash
npm run lint
```

**Run ESLint with auto-fix:**
```bash
npm run lint:fix
```

**Format code with Prettier:**
```bash
npm run format
```

### Testing

**Run all unit/component tests:**
```bash
npm run test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run a single test file:**
```bash
npm run test -- src/state/timerMachine.test.ts
```

**Run Web E2E tests (Playwright):**
```bash
npm run e2e
```

**Run E2E tests in headed mode:**
```bash
npm run e2e:headed
```

### Building

**Build Web PWA (static export):**
```bash
npm run build:web
```
(Output in `dist/` or configured export directory)

**Build iOS with EAS:**
```bash
npm run build:ios
```

**Build Android with EAS:**
```bash
npm run build:android
```

### Type Checking

**Run TypeScript compiler (no emit):**
```bash
npm run type-check
```

## Core Architecture

### Timer State Machine (src/state/timerMachine.ts)

The timer uses a deterministic finite state machine with the following states:

- **idle** → waiting for user to start
- **countdown** (optional) → 3-2-1 pre-start countdown if enabled
- **work** → working interval (green light)
  - **yellow** (substate) → last N seconds of work (yellow light, beep each second)
- **rest** → rest interval (red light)
- **complete** → session ended

**Key behaviors:**
- Uses monotonic timestamps (performance.now()) for accurate elapsed time
- 1 Hz logic tick with drift correction to prevent setInterval drift
- UI progress derived from elapsed/total, not state alone
- Automatic state transitions based on configured durations
- Infinite rounds by default or fixed number of rounds
- Pause/resume/reset capabilities

**Key selectors:**
- `timerState` — current FSM state
- `displayTime` — formatted mm:ss for UI
- `roundInfo` — current round "01/∞" or "01/12"
- `lightColor` — which light is on (green/yellow/red) or none
- `isRunning` — boolean

### Audio Pipeline (src/audio/index.ts)

- All audio assets preloaded at app startup to ensure low-latency playback
- Cached `expo-av` Audio.Sound instances, reused per cue type
- Cues triggered on state transitions:
  - **Start work:** single bell
  - **Enter yellow phase:** short beep each second (throttled)
  - **Work→Rest:** double bell
  - **Rest→Work:** single bell
  - **Session end:** long horn
- Volume slider controls all playback
- "Test sound" button in Settings triggers each cue

### Component Hierarchy

**TimerScreen (src/app/index.tsx):**
- Title "BOXING TIMER."
- Three-light module (three LightBeacon components)
- ProgressRing (circular timer arc with mm:ss in center)
- Subtext showing current round
- PrimaryButton (Play/Pause/Resume)
- Settings gear icon (top right) links to SettingsScreen

**SettingsScreen (src/app/settings.tsx):**
- Rounds input with "∞" option
- Work duration input (default 3:00)
- Rest duration input (default 1:00)
- Yellow threshold input (default 0:10 left)
- Warmup duration toggle/input (optional, default 0)
- Sound pack selector (Boxing Bell, MMA Horn, Beep)
- Volume slider (max loud preset)
- Vibration toggle
- 3-2-1 countdown toggle
- "Test sound" button
- Background limits note

**ProgressRing (src/components/ProgressRing.tsx):**
- Circular arc showing remaining time
- Updates visually every 1 second (monotonic)
- Large mm:ss text in center
- Driven by requestAnimationFrame + performance.now()

**LightBeacon (src/components/LightBeacon.tsx):**
- Single circular light (red, yellow, or green)
- Solid fill + glow effect when ON
- Three beacons arranged horizontally above the progress ring

### Timing Model

- **requestAnimationFrame:** UI progress animation (60 Hz), updates ProgressRing arc
- **1 Hz Logic Tick:** Core timer logic runs every ~1000ms via resilient scheduler (detects and corrects setInterval drift)
- **Monotonic Deltas:** elapsed time calculated using performance.now() - startTimestamp
- **Visible Updates:** ProgressRing reflects elapsed/total, monotonically increasing, completes full sweep per interval

### Settings Persistence

- All config persisted to device async storage (expo-sqlite or AsyncStorage)
- Keys: `rounds`, `workDuration`, `restDuration`, `yellowThreshold`, `warmup`, `soundPack`, `volume`, `vibrationEnabled`, `countdownEnabled`
- Optional: persist last timestamps to allow resume from paused state

## Color Tokens (src/theme/tokens.ts)

```
- Green (work):    #00D26A
- Yellow (final):  #FFD84D
- Red (rest):      #FF4D4F
- Background:      #0B0B0C
```

All colors meet WCAG AA contrast standards.

## Testing Strategy

**Unit Tests (Vitest):**
- `src/state/timerMachine.test.ts` — FSM state transitions, selectors, edge cases (aim for 90%+ statement coverage)
- `src/audio/index.test.ts` — preload, cue triggers, volume control

**Component Tests (React Native Testing Library):**
- `src/components/ProgressRing.test.tsx` — render time display, arc updates, monotonic progress
- `src/components/LightBeacon.test.tsx` — light state rendering

**E2E Tests (Playwright):**
- `e2e/smoke.spec.ts` — Web PWA smoke tests: start timer, pause, resume, settings persist, sound triggers

**Run locally before committing:**
```bash
npm run lint && npm run type-check && npm run test && npm run e2e
```

## Accessibility Requirements

- Large text, WCAG AA contrast (verified by tokens)
- Dynamic Type support via responsive font scaling
- Announcements for state changes (screen readers)
- Haptic feedback on transitions (when supported)
- Single-hand use, minimal clutter
- See `docs/ACCESSIBILITY.md` for full audit checklist

## Development Workflow

1. **Create feature branch** locally (no pushing)
2. **Write tests first** for state logic, then implement
3. **Run lint + type-check:** `npm run lint:fix && npm run type-check`
4. **Run full test suite:** `npm run test && npm run e2e`
5. **Verify Web PWA:** `npm run build:web` and test output
6. **Commit locally** with clear message
7. **User handles VCS/push/PR**

## Key Implementation Notes

- **No Redux.** Zustand or Jotai suffices for timer + settings state.
- **Throttle re-renders** to ≤10 Hz for the ProgressRing; use derived state atoms/selectors.
- **Preload all audio** at app startup; never lazy-load during play.
- **Monotonic progress:** never rely solely on setInterval; always validate elapsed time.
- **Performance:** validate audio latency on Web, Android, iOS before release.
- **Keep-Awake:** enable while timer is running to prevent screen lock.

## Deployment

- **Web PWA:** static export (Netlify, Vercel, GitHub Pages, or user's hosting)
- **iOS:** EAS Build, then submit to App Store
- **Android:** EAS Build, then submit to Google Play

See `docs/OPERATIONS.md` for detailed build and signing procedures.

## Additional Documentation

Once implemented, refer to these docs in the `docs/` folder:

- **ARCHITECTURE.md** — deep dive into state machine logic, component interactions, audio pipeline
- **DECISIONS.md** — ADRs explaining why specific tech/patterns were chosen
- **ROADMAP.md** — phases, milestones, backlog
- **TESTING.md** — test strategy, coverage targets, running tests
- **ACCESSIBILITY.md** — accessibility targets and checks
- **SOUND-LICENSING.md** — all audio sources and their licenses
- **PRIVACY.md** — no personal data; analytics opt-in only
- **OPERATIONS.md** — detailed build, signing, and release procedures
- **CONTRIBUTING.md** — branching strategy, PR checks, code style

## Phases

- **Phase 0** — Project scaffold: Expo setup, folder structure, initial docs
- **Phase 1** — Core MVP: state machine, ProgressRing, LightBeacon, audio, settings, persist
- **Phase 2** — Polish: iOS-style visuals, shadows, haptics, final sounds, accessibility audit, E2E smoke tests
- **Phase 3** — Release hardening: error boundary, offline resilience, bundle size, versioning, test builds

## When to Reference This File

- Before implementing a major feature, check this architecture for naming/structure conventions
- When adding a new state or transition, verify FSM logic in timerMachine.ts
- Before calling audio, check the audio pipeline and preload pattern
- Before adding UI, ensure it aligns with the TimerScreen/SettingsScreen layout
- Before running commands, use the exact command names listed above
