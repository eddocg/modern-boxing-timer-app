# Roadmap

## Phase 0: Project Scaffold (Current)

**Goal**: Foundation and documentation

- [x] Expo project initialization with TypeScript
- [x] Folder structure and configuration files
- [x] ESLint, Prettier, Husky setup
- [x] Documentation (11 files)
- [x] Component and state store scaffolds
- [x] Theme tokens and type definitions
- [x] Audio and timer utilities

**Deliverables**: Buildable project structure, ready for Phase 1 code

**Estimated Duration**: 1-2 days (scaffolding)

---

## Phase 1: Core MVP

**Goal**: Functional timer with all core features

### Timer Logic
- [ ] Implement deterministic FSM with full state transitions
- [ ] Monotonic time tracking with `performance.now()`
- [ ] 1 Hz logic tick with `DriftCorrectingScheduler`
- [ ] Pause/resume/reset functionality
- [ ] 90%+ unit test coverage for `timerMachine.ts`

### UI Components
- [ ] `ProgressRing`: Circular arc with SVG, requestAnimationFrame animation
- [ ] `LightBeacon`: Three lights with opacity states
- [ ] `PrimaryButton`: Play/Pause/Resume with haptic feedback
- [ ] `TimerScreen`: Full layout with all components
- [ ] `SettingsScreen`: Form with all configuration options

### Audio System
- [ ] Integrate `expo-av` with preload strategy
- [ ] Implement `AudioManager` with cue triggers
- [ ] Wire audio cues to state transitions
- [ ] Add "Test sound" button in Settings
- [ ] Support 3 sound packs (Boxing Bell, MMA Horn, Beep)

### Settings & Persistence
- [ ] AsyncStorage integration for config persistence
- [ ] Default values (3:00 work, 1:00 rest, ∞ rounds, etc.)
- [ ] Settings screen inputs (rounds, durations, thresholds)
- [ ] Volume control

### Platform Features
- [ ] `expo-keep-awake` integration (stay on while running)
- [ ] Web PWA manifest and icons
- [ ] iOS/Android app icons and splash screens

### Testing
- [ ] Unit tests for `timerMachine.ts`, `useSettings.ts`, utilities
- [ ] Component tests for ProgressRing, LightBeacon
- [ ] Playwright smoke tests (start, pause, resume, settings)

**Deliverables**: Fully functional timer app, 90%+ state logic coverage

**Estimated Duration**: 5-7 days

---

## Phase 2: Polish & Accessibility

**Goal**: Production-ready UX with accessibility and final audio

### Visual Polish
- [ ] iOS-style shadows and rounded corners
- [ ] Glow effects on active lights
- [ ] Smooth animations and transitions
- [ ] Dark theme refinement (high contrast validation)
- [ ] Typography and spacing refinement

### Audio & Haptics
- [ ] Record/source final audio assets (boxing bell, horn, beep)
- [ ] Verify licensing and add to SOUND-LICENSING.md
- [ ] Volume slider with preset levels
- [ ] Haptic feedback on state transitions
- [ ] Audio latency validation on Web, iOS, Android

### Accessibility
- [ ] Screen reader announcements (state changes, timer value)
- [ ] Dynamic Type support (responsive font scaling)
- [ ] Contrast verification (WCAG AA for all colors)
- [ ] Haptic feedback as fallback for sound
- [ ] Focus management for keyboard navigation

### Testing
- [ ] Full E2E smoke test suite (Playwright)
- [ ] Manual accessibility testing (VoiceOver, TalkBack)
- [ ] Performance profiling (memory, render time)
- [ ] CI integration (GitHub Actions)

**Deliverables**: Polished, accessible, production-ready app

**Estimated Duration**: 3-4 days

---

## Phase 3: Release Hardening

**Goal**: Deploy-ready with reliability and performance optimizations

### Error Handling & Resilience
- [ ] Error boundary component
- [ ] Graceful fallback for missing audio
- [ ] Offline mode testing
- [ ] Session recovery (resume from paused state)

### Performance & Bundle
- [ ] Bundle size analysis and optimization
- [ ] Code splitting for web
- [ ] Memory leak detection
- [ ] Image optimization (PWA icons)

### Versioning & Documentation
- [ ] Semantic versioning strategy (1.0.0)
- [ ] CHANGELOG.md with Phase 1-3 summary
- [ ] Release notes template (for App Store/Play Store)
- [ ] Deployment checklist in OPERATIONS.md

### Build & Testing
- [ ] Test Web PWA export (static files)
- [ ] Test iOS build with EAS (sign for TestFlight)
- [ ] Test Android build with EAS (APK and AAB)
- [ ] Real device testing (iPhone, Android phone)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

**Deliverables**: Production builds ready for submission

**Estimated Duration**: 2-3 days

---

## Post-Phase 3 Backlog (Future Enhancements)

- [ ] Light theme variant
- [ ] Localization (Spanish, French, Portuguese, etc.)
- [ ] Cloud sync (if multi-device requested)
- [ ] Analytics opt-in (privacy-respecting)
- [ ] History/stats tracking (past sessions)
- [ ] Custom intervals (non-round-based timer)
- [ ] Preset templates (HIIT, Sparring, Training)
- [ ] Watch app (WearOS, watchOS)
- [ ] Offline analytics

---

## Acceptance Criteria (All Phases)

**Phase 1**
- ✅ Circular timer visibly ticks every 1 second
- ✅ Three lights work correctly (green, yellow, red)
- ✅ Sounds play at correct transitions
- ✅ Settings persist across sessions
- ✅ Pause/resume/reset reliable
- ✅ 90%+ state logic coverage

**Phase 2**
- ✅ App passes accessibility audit (WCAG AA)
- ✅ All E2E tests pass
- ✅ Audio latency < 100 ms (first cue), < 50 ms (subsequent)
- ✅ UI renders at 60 FPS
- ✅ App looks polished on iOS and Android

**Phase 3**
- ✅ Bundle size < 2 MB (Web)
- ✅ All tests pass (unit, component, E2E)
- ✅ Builds successfully for Web, iOS, Android
- ✅ Offline mode works
- ✅ Error handling is robust

---

## Timeline Summary

| Phase | Duration | Key Milestone |
|-------|----------|---------------|
| 0     | 1-2 days | Scaffold complete, documentation ready |
| 1     | 5-7 days | MVP complete, core features working |
| 2     | 3-4 days | Polish, accessibility, final audio |
| 3     | 2-3 days | Release hardening, production builds |
| **Total** | **11-16 days** | **Ready for app store submission** |

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [DECISIONS.md](./DECISIONS.md) for context.
