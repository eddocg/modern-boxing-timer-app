# Phase 3 Research Summary: Web Timing Best Practices

## Research Findings

### 1. requestAnimationFrame vs setInterval
**Sources**: MDN Web Performance, Stack Overflow, Game Development Best Practices

**Key Takeaways**:
- `requestAnimationFrame` synchronizes with browser refresh rate (~60 FPS), reducing frame drops
- Automatically pauses when tab is inactive, conserving resources
- Better CPU/GPU efficiency than `setInterval`
- Should use timestamp from RAF callback for time-based calculations

**Decision**: Use RAF for UI animation, keep `setInterval` with drift correction for 1 Hz logic ticks.

### 2. Background Tab Throttling & Visibility Handling
**Sources**: MDN Page Visibility API, Chrome DevTools Performance

**Key Takeaways**:
- `document.visibilitychange` fires when tab becomes hidden/visible
- Background tabs throttle timers to ~1 Hz (Chrome) or pause completely
- `performance.now()` continues but may be throttled
- Must recalculate elapsed time on visibility change to account for throttling

**Decision**: Already implemented visibility handlers. Add RAF pause when hidden.

### 3. Driftless Timing
**Sources**: High-Resolution Time API, Game Loop Patterns

**Key Takeaways**:
- Use absolute epoch (`performance.now()`) + accumulated pause time
- Never rely on frame counts or `setInterval` alone
- Calculate elapsed as: `(now - startEpoch - totalPausedTime) / 1000`
- Current implementation already correct ✓

**Decision**: Keep current monotonic time implementation.

### 4. Text Jitter Prevention
**Sources**: CSS Typography Best Practices, React Native Text Rendering

**Key Takeaways**:
- Proportional digits (1, 7) are narrower than others (0, 8), causing horizontal shift
- Solutions:
  - `font-variant-numeric: tabular-nums` (web CSS)
  - Monospace font family
  - Fixed-width container with centered text
- React Native: Use `fontFamily: 'monospace'` or fixed `width` + `textAlign: 'center'`

**Decision**: Add fixed-width container + monospace font for timeText.

### 5. GPU-Friendly Animation
**Sources**: CSS Triggers, Web Performance Best Practices

**Key Takeaways**:
- Only animate `transform` and `opacity` (compositor-only properties)
- Avoid `width`, `height`, `top`, `left` (trigger layout)
- Use `will-change: transform` sparingly
- SVG `strokeDashoffset` is transform-like, but verify it doesn't trigger layout

**Decision**: Current SVG implementation is good. Add `will-change` hint if needed.

## Chosen Approach

1. **Text Jitter**: Fixed-width container + monospace font
2. **RAF Optimization**: Use refs to update SVG directly, avoid React state updates per frame
3. **Visibility**: Pause RAF when hidden, resume on visible
4. **Performance**: Keep current transform-based animation, verify no layout triggers

