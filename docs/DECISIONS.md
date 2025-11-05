# Architecture Decision Records (ADRs)

## Decision 1: Zustand over Redux

**Context**: Need state management for timer state and settings.

**Decision**: Use Zustand for state management.

**Rationale**:
- Minimal boilerplate: single store creation vs Redux actions/reducers
- Tree-shakeable atomic selectors reduce component re-renders
- 2 KB minified vs 10+ KB Redux
- Sufficient for this use case: one timer store, one settings store
- Better DX for small-to-medium apps

**Alternatives Considered**:
- Redux: Overly complex for this scope
- Context API: Prone to re-render issues at scale
- Jotai: Also viable; Zustand chosen for simplicity

---

## Decision 2: React Native + Expo over React Web

**Context**: Need cross-platform app for iOS, Android, and Web.

**Decision**: Use React Native + Expo as foundation with React Native Web for browser.

**Rationale**:
- Single codebase for all platforms (iOS, Android, Web)
- Expo CLI simplifies development (no native toolchain setup)
- EAS Build for native without local Xcode/Android Studio
- Expo Router provides file-based routing (familiar to Web devs)
- React Native Web seamlessly bridges RN components to DOM

**Alternatives Considered**:
- Pure React Web + React Native SDK: More work, separate codebases
- Flutter/Kotlin: Different language, steeper learning curve
- Native iOS/Android: Massive code duplication

---

## Decision 3: NativeWind (Tailwind for RN) over StyleSheet

**Context**: Need styling solution that works across RN and Web.

**Decision**: Use NativeWind for utility-based styling with StyleSheet fallback.

**Rationale**:
- Tailwind's familiar API extends to React Native
- Automatic compilation of class names to RN StyleSheet
- Consistent design tokens across platforms
- No CSS-in-JS overhead for mobile performance
- Fallback to raw StyleSheet for complex transforms

**Alternatives Considered**:
- Styled Components: Runtime overhead, not optimized for RN
- CSS Modules: Web-only
- Raw StyleSheet: Verbose, hard to maintain

---

## Decision 4: Monotonic Time + 1 Hz Logic Tick

**Context**: Timer accuracy critical; setInterval drifts over time.

**Decision**: Use `performance.now()` for elapsed time, run logic tick every 1 second with drift correction.

**Rationale**:
- `performance.now()` is monotonic (never goes backward)
- More accurate than relying on setInterval alone
- `DriftCorrectingScheduler` corrects accumulated drift
- UI driven by `requestAnimationFrame` (smooth 60 FPS animation)
- Logic driven by 1 Hz tick (predictable state changes)

**Consequences**:
- Implementation slightly more complex
- Better accuracy over long timer sessions
- Minimal performance overhead

---

## Decision 5: Preload All Audio Assets

**Context**: Audio latency critical for gym timer; user expects instant playback.

**Decision**: Preload all audio assets (bell, double_bell, beep, horn) at app startup.

**Rationale**:
- First cue plays in < 100 ms (vs. 500+ ms if lazy-loaded)
- Cached `Audio.Sound` instances are reusable with `.replayAsync()`
- Subsequent cues play in < 50 ms
- Memory footprint minimal (4 small WAV files ~50 KB total)

**Alternatives Considered**:
- Lazy-load on first use: Too slow for gym timer
- Stream from network: Offline incompatible, network latency

---

## Decision 6: Infinite Rounds as Default

**Context**: Boxers often spar for variable durations; classic gym timer has no "rounds limit".

**Decision**: Default to infinite rounds (`null`); allow user to set fixed count.

**Rationale**:
- Matches user expectations (classic timer behavior)
- Flexible: can configure 3, 5, 12 rounds, etc.
- Simpler logic: transitions loop indefinitely until user stops
- Settings persist, so users can save their preferred round count

---

## Decision 7: Three-Light System (Green/Yellow/Red)

**Context**: Visual feedback for gym coach/boxer during intense activity.

**Decision**: Use exactly three lights (green for work, yellow for final seconds, red for rest).

**Rationale**:
- Matches classic gym mechanical timer (three domed beacons)
- High visibility from 3–5 m away
- No ambiguity: only one light ON at a time
- Supports colorblind users (can distinguish by position + brightness)
- Simple state machine (3 main states: work, yellow, rest)

---

## Decision 8: No Analytics, No Accounts

**Context**: Privacy-first approach; audience is gym users, not a SaaS platform.

**Decision**: No user accounts, no analytics, no network calls by default.

**Rationale**:
- Privacy compliance (no data collection)
- Offline-first: works without internet
- Simpler codebase (no auth, no backend)
- Trust: users own their data entirely
- Complies with GDPR/CCPA by default

**Opt-in Analytics**: If needed in future, implement as opt-in with clear consent.

---

## Decision 9: Dark Theme Only (Phase 0)

**Context**: Gym lighting is usually dim; timer must be visible in low light.

**Decision**: Implement dark theme only in Phase 0; add light theme if demanded.

**Rationale**:
- High contrast on dark background (white text, bright colors)
- Gym environment typically dark
- Simpler CSS (no dual theming overhead)
- Can add light theme in Phase 2 with minimal refactor

---

## Decision 10: ESLint + Prettier + Husky

**Context**: Need code quality, consistency, and pre-commit checks.

**Decision**: ESLint for rules, Prettier for formatting, Husky for pre-commit hooks.

**Rationale**:
- Industry standard stack
- Prettier enforces single style (no bikeshedding)
- Husky prevents bad commits (lint, type-check before commit)
- lint-staged runs checks only on changed files (fast)
- Easy to configure and remove

---

## Decision 11: Vitest + React Native Testing Library

**Context**: Need unit, component, and E2E testing framework.

**Decision**: Vitest for unit/component tests, Playwright for E2E, React Native Testing Library.

**Rationale**:
- Vitest: Fast, ESM-native, Vite-compatible
- React Native Testing Library: Encourages testing behavior over implementation
- Playwright: Cross-browser E2E, great web PWA support
- 90%+ coverage target for state logic (timerMachine.ts)

**Alternatives Considered**:
- Jest: Slower, more config; Vitest is modern replacement
- Detox: Requires real device/simulator; Playwright sufficient for smoke tests

---

## Decision 12: EAS Build for Native

**Context**: Build iOS/Android without local Xcode/Android Studio.

**Decision**: Use EAS Build for native app compilation.

**Rationale**:
- No native toolchain setup required
- Cloud builds: works on any machine
- Automatic signing/provisioning
- Free tier available for open-source
- Expo integration is seamless

---

## Future Decisions (Post-Phase 3)

- **Analytics Opt-in**: If usage tracking needed, implement as explicit opt-in
- **Cloud Sync**: Only if multi-device sync requested
- **Premium Features**: If business model needed, consider in-app purchases
- **Light Theme**: If iOS light mode popular, add toggle
- **Localization**: Initially English-only; add i18n if demanded

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation details.
