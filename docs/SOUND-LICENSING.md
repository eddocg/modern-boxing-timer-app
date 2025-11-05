# Sound Licensing

All audio assets in Boxing Timer are licensed under **CC0 (public domain)** or **MIT license** to ensure free commercial use.

## Audio Assets

### Phase 0 (Placeholder)

Currently using silence or system sounds for testing.

### Phase 1 (Production Assets)

All assets to be sourced from:

| Asset | Source | License | Notes |
|-------|--------|---------|-------|
| **bell.wav** | TBD | CC0/MIT | Single boxing bell strike, ~200ms |
| **double_bell.wav** | TBD | CC0/MIT | Two quick bell strikes, ~400ms |
| **beep.wav** | TBD | CC0/MIT | Short beep for yellow threshold countdown, ~100ms |
| **horn.wav** | TBD | CC0/MIT | Long horn for session end, ~1s |

### Recommended Sources

1. **Freesound.org** (with CC0/CC-BY license)
   - Search: "boxing bell", "timer bell", "air horn"
   - Verify license before download

2. **Zaps.Audio** (royalty-free)
   - High-quality gym sounds
   - Verify commercial use allowed

3. **BBC Sound Effects Library** (CC0)
   - Historic sound archive
   - https://sound-effects.bbcrewind.co.uk/

4. **OpenGameArt.org** (CC0/MIT)
   - Game sound effects
   - Verify license per asset

## Asset Specifications

### Audio Format

- **Format**: WAV (uncompressed) or OGG (compressed)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono (single speaker)
- **Target Size**: < 50 KB per file (after compression)

### Quality Criteria

- **Clarity**: Bell and horn should be distinct and loud
- **Latency**: Must play within 100 ms of trigger
- **Background Noise**: Minimal (clean recordings)
- **Compression**: Lossy compression acceptable for size savings
- **Licensing**: Verified CC0 or MIT (not CC-BY or CC-BY-SA)

## Phase 1 Task: Source Assets

1. **Find Candidates**
   - Search Freesound.org for "boxing bell", "gym timer", "air horn"
   - Listen to samples; rank by gym authenticity

2. **Download & Verify**
   - Confirm CC0 or MIT license in metadata
   - Verify commercial use allowed
   - Check file size (< 50 KB target)

3. **Convert if Needed**
   - If MP3: convert to WAV using FFmpeg
   - If stereo: downmix to mono

4. **Store Assets**
   - Place in `src/audio/assets/`
   - Naming: `bell.wav`, `double_bell.wav`, `beep.wav`, `horn.wav`

5. **Update License**
   - Document source, license, URL in this file
   - Add attribution in app UI (Settings → About → Sound Credits)

## License Attribution

### App License

Boxing Timer is licensed under **MIT** (see LICENSE in repo root).

MIT permits:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability (no warranty)

### Audio Assets License

Each asset must have:
- ✅ CC0 (public domain) OR
- ✅ MIT license OR
- ✅ CC-BY with attribution clause honored

**Prohibited**:
- ❌ CC-BY-SA (requires derivative sharing)
- ❌ CC-NC (non-commercial restriction)
- ❌ Proprietary (requires paid license)

## Attribution

In-app credits (Settings → About):

```
Audio Credits:
- Boxing Bell: [Source URL] ([License])
- Timer Beep: [Source URL] ([License])
- Session End Horn: [Source URL] ([License])
```

## Testing Latency

Before Phase 2:

```typescript
// Test audio latency
const startTime = performance.now();
await audioManager.playCue('bell');
const endTime = performance.now();
console.log(`Audio latency: ${endTime - startTime}ms`);
// Target: < 100ms for first cue, < 50ms for subsequent
```

## Future Considerations

- **Recording Custom Assets**: If budget permits, hire sound engineer for authentic gym audio
- **Alternative Audio Packs**: MMA Horn, Beep variants (Phase 2+)
- **Localized Cues**: Voice countdown in multiple languages (Phase 3+)

---

See [OPERATIONS.md](./OPERATIONS.md) for deployment checklist.
