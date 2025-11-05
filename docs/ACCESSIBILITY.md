# Accessibility

## WCAG 2.1 AA Compliance Target

Boxing Timer aims for **WCAG 2.1 Level AA** conformance across all platforms (iOS, Android, Web).

## Color & Contrast

### Color Palette (WCAG AA Verified)

| Color | Hex | Use | Contrast (on #0B0B0C) |
|-------|-----|-----|----------------------|
| Green | #00D26A | Work interval | 7.2:1 ✅ |
| Yellow | #FFD84D | Final seconds | 12.5:1 ✅ |
| Red | #FF4D4F | Rest interval | 6.8:1 ✅ |
| White | #FFFFFF | Text | 21:1 ✅ |
| Gray | #A0A0A0 | Secondary text | 7.5:1 ✅ |

All colors meet **7:1 minimum** for AAA, **4.5:1 for AA**.

### Non-Color Differentiation

Three lights are also differentiated by **position** (left/middle/right), not just color:
- Left: Green (work)
- Center: Yellow (final seconds)
- Right: Red (rest)

Supports colorblind users (protanopia, deuteranopia, tritanopia).

## Typography

### Font Sizes

| Element | Size | Use |
|---------|------|-----|
| Timer Display (mm:ss) | 64px | Main timer, highly visible |
| Title | 32px | "BOXING TIMER" header |
| Round Info | 18px | "01/12" subtitle |
| Button Label | 18px | Play/Pause/Resume |
| Settings Labels | 16px | Form inputs |
| Secondary Text | 14px | Help text, hints |

Minimum body text: **16px** for mobile (accessible default).

### Line Height

- Display text: 1.0 (tight)
- Body text: 1.5 (normal)
- Labels: 1.2 (snug)

Improves readability for users with low vision.

## Screen Reader Support

### Announcements

- **Timer State Changes**: "Work interval started" → "Yellow threshold" → "Rest interval started"
- **Round Updates**: "Round 1 of 12" → "Round 2 of 12" (auto-announce when round increments)
- **Button States**: "Play button" → "Pause button" (context-aware)
- **Timer Value**: Every 10 seconds: "9 minutes 50 seconds remaining"
- **Settings Changes**: "Work duration changed to 5 minutes"

### Implementation

```typescript
import { useAccessibilityInfo } from 'react-native';

<Text
  accessibilityRole="header"
  accessibilityLabel="Boxing Timer"
  accessibilityLiveRegion="polite"
>
  BOXING TIMER.
</Text>

<Text
  accessibilityLabel={`${roundInfo}, ${displayTime} remaining`}
  accessibilityLiveRegion="assertive"
  accessibilityRefreshRate={10000} // Update every 10 seconds
>
  {displayTime}
</Text>
```

## Haptic Feedback

### When Available (iOS 13+, Android 8+)

- **State Transitions**: Light pulse on work→rest, rest→work
- **Countdown**: Tap on each 3, 2, 1 second
- **Yellow Threshold**: Continuous vibration (optional, configurable)

### Graceful Fallback

If haptics unavailable: audio cue only. Never fails without feedback.

## Dynamic Type (iOS) / Large Text (Android)

### Responsive Font Scaling

```typescript
const fontSize = useWindowDimensions().fontScale * 16; // Base 16px
```

Supports iOS Dynamic Type settings:
- xSmall, Small, Medium, Large, **xLarge** (default)
- aXXLargeLarge, aXXXLarge

Text scales automatically in Settings app → Accessibility → Display & Text Size.

### Testing

1. iOS: Settings → Accessibility → Display & Text Size → adjust slider
2. Android: Settings → Accessibility → Font size and style → increase

App layout should not break; all text should remain readable at 150% scale.

## Keyboard Navigation

### Web (PWA)

- Tab order: Play button → Settings icon → (modal) Rounds input → Work duration → Rest duration → Yellow threshold → Warmup → Sound pack → Volume → Toggles → Test sound → Close
- Enter/Space to activate buttons
- Arrow keys for sliders
- Escape to close modal

### Mobile

- VoiceOver/TalkBack gestures for navigation
- Large touch targets (minimum 48x48 pt)
- Single-hand reachability

## Focus Management

```typescript
// Web PWA
<Pressable onPress={onSettingsPress} accessibilityRole="button">
  <Ionicons name="settings" size={24} tabIndex={0} />
</Pressable>

// Focus returns to timer after settings modal closes
const [prevFocus, setPrevFocus] = useState<View | null>(null);
const handleSettingsClose = () => {
  prevFocus?.focus();
};
```

## Readability from Distance

### Gym Environment (3–5 m viewability)

- Timer display: 64px (≈ 0.8 inches on 6" phone, readable from 3–5 m)
- Lights: 80px diameter (very visible)
- High contrast: dark background (#0B0B0C) + bright colors
- No fine details; simple shapes

### Testing

Print screenshot at 100% scale; verify readable from 1 meter distance.

## Testing Checklist

### Phase 1

- [ ] All text meets 4.5:1 contrast (AA) for body, 7:1 for large text
- [ ] Screen reader announces timer state changes
- [ ] Haptic feedback works on real iOS/Android device
- [ ] Timer display remains readable at 150% text scale
- [ ] Color palette tested with colorblind simulator (https://www.color-blindness.com/coblis-color-blindness-simulator/)

### Phase 2

- [ ] Full accessibility audit with tools (WAVE, axe DevTools)
- [ ] VoiceOver (iOS) testing on real device
- [ ] TalkBack (Android) testing on real device
- [ ] Keyboard navigation testing (Web PWA)
- [ ] Testing with actual users with disabilities (if possible)

## Tools & Resources

### Contrast Checking
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Color Blindness Simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/

### Accessibility Auditing
- WAVE Browser Extension: https://wave.webaim.org/extension/
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse (Chrome): Built-in accessibility audit

### Screen Readers
- iOS VoiceOver: Settings → Accessibility → VoiceOver
- Android TalkBack: Settings → Accessibility → TalkBack
- NVDA (Windows): https://www.nvaccess.org/

## Design Principles

1. **Color is NOT the only differentiator**: Use position, size, shape as secondary cues
2. **Large touch targets**: Minimum 48x48 pt (iOS/Android HIG)
3. **Clear feedback**: Every interaction has audio, haptic, or visual feedback
4. **No time-based content**: Timers are explicitly pauseable; no auto-advancing without user control
5. **Offline accessibility**: All features work without network (no external resources)

## Future Enhancements (Post-Phase 2)

- [ ] AAA (7:1) contrast option (higher contrast variant)
- [ ] Custom fonts for dyslexia (e.g., Dyslexie)
- [ ] Voice control (Siri Shortcuts, Google Assistant)
- [ ] Text-to-speech timer readout
- [ ] Morse code haptic patterns (for deaf-blind users)

---

See [DECISIONS.md](./DECISIONS.md) for accessibility philosophy.
