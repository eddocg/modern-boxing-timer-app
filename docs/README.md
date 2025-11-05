# Boxing Timer

A production-ready cross-platform timer app built with React Native + Expo that mimics a classic gym mechanical timer with three lights (green=work, yellow=final-seconds, red=rest) and loud gym sounds.

## Features

- **Three-Light System**: Visual indicator for work (green), final seconds (yellow), and rest (red) intervals
- **Circular Progress Ring**: Large, easy-to-read timer with monotonic 1-second ticks
- **Gym Sounds**: Authentic boxing bell, horn, and beep cues with configurable volume
- **Configurable Intervals**: Set work duration, rest duration, rounds, and yellow threshold
- **Persistent Settings**: All configuration saved to device storage
- **Cross-Platform**: iOS, Android, and Web (PWA)
- **Accessibility**: WCAG AA compliant, screen reader support, haptic feedback
- **Offline-Ready**: Works completely offline, no network calls

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli
```

### Development

**Start Web Dev Server:**
```bash
npm run web
```
Opens http://localhost:8081

**Start iOS Simulator (macOS only):**
```bash
npm run ios
```

**Start Android Emulator:**
```bash
npm run android
```

### Testing & Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Run unit and component tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run e2e

# Run E2E tests in headed mode
npm run e2e:headed
```

### Building

**Build Web PWA (static export):**
```bash
npm run build:web
```
Output: `dist/` folder with static files ready for deployment

**Build for iOS (requires EAS account):**
```bash
npm run build:ios
```

**Build for Android (requires EAS account):**
```bash
npm run build:android
```

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout and navigation
│   ├── index.tsx          # Timer screen
│   └── settings.tsx       # Settings screen
├── components/            # Reusable React Native components
│   ├── LightBeacon.tsx   # Red/yellow/green light
│   ├── ProgressRing.tsx  # Circular progress arc
│   └── PrimaryButton.tsx # Main action button
├── state/                 # Zustand stores
│   ├── timerMachine.ts   # Timer FSM logic
│   └── useSettings.ts    # Settings management
├── audio/                 # Audio system
│   ├── index.ts          # Audio manager
│   └── assets/           # Audio files
├── utils/                 # Utility functions
│   └── time.ts           # Time formatting, monotonic timer
├── theme/                 # Design tokens
│   └── tokens.ts         # Colors, spacing, typography
└── types/                # TypeScript definitions
    └── index.ts

tests/                     # Unit and component tests
e2e/                       # E2E tests (Playwright)
docs/                      # Documentation
```

## Configuration

All settings can be configured via the Settings screen:

- **Rounds**: Number of rounds (default: ∞ infinite)
- **Work Duration**: Length of work interval (default: 3:00)
- **Rest Duration**: Length of rest interval (default: 1:00)
- **Yellow Threshold**: Seconds before work ends to trigger yellow light (default: 0:10)
- **Warmup**: Optional warmup duration (default: 0:00)
- **Sound Pack**: Boxing Bell, MMA Horn, or Beep (default: Boxing Bell)
- **Volume**: Loudness level (default: max)
- **Vibration**: Haptic feedback on state changes (default: enabled)
- **Countdown**: 3-2-1 pre-start countdown (default: disabled)

Settings are automatically persisted to device storage.

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — State machine, component interactions, timing model, audio pipeline
- **[DECISIONS.md](./DECISIONS.md)** — Architecture decision records (ADRs)
- **[ROADMAP.md](./ROADMAP.md)** — Development phases and milestones
- **[TESTING.md](./TESTING.md)** — Testing strategy, coverage targets, running tests
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** — Accessibility requirements and audit
- **[SOUND-LICENSING.md](./SOUND-LICENSING.md)** — Audio asset sources and licenses
- **[PRIVACY.md](./PRIVACY.md)** — Privacy policy and data handling
- **[OPERATIONS.md](./OPERATIONS.md)** — Build, signing, and release procedures
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Development workflow and code style
- **[RELEASES.md](./RELEASES.md)** — Versioning, changelog, and store submission

## Performance Targets

- **Bundle Size**: < 2 MB (Web)
- **Audio Latency**: < 100ms first cue play
- **Frame Rate**: 60 FPS main UI, ≤ 10 Hz render throttle for ProgressRing
- **Memory**: < 50 MB on mobile
- **Test Coverage**: 90%+ for core state logic

## Browser Support

- **Web**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Web**: iOS Safari, Chrome Android

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions, please refer to the documentation files above.
