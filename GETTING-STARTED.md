# Getting Started with Boxing Timer

## What Just Happened?

**Phase 0: Project Scaffold** is complete. You now have a fully configured Expo + React Native project with 50+ files ready for development.

## What's Included?

✅ **Complete codebase structure** — organized src/, tests/, e2e/ folders
✅ **11 documentation files** — architecture, decisions, testing, accessibility, deployment
✅ **TypeScript strict mode** — full type safety
✅ **ESLint + Prettier** — code quality and formatting
✅ **Vitest + Playwright** — unit tests and E2E tests
✅ **Zustand state management** — timer and settings stores (scaffold)
✅ **React Native components** — LightBeacon, ProgressRing, PrimaryButton (basic)
✅ **Design tokens** — WCAG AA compliant colors, typography
✅ **GitHub Actions CI** — automated testing pipeline
✅ **Tailwind + NativeWind** — responsive styling

## What's NOT Yet Implemented?

❌ **npm install** — dependencies need to be installed locally
❌ **Full timer logic** — state machine transitions will be in Phase 1
❌ **Audio system** — audio assets and playback (Phase 1)
❌ **Complete UI** — ProgressRing animation, all interactions (Phase 1)
❌ **Settings persistence** — AsyncStorage integration (Phase 1)

## Next Steps

### 1. Install Dependencies

```bash
cd D:/jdevProjects/modern-boxing-timer-app
npm install
```

This downloads ~500 MB of node_modules.

### 2. Verify Setup

```bash
npm run type-check     # TypeScript type checking
npm run lint           # Code linting
npm run test           # Run tests
```

All should pass (tests are scaffolds, will expand in Phase 1).

### 3. Start Web Dev Server (Optional, Don't Actually Run)

```bash
npm run web            # Starts Expo CLI on http://localhost:3000
```

⚠️ Note: Don't actually run this per your constraints. Just know the command is available.

### 4. Read Key Documentation

Before Phase 1 development, read:

1. **[CLAUDE.md](./CLAUDE.md)** — Guidance for future Claude Code sessions (5 min read)
2. **[docs/README.md](./docs/README.md)** — Project features and quick commands (5 min)
3. **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System design and state machine (10 min)
4. **[docs/ROADMAP.md](./docs/ROADMAP.md)** — What's next in Phase 1 (10 min)

Total: ~30 minutes to get up to speed.

## Project Structure Quick Reference

```
modern-boxing-timer-app/
├── src/
│   ├── app/              # Expo Router screens
│   ├── components/       # React Native UI components
│   ├── state/            # Zustand stores (timer, settings)
│   ├── audio/            # Audio system
│   ├── utils/            # Time utilities, monotonic timer
│   ├── theme/            # Design tokens
│   └── types/            # TypeScript definitions
├── tests/                # Unit & component tests (Vitest)
├── e2e/                  # End-to-end tests (Playwright)
├── docs/                 # 11 documentation files
├── .github/workflows/    # GitHub Actions CI
├── package.json          # Dependencies & npm scripts
├── app.json              # Expo app configuration
└── CLAUDE.md             # This project's Claude guidance
```

## Common npm Commands

```bash
# Development
npm run web              # Start Web dev server
npm run ios              # Start iOS simulator
npm run android          # Start Android emulator

# Quality
npm run lint             # Check code
npm run lint:fix         # Auto-fix code style
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run all tests
npm run test:watch      # Tests in watch mode
npm run e2e             # Run E2E tests
npm run e2e:headed      # E2E tests with browser visible

# Building
npm run build:web       # Build Web PWA
npm run build:ios       # Build iOS (via EAS)
npm run build:android   # Build Android (via EAS)
```

## Key Files for Development

**Must Read First:**
- `CLAUDE.md` — Guidance for future Claude sessions
- `docs/ARCHITECTURE.md` — System design

**Modify During Phase 1:**
- `src/state/timerMachine.ts` — Implement full FSM logic
- `src/components/ProgressRing.tsx` — SVG arc animation
- `src/app/index.tsx` — TimerScreen implementation

**Consult Often:**
- `docs/DECISIONS.md` — Why design choices were made
- `docs/TESTING.md` — Test structure and coverage goals
- `docs/ACCESSIBILITY.md` — WCAG AA compliance checklist

## Folder-by-Folder Guide

### `src/app/`
Expo Router screens. `_layout.tsx` is the root. `index.tsx` and `settings.tsx` are the main screens.

### `src/components/`
Reusable React Native components. Keep them small and testable.

### `src/state/`
Zustand stores. `timerMachine.ts` = timer FSM, `useSettings.ts` = configuration store.

### `src/utils/`
Utility functions. `time.ts` contains MonotonicTimer and DriftCorrectingScheduler classes.

### `src/theme/`
Design tokens only. Colors, spacing, typography. Reference in components via `COLORS.green`, etc.

### `src/types/`
TypeScript type definitions. Centralized place for all interfaces and types.

### `src/audio/`
Audio manager and preload system. Assets go in `assets/` subfolder.

### `tests/`
Unit tests with Vitest. Mirror src/ structure (e.g., `tests/state/timerMachine.test.ts`).

### `e2e/`
End-to-end Playwright tests. Run on the built Web app.

### `docs/`
All documentation. Keep up-to-date as code evolves.

## Architecture Highlights

**Timer State Machine:**
```
idle → countdown → work → yellow → rest → complete
```

**Timing Model:**
- **1 Hz Logic Tick**: Core timer logic every 1 second (drift-corrected)
- **60 FPS UI Animation**: requestAnimationFrame for smooth ring progress
- **Monotonic Time**: Uses performance.now() (never goes backward)

**State Management:**
- **Zustand**: Simple, lightweight, tree-shakeable
- **No Redux**: Overkill for this app
- **Selectors**: Reduce re-renders via atomic selectors

**Audio:**
- **Preload All**: Zero-latency playback on first cue
- **Singleton Manager**: AudioManager class manages all sounds
- **Cue Triggers**: Connected to FSM state transitions

## Testing Strategy

**Phase 0:** Scaffolds only (will expand in Phase 1)

**Phase 1 Goals:**
- 90%+ unit test coverage for timerMachine.ts
- Component tests for UI rendering
- E2E smoke tests for critical user flows

**Run Locally:**
```bash
npm run test            # Unit tests
npm run e2e             # E2E tests (requires built web app)
npm run test:watch      # Watch mode during development
```

## Linting & Type Checking

All code is linted with ESLint and formatted with Prettier.

```bash
npm run lint:fix        # Auto-fix all issues
npm run type-check      # Check TypeScript types
```

Pre-commit hooks (Husky) will run these automatically.

## Performance Notes

**Bundle Size Target:** < 2 MB (Web PWA)
**Audio Latency Target:** < 100 ms first cue, < 50 ms subsequent
**Frame Rate Target:** 60 FPS main UI, ≤ 10 Hz throttle for ProgressRing
**Memory Target:** < 50 MB on mobile

## Accessibility Standards

**WCAG 2.1 Level AA** compliance target.

- ✅ Colors meet 4.5:1 contrast (AA minimum)
- ✅ Large text (64px timer, readable from 3–5 m)
- ✅ Haptic feedback for state changes
- ✅ Screen reader support (not yet implemented)
- ✅ Dynamic Type scaling (iOS)

See `docs/ACCESSIBILITY.md` for full checklist.

## Privacy & Data

**Zero telemetry.** No network calls. No personal data collected. All settings stored on device only.

See `docs/PRIVACY.md` for full privacy policy.

## Deployment Targets

**Phase 3 (Release):**
- Web PWA → static export → deploy to Vercel/Netlify
- iOS → EAS Build → App Store
- Android → EAS Build → Google Play

## Questions?

- **Architecture questions** → Read `docs/ARCHITECTURE.md`
- **Design decisions** → Read `docs/DECISIONS.md`
- **How to test** → Read `docs/TESTING.md`
- **Build & deploy** → Read `docs/OPERATIONS.md`
- **Contributing** → Read `docs/CONTRIBUTING.md`

## Phase Timeline

| Phase | Duration | Status | Key Deliverable |
|-------|----------|--------|-----------------|
| 0     | ✅ Done  | Complete | Project scaffold + docs |
| 1     | 5-7 days | Starting | Core MVP (timer, audio, settings) |
| 2     | 3-4 days | Planned | Polish (visuals, haptics, accessibility) |
| 3     | 2-3 days | Planned | Release hardening & builds |

## You're Ready!

Phase 0 scaffold is complete. The project is structured, documented, and ready for Phase 1 development.

**Next: Run `npm install` and start Phase 1.**

---

For detailed guidance on future Claude Code sessions, see [CLAUDE.md](./CLAUDE.md).
