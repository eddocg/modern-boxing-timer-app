# Privacy

## Privacy-First by Design

Boxing Timer is designed with **privacy as a core principle**. No personal data is collected, processed, or transmitted.

## What Data We Collect

**None.** Boxing Timer collects zero telemetry, analytics, or personal information.

## Local Storage Only

All data stored on the user's device:

- **Settings**: Work/rest durations, rounds, volume, sound pack (device only)
- **Timer State**: Pause/resume timestamps (device memory only, cleared on app close)
- **Session History**: Not tracked or stored (can be added as opt-in in future)

Data **never** leaves the device.

## No Network Calls

The app makes **zero network requests**:

- ✅ Works offline
- ✅ No sync to cloud
- ✅ No crash reporting
- ✅ No analytics
- ✅ No ads or third-party trackers
- ✅ No user accounts or login

## No Permissions Requested

The app requests **minimal iOS/Android permissions**:

- **Keep Screen Awake** (expo-keep-awake): Prevents lock screen while timer running
- **Haptic Feedback** (expo-haptics): Vibration on state transitions
- **Audio**: Play sound cues

**No permissions for**: Camera, Microphone, Contacts, Location, Photos, Clipboard, Health data, etc.

## Data Retention

### Session Data
- Cleared when app is closed
- Not persisted between sessions

### User Settings
- Stored in device AsyncStorage (encrypted by OS)
- Deleted only when user uninstalls app
- User can manually clear via Settings → Apps → Boxing Timer → Clear Data (iOS/Android)

### Crash Reports
- Not collected
- Errors logged to console (dev only)

## Third-Party Services

**None used.**

- No Firebase
- No Mixpanel, Amplitude, or analytics SDKs
- No advertising networks
- No crash reporting (Sentry, etc.)
- No cloud sync services

## Open Source & Transparency

The full source code is available at:
https://github.com/[username]/boxing-timer

You can audit the code yourself; no hidden data collection.

## Compliance

### GDPR (EU)
- ✅ No personal data = GDPR compliant by default
- ✅ No consent required (no data processing)

### CCPA (California)
- ✅ No personal information collected or sold
- ✅ No "sale of personal information"

### COPPA (Children)
- ✅ Safe for users under 13 (no data collection, no ads)

### App Store/Play Store Requirements
- ✅ Privacy Policy: Compliant with app store requirements
- ✅ No "tracking" designation needed (no data collection)

## Future Changes

If we ever add:
- **Optional Analytics**: Explicit opt-in with clear consent
- **Cloud Sync**: Encrypted, user-controlled, transparent
- **User Accounts**: Password-protected, no email sharing, GDPR-compliant

…we will:
1. Update this Privacy Policy
2. Get explicit user consent
3. Allow opt-out at any time
4. Provide data export/deletion tools

## Contact

For privacy questions:
- Open an issue on GitHub
- Email: [to be determined]

## Changes to This Policy

This policy may be updated in future releases. Users will be notified of material changes via in-app notification.

**Last Updated**: [Date of current release]

---

Boxing Timer is **completely private by design**. Trust us with your training—we're not collecting it.
