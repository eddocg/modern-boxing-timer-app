# Phase 1 Rework Report: Progress Ring Visual Fix

## Summary

**Root Cause**: Border-based implementation only rendered a quarter-circle (top-right quadrant) and rotated the entire element, causing "orbiting" instead of "wiping". The border approach cannot display a full circle.

**Fix**: Replaced border-based approach with SVG using `stroke-dasharray`/`stroke-dashoffset` for proper arc rendering. Ring now starts at 100% (full) and decreases clockwise to 0% (empty).

## Root Cause Analysis

### Primary Issues Identified:

1. **Geometry Mismatch**:
   - Border approach only set `borderTopColor` and `borderRightColor`, creating a quarter-circle
   - Cannot render full 360° circle with borders
   - No `strokeDasharray`/`strokeDashoffset` equivalent

2. **Orientation/Anchor**:
   - Entire border element rotated, causing "orbiting" effect
   - No fixed anchor point for arc wiping
   - Transform applied to container, not arc path

3. **Progress Mapping** (was correct):
   - `remaining = (total - elapsed)/total` calculation was correct
   - Issue was visual implementation, not math

## Changes

### 1. Replaced Border Approach with SVG
- **File**: `src/components/ProgressRing.tsx`
- **Added**: `react-native-svg` dependency
- **Implementation**: SVG `<Circle>` with `strokeDasharray` and `strokeDashoffset`

### 2. Geometry Calculations
```typescript
const radius = 130;
const circumference = 2 * Math.PI * radius; // ≈ 816.81
const dashoffset = circumference * (1 - remaining);
```

### 3. Visual Behavior
- **strokeDasharray**: Set to `circumference` (full circle length)
- **strokeDashoffset**: 
  - `remaining=1` → `dashoffset=0` (full circle visible)
  - `remaining=0` → `dashoffset=circumference` (empty)
- **Transform**: `rotate(-90 ${center} ${center})` to start at 12 o'clock
- **Direction**: Clockwise decrease as `dashoffset` increases

### 4. Strict Clamping
- `remaining` clamped to `[0, 1]` to prevent negative or >1 values
- Snaps to exact 0 at boundary to prevent lingering sliver

### 5. Diagnostic Tests
- **File**: `tests/components/progressRingGeometry.test.ts`
- Verifies: circumference calculation, dashoffset at boundaries, monotonicity

## Checks & Evidence

### Test Results

**Progress Mapping Tests** (5/5 passing):
```
✓ is 1 at t=0 and 0 at t=total
✓ is monotonic non-increasing
✓ clamps to [0..1]
✓ handles zero total gracefully
✓ agrees with numeric display at boundaries
```

**Geometry Diagnostic Tests** (6/6 passing):
```
✓ calculates correct circumference (816.81)
✓ dashoffset is 0 at t=0 (full ring)
✓ dashoffset equals circumference at t=total (empty ring)
✓ dashoffset is monotonic increasing as remaining decreases
✓ dasharray equals circumference for proper arc rendering
✓ rotation starts at -90deg (12 o'clock)
```

### Console Values (Expected)

**At t=0 (full ring)**:
```
radius: 130
circumference: 816.8140899333463
remaining: 1
dashoffset: 0
rotation: -90deg
```

**At t=total (empty ring)**:
```
radius: 130
circumference: 816.8140899333463
remaining: 0
dashoffset: 816.8140899333463
rotation: -90deg (fixed, arc wipes, doesn't rotate)
```

**At t=total/2 (half ring)**:
```
remaining: 0.5
dashoffset: 408.40704496667315 (circumference * 0.5)
```

### Visual Verification (Manual)

**Expected Behavior**:
- ✅ Ring starts fully filled (100%) at t=0
- ✅ Ring decreases clockwise (not counter-clockwise)
- ✅ Ring reaches 0% exactly at phase end
- ✅ No rotation of entire element (arc wipes, doesn't spin)
- ✅ Numeric countdown matches ring boundary

### Performance

- **Transform-only updates**: SVG path updates via `strokeDashoffset` prop
- **No layout thrash**: SVG positioned absolutely, no reflow
- **Single calculation per render**: `dashoffset` computed once from `remaining`
- **No per-frame React state**: Updates only on timer tick (1Hz)

## Open Risks

1. **Platform-specific SVG rendering**: `react-native-svg` may have slight rendering differences between iOS/Android/Web. Visual verification needed on all platforms.

2. **Stroke linecap**: Using `strokeLinecap="round"` may cause slight visual offset at boundaries. If exact pixel-perfect boundaries are required, may need adjustment.

3. **Transform syntax**: Using string template for `transform` prop. If `react-native-svg` version changes, may need to use object syntax instead.

## Next Gate

**Ready for user test?**

Please verify:
1. Ring appears 100% full at t=0 (no gaps except stroke cap)
2. Ring shrinks clockwise (not counter-clockwise)
3. Ring reaches exactly 0% at phase end (no lingering sliver)
4. Numeric countdown and ring boundary match within one frame
5. No unintended rotation (ring wipes, doesn't spin)
6. No frame hitches >100ms during 10s sample

If approved, proceed to Phase 2 (Phase Lights Logic).

