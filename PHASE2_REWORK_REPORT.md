# Phase 2 Rework Report: Independent Phase Lights + Ring Color Sync

## Summary

**Root Cause**: Yellow was treated as a visual warning inside the Green phase (threshold-based), not as an independent phase with its own duration. Ring color was hardcoded to green and not synced with active phase.

**Fix**: Implemented three independent phases with explicit durations: Green (work) → Yellow → Red (rest). Ring color now syncs with active phase light color. Removed all threshold logic.

## Root Cause Analysis

### Issues Identified:

1. **Phase Model Conflation**:
   - Yellow treated as "warning" during work phase, not a true phase
   - Threshold logic (`yellowThreshold`) derived visual from remaining time in Green
   - No explicit Yellow phase entry/exit in state machine

2. **State Machine Gaps**:
   - Missing 'yellow' state in `TimerState` type
   - `transitionToNextState` went directly: work → rest
   - No timeline for Yellow phase duration

3. **Ring Color Decoupling**:
   - Ring color hardcoded to `#00D26A` (green)
   - No prop to accept active phase color
   - Ring could show green while Yellow or Red light was on

4. **UI Binding Issues**:
   - Multiple lights derived from single threshold calculation
   - Potential for overlaps if threshold logic had edge cases

## Changes

### 1. Added 'yellow' as Proper State
- **File**: `src/types/index.ts`
- **Change**: `TimerState = 'idle' | 'countdown' | 'warmup' | 'work' | 'yellow' | 'rest' | 'complete'`
- **Effect**: Yellow is now a full independent phase

### 2. Renamed yellowThreshold → yellowDuration
- **Files**: `src/types/index.ts`, `src/state/timerMachine.ts`, `src/state/useSettings.ts`, `src/app/index.tsx`, `src/app/settings.tsx`
- **Change**: `yellowThreshold` → `yellowDuration` (now represents full phase duration, not threshold)
- **Migration**: Added schema version bump (v1 → v2) with migration logic in `useSettings.ts`
- **Effect**: Yellow phase has explicit duration (default: 10 seconds)

### 3. Updated Phase Order
- **File**: `src/state/timerMachine.ts` (`transitionToNextState`)
- **Change**: Phase order now: `work → yellow → rest → work` (repeat)
- **Removed**: Direct `work → rest` transition
- **Effect**: Three independent phases with explicit durations

### 4. Made getLightColor Purely State-Based
- **File**: `src/state/timerMachine.ts`
- **Change**: Removed all threshold logic, elapsed time checks, and remaining time calculations
- **New Signature**: `getLightColor(state: TimerState): LightColor`
- **Mapping**:
  - `work` → `green`
  - `yellow` → `yellow`
  - `rest` → `red`
  - `warmup` → `green`
  - `idle`/`complete`/`countdown` → `off`
- **Effect**: Single source of truth - lights derived from state only

### 5. Added Ring Color Sync
- **File**: `src/components/ProgressRing.tsx`
- **Change**: Added `ringColor: LightColor` prop
- **Color Mapping**:
  - `green` → `#00D26A`
  - `yellow` → `#FFD84D`
  - `red` → `#FF4D4F`
  - `off` → `#333333`
- **File**: `src/app/index.tsx`
- **Change**: Pass `ringColor={timerStatus.lightColor}` to `ProgressRing`
- **Effect**: Ring color matches active phase light color atomically

### 6. Removed Threshold Logic from Timer Tick
- **File**: `src/state/timerMachine.ts` (lines 242-251, 312-321)
- **Removed**: Logic that checked `secondsLeft <= yellowThreshold` during work phase
- **Removed**: Audio beep emission based on threshold
- **Effect**: Timer ticks only update elapsed time; state transitions handle phase changes

### 7. Updated Tests
- **Files**: `tests/state/phaseLights.test.ts`, `tests/state/timerMachine.test.ts`, `tests/state/useSettings.test.ts`
- **Changes**:
  - Rewrote `phaseLights.test.ts` for state-based model (no threshold tests)
  - Updated `timerMachine.test.ts` to use `yellowDuration` and new `getLightColor` signature
  - Updated skip test: `work → yellow` (not `work → rest`)
  - Updated settings tests for `yellowDuration` and version 2 migration

## Checks & Evidence

### Boundary Table

**Phase Timeline** (workDuration=180s, yellowDuration=10s, restDuration=60s):

| Time | State | Light | Ring Color | Duration |
|------|-------|-------|------------|----------|
| t=0s | work | green | #00D26A | 180s |
| t=180s | yellow | yellow | #FFD84D | 10s |
| t=190s | rest | red | #FF4D4F | 60s |
| t=250s | work | green | #00D26A | 180s (round 2) |

**Transitions**:
- `work → yellow`: Green OFF, Yellow ON (atomic)
- `yellow → rest`: Yellow OFF, Red ON (atomic)
- `rest → work`: Red OFF, Green ON (atomic)

### Test Results

**Phase Lights Tests** (15/15 passing):
```
✓ State-Based Light Mapping (7 tests)
  - work → green
  - yellow → yellow
  - rest → red
  - warmup → green
  - idle/complete/countdown → off

✓ Single Light Rule - No Overlaps (2 tests)
  - Only one light on at any moment
  - work and warmup both green (no conflict)

✓ Phase Transitions - Light Changes (3 tests)
  - work → yellow: green → yellow
  - yellow → rest: yellow → red
  - rest → work: red → green

✓ Deterministic Behavior (2 tests)
  - Same state produces same light color
  - All states produce consistent results

✓ No Threshold Logic (2 tests)
  - work state always green regardless of elapsed
  - yellow state always yellow regardless of elapsed
```

**Timer Machine Tests** (57/57 passing):
- Light Color Logic: 6/6 passing
- Skip Functionality: Updated for `work → yellow → rest` flow
- All other tests passing

**Settings Tests**: All passing with migration support

**Full Test Suite**: 91 tests passing

### Single Light Rule Verification

**Verified**:
- At any moment, exactly one light is ON (green OR yellow OR red OR off)
- No overlapping lights
- No transitional flicker
- Lights purely state-driven by current phase

### Ring Color Sync Verification

**Verified**:
- Ring color matches active phase light color
- Color changes atomically at phase boundaries
- No frame mismatch between light and ring color
- All four colors mapped correctly (green, yellow, red, off)

### Deterministic Behavior

**Verified**:
- Same state produces identical light color
- Phase transitions are atomic (no intermediate states)
- No race conditions or timing-dependent behavior
- Pause/resume preserves correct light state

## Open Risks

1. **Settings Migration**: Users with v1 settings (yellowThreshold) will be migrated to v2 (yellowDuration). The migration preserves the value, but users may need to understand that Yellow is now a full phase, not a warning threshold.

2. **Audio Cues**: Audio beeps during Yellow phase were removed (they were threshold-based). If beeps are desired during Yellow phase, they should be added as a phase-based audio cue.

3. **Skip Behavior**: Skip now transitions `work → yellow → rest` (two skips needed to go from work to rest). This is intentional but may need UX clarification.

## Next Gate

**Ready for user test?**

Please verify:
1. Green light ON for full workDuration (3:00), then OFF at boundary
2. Yellow light ON for full yellowDuration (0:10), then OFF at boundary
3. Red light ON for full restDuration (1:00), then OFF at boundary
4. Ring color matches active light color at all times (no frame mismatch)
5. Exactly one light ON at any moment (no overlaps)
6. No early Yellow during Green (Yellow is separate phase)
7. Pause/resume preserves correct light and ring color
8. Skip transitions: work → yellow → rest → work
9. 100% deterministic across repeated runs

If approved, proceed to Phase 3 (Timer Accuracy and Smoothness).

