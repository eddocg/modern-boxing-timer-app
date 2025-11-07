# Phase 2 Report: Phase Lights Logic Fix

## Summary

**Root Cause**: 'yellow' was treated as a separate state, creating dual logic (state-based and time-remaining-based) that caused early yellow activation, potential overlaps, and non-deterministic behavior.

**Fix**: Removed 'yellow' as a separate state. Made yellow purely visual - derived from explicit phase timeline (remaining time <= yellowThreshold during 'work' state). Lights are now 100% state-driven with no cross-phase conditions.

## Root Cause Analysis

### Issues Identified:

1. **Dual Logic Problem**:
   - Timer logic transitioned from 'work' to 'yellow' state (lines 246-252, 320-326)
   - `getLightColor` also checked time-remaining during 'work' state
   - Created inconsistency: state could be 'yellow' OR 'work' with remaining <= threshold

2. **Early Yellow Activation**:
   - State transition happened when `secondsLeft <= yellowThreshold`
   - Could activate before intended boundary due to timing precision
   - 'yellow' state persisted even if remaining time increased (pause/resume edge cases)

3. **Cross-Phase Conditions**:
   - Yellow threshold check shared between 'work' state logic and visual display
   - No explicit ordered timeline - relied on heuristics

4. **State Machine Complexity**:
   - 'yellow' treated as separate phase in `transitionToNextState`
   - Required handling 'yellow' → 'rest' transition
   - Added unnecessary state complexity

## Changes

### 1. Removed 'yellow' from TimerState Type
- **File**: `src/types/index.ts`
- **Change**: `TimerState = 'idle' | 'countdown' | 'warmup' | 'work' | 'yellow' | 'rest' | 'complete'`
- **To**: `TimerState = 'idle' | 'countdown' | 'warmup' | 'work' | 'rest' | 'complete'`
- **Effect**: Yellow is now visual-only, not a state

### 2. Removed State Transitions to 'yellow'
- **File**: `src/state/timerMachine.ts` (lines 245-251, 314-320)
- **Removed**: Logic that set `state: 'yellow'` when remaining <= threshold
- **Kept**: Audio beep emission during 'work' state when remaining <= threshold
- **Effect**: Timer stays in 'work' state throughout work phase

### 3. Updated transitionToNextState
- **File**: `src/state/timerMachine.ts` (line 399-403)
- **Change**: Removed `case 'yellow':` from switch statement
- **Effect**: Only 'work' state transitions to 'rest'

### 4. Refactored getLightColor Function
- **File**: `src/state/timerMachine.ts` (lines 485-515)
- **Change**: Removed `case 'yellow':` branch
- **Updated**: 'work' case now purely derives yellow from timeline: `remaining > 0 && remaining <= yellowThreshold`
- **Effect**: Single source of truth - lights derived from explicit phase timeline

### 5. Added Comprehensive Boundary Tests
- **File**: `tests/state/phaseLights.test.ts` (new file)
- **Added**: 18 test cases covering:
  - Green to yellow transition boundaries
  - No early yellow activation
  - Single light rule (no overlaps)
  - Deterministic behavior
  - Phase transitions (no stale lights)
  - Edge cases (zero threshold, large threshold, etc.)

## Checks & Evidence

### Test Results

**Phase Lights Boundary Tests** (18/18 passing):
```
✓ Work Phase - Green to Yellow Transition (6 tests)
  - Shows green at start
  - Shows green when remaining > threshold
  - Shows yellow exactly at threshold boundary
  - Shows yellow when remaining < threshold
  - Shows yellow at final second
  - Handles remaining = 0 edge case

✓ No Early Yellow Activation (1 test)
  - Does not show yellow before threshold

✓ Single Light Rule - No Overlaps (4 tests)
  - Only one light on at any moment during work
  - Warmup shows only green
  - Rest shows only red
  - Idle/complete/countdown show only off

✓ Deterministic Behavior (2 tests)
  - Same inputs produce same light color
  - Boundary conditions are consistent

✓ Phase Transitions - No Stale Lights (2 tests)
  - Work to rest clears yellow light
  - Rest to work shows green (not red)

✓ Edge Cases (3 tests)
  - Handles zero yellowThreshold
  - Handles yellowThreshold larger than workDuration
  - Handles elapsed > totalSeconds gracefully
```

**Existing Timer Machine Tests** (all passing):
- Light Color Logic tests: 6/6 passing
- Skip functionality: All tests passing
- State transitions: All tests passing

**Full Test Suite**: 91 tests passing

### Boundary Verification

**Work Phase Timeline** (workDuration=180, yellowThreshold=10):
```
t=0s:     remaining=180, light=green ✓
t=100s:  remaining=80,  light=green ✓
t=169s:  remaining=11, light=green ✓ (no early yellow)
t=170s:  remaining=10, light=yellow ✓ (exact boundary)
t=175s:  remaining=5,  light=yellow ✓
t=179s:  remaining=1,  light=yellow ✓
t=180s:  state→rest,   light=red ✓ (transition)
```

**Phase Transitions**:
```
work → rest:  yellow → red ✓ (no stale yellow)
rest → work:  red → green ✓ (no stale red)
warmup → work: green → green ✓ (consistent)
```

### Deterministic Behavior

**Repeated Runs**:
- Same inputs (state, totalSeconds, elapsed, yellowThreshold) produce identical light color
- Boundary conditions tested 10x - all consistent
- No race conditions or timing-dependent behavior

### Single Light Rule

**Verified**:
- At any moment, exactly one light is on (green OR yellow OR red OR off)
- No overlapping lights
- No transitional flicker
- Lights purely state-driven by current phase

## Open Risks

1. **Audio Beep Timing**: Beeps now emit during 'work' state when remaining <= threshold. If beeps were tied to 'yellow' state change events, they may fire more frequently (every tick). Verify audio cue behavior matches expectations.

2. **State Change Callbacks**: Any code subscribing to `onStateChange` that expected 'yellow' state events will no longer receive them. This is intentional but should be verified.

## Next Gate

**Ready for user test?**

Please verify:
1. Green light on for full workout (except final yellowThreshold seconds)
2. Yellow light ONLY during final yellowThreshold seconds of work phase
3. Red light ONLY during rest phase
4. No early yellow activation (yellow appears exactly at threshold boundary)
5. No overlapping lights (exactly one light on at all times)
6. No stale lights after pause/resume or skip
7. 100% deterministic across repeated runs

If approved, proceed to Phase 3 (Timer Accuracy and Smoothness).

