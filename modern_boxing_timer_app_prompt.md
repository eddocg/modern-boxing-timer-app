Paste this as your very first message to Claude.

```
You are my senior cross‑platform engineer and delivery lead. Build a production‑ready “Boxing Timer” app that mimics a classic gym mechanical timer: three lights only (green=work, yellow=final‑seconds speed‑up, red=rest), loud gym sounds, simple controls, iOS‑like look. Ship in phases with repo docs, tests, and CI.

CRITICAL GUARDRAILS
- Do NOT create, initialize, commit, push, fork, or open PRs on GitHub or any remote service. Generate code and files only; I will handle VCS locally.
- Do NOT run the dev server, simulators, or any long‑running tasks. Never auto‑start the app. Provide commands only; I will run them in a separate terminal.
- The circular timer must visibly reduce once per second and complete a full sweep per interval, showing time left until the next light. The progress arc updates every second and is monotonic.
- Keep audio assets small and license‑clear. No network calls. No analytics by default. No deprecated Expo modules.

CONTEXT AND REFERENCES
- Visual references:
  1) Mechanical unit with three domed beacons (red/yellow/green).
  2) Minimal iOS‑style circular timer UI.
  Use these for color, spacing, and composition. Keep the UI dark, high‑contrast, rounded, large touch targets.
- Audience: boxers and coaches. Must be readable from 3–5 m.
- Platforms: Web (desktop/tablet/phone as PWA), Android, iOS, tablets.
- Default behavior: runs indefinitely until stopped.

TECH STACK (use exactly this unless there is a blocking reason)
- React Native + Expo (SDK LTS), Expo Router, React Native Web for browser.
- TypeScript strict mode.
- Styling: NativeWind (Tailwind‑RN) utilities; fallback to StyleSheet for perf.
- State: Zustand or Jotai; no Redux unless needed.
- Sounds: expo‑av with preloaded WAV/OGG assets; ensure low‑latency playback.
- Timers: requestAnimationFrame + performance.now() for smooth progress; a resilient scheduler for logic ticks that corrects setInterval drift; visible arc updates every 1s.
- Icons: @expo/vector-icons. Settings gear at top right.
- Build: EAS for native, static export for Web (PWA).
- Testing: Vitest + React Native Testing Library; Playwright for Web E2E; Detox optional.
- CI: GitHub Actions config file only (do NOT push it). Runs tests and builds web preview artifacts locally.
- Lint/format: ESLint, Prettier, Husky + lint-staged.
- License: MIT unless told otherwise.

FUNCTIONAL SPEC
A) Core views
1) Timer Screen (default)
   - Title “BOXING TIMER.”
   - Huge circular progress ring with remaining time large in center (mm:ss).
   - Subtext: current round “01/∞” or “01/12.”
   - Three‑light module above the ring. Exactly one light ON at a time using solid fill + glow:
     * Green: Working interval.
     * Yellow: last N seconds of work (configurable, default 10s).
     * Red: Rest interval.
   - Big primary button (Play/Pause/Resume) centered bottom.
   - Keep-Awake while running.
   - Settings gear at top right.

2) Settings Screen
   - Rounds: number input with “∞” option (default ∞).
   - Work duration (default 3:00), Rest duration (default 1:00).
   - Yellow threshold during work (default 0:10 left).
   - Warmup (optional, default 0).
   - Sound pack selector (Boxing Bell, MMA Horn, Beep). Volume slider max loud preset.
   - Vibration toggle.
   - 3‑2‑1 pre‑start countdown toggle.
   - Background limits note.

B) Sounds and cues
- Start: single bell.
- Work→Yellow threshold: short beep each second in final countdown.
- Work→Rest: double bell.
- Rest→Work: single bell.
- End of session: long horn.
- Preload all assets; include a “Test sound” button in settings.

C) Timer logic/state machine
States: idle → countdown(optional) → work → yellow(substate of work) → rest → complete or back to work.
- Use monotonic timestamps for accurate elapsed time.
- Logic tick: 1 Hz heartbeat with drift correction; UI progress driven by elapsed/total.
- Persist config in async storage; optionally persist last timestamps to allow resume.

D) Accessibility and UX
- Large text, WCAG AA contrast, Dynamic Type.
- Announce state changes for screen readers.
- Haptics on transitions when supported.
- Single‑hand use. Minimal clutter.

E) Performance/latency guardrails
- Monotonic deltas; never rely solely on setInterval.
- Preload and reuse Audio.Sound instances.
- Throttle re‑renders to ≤10 Hz for the ring; animate with derived value.
- Validate audio latency on Web, Android, iOS.

DELIVERABLES BY PHASE
Phase 0 — Project scaffold
- Create Expo app with TypeScript, Router, NativeWind, ESLint/Prettier, Husky, Vitest, Playwright.
- Add folder structure and run a hello‑world build (provide commands only; do not run).
- Ship docs listed in “Repository structure & docs.”

Phase 1 — Core timer MVP
- Implement state machine, ring with 1‑second visible tick, and three‑light component.
- Implement sounds with preload and cues.
- Settings with work/rest/rounds/yellow‑threshold; persist config.
- Keep‑Awake; pause/resume; reset.
- Web PWA manifest and icons.

Phase 2 — Polish
- iOS‑style visuals, shadows, haptics.
- Final sound assets and volume control.
- Accessibility audit and fixes.
- E2E smoke tests; CI green on PR.

Phase 3 — Release hardening
- Error boundary, offline behavior, resilience tests.
- Bundle size check, performance profiling.
- Versioning strategy and CHANGELOG.
- Test builds: EAS for iOS/Android; static web export.

REPOSITORY STRUCTURE & DOCS
- /docs
  - README.md — quick start, features, screenshots, run/build commands.
  - ARCHITECTURE.md — state machine, component tree, timing model, audio pipeline.
  - DECISIONS.md — ADRs.
  - ROADMAP.md — phases, milestones, backlog.
  - TESTING.md — unit, integration, E2E.
  - ACCESSIBILITY.md — targets, checks, test plan.
  - SOUND-LICENSING.md — sources and licenses.
  - PRIVACY.md — no accounts, no personal data; analytics opt‑in only.
  - OPERATIONS.md — builds, signing, release checklist.
  - CONTRIBUTING.md — branching, PR checks, code style.
  - RELEASES.md — versioning, changelog policy, store notes template.
- /src
  - app/
    - index.tsx (TimerScreen)
    - settings.tsx (SettingsScreen)
  - components/
    - LightBeacon.tsx
    - ProgressRing.tsx
    - PrimaryButton.tsx
  - state/
    - timerMachine.ts (deterministic FSM + selectors)
    - useSettings.ts
  - audio/
    - index.ts (preload, playCue, volume)
    - assets/ (bell.wav, double_bell.wav, horn.wav, beep.wav)
  - utils/time.ts
  - theme/tokens.ts
- /e2e (Playwright)
- /tests (Vitest)
- .github/workflows/ci.yml (generate file but do not run; I will push later)

ACCEPTANCE CRITERIA
- Visual: three lights functionally accurate; circular ring matches iOS‑like sample and visibly decreases every second.
- Functional: infinite rounds by default; configurable work/rest/rounds/yellow; loud sounds at correct edges; pause/resume/reset reliable; persisted config.
- Platform: builds for Web PWA, Android, iOS; audio plays instantly at first cue.
- Quality: 90%+ statements for core state logic; all tests pass locally via command.

TASKS TO START NOW
1) Scaffold Expo app and output repo tree and initial docs.
2) Implement timerMachine with unit tests first.
3) Implement LightBeacon and ProgressRing with 1‑Hz progress tick using monotonic time.
4) Wire sounds with preload and cues; add “Test sound.”
5) Output Phase 1 PR content as a patchset in the reply (files + code + commands). Do NOT run anything.

OUTPUT FORMAT
- First: print the repo tree and all .md files with initial content.
- Then: provide complete Phase 1 source code organized by files.
- Provide exact commands to install deps, run tests, start web/ios/android (as text only), build Web PWA, and build native with EAS.
- Conclude with a short local verification checklist.

COLOR TOKENS
- green #00D26A, yellow #FFD84D, red #FF4D4F, background #0B0B0C. Ensure WCAG AA.

If any requirement conflicts with Expo limitations, state it clearly and propose the smallest viable alternative that preserves UX.
```

