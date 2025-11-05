# Boxing Timer

A production-ready cross-platform timer app built with React Native + Expo for boxers and coaches.

## Quick Start

See [docs/README.md](./docs/README.md) for full documentation.

### Install & Run

```bash
npm install
npm run web  # Web PWA dev server
npm run ios  # iOS simulator
npm run android  # Android emulator
```

### Test & Build

```bash
npm run lint && npm run type-check && npm run test
npm run build:web  # Web PWA
npm run build:ios  # iOS (EAS)
npm run build:android  # Android (EAS)
```

## Documentation

- **[docs/README.md](./docs/README.md)** — Quick start, features, commands
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Design, state machine, timing model
- **[docs/DECISIONS.md](./docs/DECISIONS.md)** — Architecture decision records
- **[docs/ROADMAP.md](./docs/ROADMAP.md)** — Development phases
- **[docs/TESTING.md](./docs/TESTING.md)** — Testing strategy
- **[docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)** — Accessibility targets
- **[docs/SOUND-LICENSING.md](./docs/SOUND-LICENSING.md)** — Audio asset sources
- **[docs/PRIVACY.md](./docs/PRIVACY.md)** — Privacy policy
- **[docs/OPERATIONS.md](./docs/OPERATIONS.md)** — Build, signing, deployment
- **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** — Development workflow
- **[docs/RELEASES.md](./docs/RELEASES.md)** — Versioning and releases
- **[CLAUDE.md](./CLAUDE.md)** — Claude Code guidance

## Project Status

**Phase 0: Scaffold** ✅ Complete
- Expo setup, folder structure, documentation, config

**Phase 1: Core MVP** 🔄 In Progress
- Timer state machine, UI components, audio system, settings, tests

**Phase 2: Polish** ⏳ Planned
- Visuals, haptics, accessibility, E2E tests

**Phase 3: Release** ⏳ Planned
- Error handling, performance, deployment

## Tech Stack

- **React Native** + **Expo** (SDK LTS)
- **TypeScript** (strict mode)
- **NativeWind** (Tailwind-RN)
- **Zustand** (state management)
- **expo-av** (audio)
- **Vitest** + **Playwright** (testing)

## License

MIT License - see LICENSE file
