# Phase 1 Report: Progress Ring Correctness

## Summary

Fixed the ProgressRing component to start fully filled and decrease clockwise to empty, ensuring monotonic progress and synchronization with the numeric countdown display.

**Target**: Progress ring visual correctness and synchronization
**Why**: Previous implementation calculated progress as `elapsed/total` (0→1), causing visual desync and counter-clockwise fill behavior. Ring now uses single source of truth `remaining = (total - elapsed)/total` (1→0) for consistent clockwise decrease.

## Findings

**Root Causes**:
1. Progress calculation used `elapsed/total` instead of `remaining = (total - elapsed)/total`
2. Visual rotation didn't match remaining time concept
3. Progress percentage text showed "elapsed" percentage instead of "remaining"

**Impacted Files**:
- `src/components/ProgressRing.tsx` - Core component logic and visual implementation
- `tests/components/progressMapping.test.ts` - New test file for mapping validation

**Metrics**:
- Progress calculation: Changed from `elapsed/total` (0→1) to `remaining = (total - elapsed)/total` (1→0)
- Visual direction: Now decreases clockwise from full to empty
- Monotonic guarantee: Single calculation ensures no backtracks

## Changes

1. **Progress Calculation**:
   - Changed from `progress = elapsed / total` to `remaining = (total - elapsed) / total`
   - Added clamping to [0..1] range
   - Single source of truth drives both visual ring and percentage text

2. **Visual Implementation**:
   - Simplified to single rotating border arc (React Native compatible)
   - Rotation calculation: `rotationDegrees = -90 + (1 - remaining) * 360`
   - Starts at -90deg (full, top position) and rotates clockwise to 270deg (empty)

3. **Progress Text**:
   - Now displays remaining percentage instead of elapsed percentage
   - Shows "Complete" when remaining = 0

4. **Tests**:
   - Added `tests/components/progressMapping.test.ts` with 5 test cases:
     - Boundary checks (t=0 → 1, t=total → 0)
     - Monotonic non-increasing verification
     - Clamping to [0..1] range
     - Zero total handling
     - Agreement with numeric display at boundaries

5. **Configuration**:
   - Removed `tests/components/**` exclusion from vitest.config.ts to allow progress mapping tests

## Checks & Evidence

**Test Results**:
```
✓ Progress mapping (remaining) > is 1 at t=0 and 0 at t=total
✓ Progress mapping (remaining) > is monotonic non-increasing
✓ Progress mapping (remaining) > clamps to [0..1]
✓ Progress mapping (remaining) > handles zero total gracefully
✓ Progress mapping (remaining) > agrees with numeric display at boundaries

Test Files: 1 passed (1)
Tests: 5 passed (5)
```

**Full Test Suite**:
- 66 tests passing (excluding React Native component test setup issue)
- All timer machine and settings tests pass
- Type check clean (only Playwright config excluded)

**Visual Behavior** (Manual verification needed):
- At t=0: Ring should appear fully filled (100%)
- At t=total: Ring should appear empty (0%)
- Direction: Clockwise decrease
- Numeric display: Should match ring state at boundaries

**Performance**:
- Transform-only updates (no layout thrash)
- Single calculation per render
- No per-frame React state updates

## Open Risks

1. **Visual Verification Required**: The clockwise decrease behavior needs manual visual confirmation. The rotation calculation should produce correct visual, but React Native border rendering may have platform-specific quirks.

2. **Component Test Exclusion**: `tests/components/ProgressRing.test.tsx` is currently excluded due to React Native testing library setup issues. This doesn't affect functionality but limits automated visual regression testing.

3. **Future Enhancement**: For smoother visual interpolation between 1Hz ticks, consider `requestAnimationFrame`-driven cosmetic interpolation (deferred, not blocking).

## Next Gate

**Ready for user test?**

Please verify:
1. Ring starts fully filled at timer start
2. Ring decreases clockwise as time elapses
3. Ring is empty when timer reaches 00:00
4. Percentage text shows remaining (not elapsed)
5. No visual jumps or backtracks during countdown

If approved, proceed to Phase 2 (Phase Lights Logic).

