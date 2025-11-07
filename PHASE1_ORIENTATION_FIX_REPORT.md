# Phase 1 Orientation Fix Report

## Summary

**Root Cause**: `strokeDashoffset` direction was inverted. Positive offset moves the visible portion forward along the path (counterclockwise for a clockwise path). To shrink clockwise, we need negative offset to shift the pattern backward.

**Fix**: Changed `dashoffset` calculation from `circumference * (1 - remaining)` to `-circumference * (1 - remaining)`. Negative offset shifts the dash pattern backward, hiding the clockwise portion as time progresses.

## Root Cause Analysis

### Issue Identified:

1. **Wipe Direction Mapping**:
   - SVG `strokeDashoffset` with positive values moves the visible portion forward along the path
   - For a clockwise circle path, positive offset moves visible portion clockwise (forward)
   - To shrink clockwise, we need to hide the clockwise portion, requiring negative offset

2. **Start Angle** (was correct):
   - `rotate(-90 ${center} ${center})` correctly positions start at 12 o'clock
   - Transform origin is correct (circle center)

3. **Progress Mapping** (was correct):
   - `remaining = (total - elapsed)/total` calculation was correct
   - Issue was dashoffset sign, not the progress calculation

## Changes

### 1. Inverted Dashoffset Sign
- **File**: `src/components/ProgressRing.tsx`
- **Change**: `dashoffset = circumference * (1 - remaining)` → `dashoffset = -circumference * (1 - remaining)`
- **Effect**: Negative offset shifts dash pattern backward, hiding clockwise portion

### 2. Updated Geometry Tests
- **File**: `tests/components/progressRingGeometry.test.ts`
- **Updated**: Tests now verify negative dashoffset values
- **Added**: Test for clockwise shrink direction verification

## Checks & Evidence

### Test Results

**Geometry Diagnostic Tests** (7/7 passing):
```
✓ calculates correct circumference (816.81)
✓ dashoffset is 0 at t=0 (full ring)
✓ dashoffset is negative circumference at t=total (empty ring)
✓ dashoffset is monotonic decreasing as remaining decreases (negative values)
✓ dasharray equals circumference for proper arc rendering
✓ rotation starts at -90deg (12 o'clock)
✓ dashoffset direction is correct for clockwise shrink
```

### Console Values (Expected)

**At t=0 (full ring)**:
```
radius: 130
circumference: 816.8140899333463
remaining: 1
dashoffset: 0
rotation: -90deg (transform rotate(-90 150 150))
```

**At t=total (empty ring)**:
```
radius: 130
circumference: 816.8140899333463
remaining: 0
dashoffset: -816.8140899333463
rotation: -90deg (fixed, arc wipes, doesn't rotate)
```

**At t=total/2 (half ring)**:
```
remaining: 0.5
dashoffset: -408.40704496667315 (negative 50% of circumference)
```

### Visual Behavior (Expected)

**At t=0**:
- ✅ Ring appears 100% full
- ✅ Start reference point at 12 o'clock (top center)
- ✅ No gaps except stroke cap

**From t=0→end**:
- ✅ Ring shrinks clockwise only
- ✅ No rotation of entire element (arc wipes, doesn't spin)
- ✅ Smooth monotonic decrease

**At phase end**:
- ✅ Ring is empty (0%)
- ✅ No lingering sliver
- ✅ Numeric countdown matches visual boundary

### Transform Verification

**SVG Circle Transform**:
```xml
<Circle
  transform="rotate(-90 150 150)"
  strokeDasharray="816.8140899333463"
  strokeDashoffset="-816.8140899333463" // (at t=end)
/>
```

- Transform rotates circle -90deg around center (150, 150)
- Start point moved from 3 o'clock to 12 o'clock
- No parent container rotation (only circle rotates)
- Center content (text) not affected by transform

### Performance

- **Single calculation**: `dashoffset` computed once per render
- **Transform-only**: SVG path updates via `strokeDashoffset` prop
- **No layout thrash**: SVG positioned absolutely
- **No per-frame React state**: Updates only on timer tick (1Hz)

## Open Risks

1. **Platform-specific SVG behavior**: Negative `strokeDashoffset` should work consistently across iOS/Android/Web, but visual verification needed.

2. **Stroke linecap at boundaries**: `strokeLinecap="round"` may cause slight visual offset. If exact pixel-perfect boundaries required, may need adjustment.

## Next Gate

**Ready for user test?**

Please verify:
1. Ring starts 100% full at t=0 with start point at 12 o'clock
2. Ring shrinks clockwise (not counter-clockwise)
3. Ring reaches exactly 0% at phase end (no lingering sliver)
4. Numeric countdown and ring boundary match within one frame
5. No unintended rotation (ring wipes, doesn't spin)
6. No frame hitches >100ms during 10s sample

If approved, proceed to Phase 2 (Phase Lights Logic).

