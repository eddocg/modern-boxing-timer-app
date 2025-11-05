# Operations

This guide covers building, testing, and deploying Boxing Timer to iOS, Android, and Web platforms.

## Prerequisites

### All Platforms

- Node.js 16+ (https://nodejs.org/)
- npm or yarn
- Git

### iOS (macOS only)

- Xcode 13+ (from App Store)
- macOS 11+
- Apple Developer Account (free tier OK for development)

### Android

- Android Studio or Android SDK tools
- JDK 11+
- Emulator or physical device with USB debugging

### Web PWA

- Node.js (npm) only; no additional tools needed

### EAS (Native Builds in Cloud)

- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo Account: https://expo.dev (free tier OK)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/[username]/boxing-timer.git
cd boxing-timer
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start Development Server (Choose One)

**Web PWA:**
```bash
npm run web
```
Opens: http://localhost:8081 (Expo CLI default)

**iOS Simulator:**
```bash
npm run ios
```
(Requires macOS with Xcode)

**Android Emulator:**
```bash
npm run android
```
(Requires Android Studio Emulator running)

### 4. Hot Reload

Press `r` in terminal to reload app.

## Testing Locally

```bash
# Run all tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Full pre-commit suite
npm run lint:fix && npm run type-check && npm run test
```

## Building for Production

### Web PWA (Static Export)

```bash
npm run build:web
```

**Output**: `dist/` folder with static files

**Deploy to**:
- Vercel: `vercel deploy dist/`
- Netlify: Drag & drop `dist/` to https://app.netlify.com
- GitHub Pages: Push `dist/` to `gh-pages` branch
- Your own server: Copy `dist/` contents to web root

**Test Locally Before Deploy**:
```bash
cd dist
python3 -m http.server 8000
# Open http://localhost:8000
```

### iOS (via EAS Build)

**Step 1: Authenticate**
```bash
eas login
# Enter Expo account credentials
```

**Step 2: Configure (if needed)**
Create `eas.json` in project root (already in template):
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "ios": {
        "image": "latest",
        "resourceClass": "default"
      }
    },
    "internal": {
      "ios": {
        "image": "latest",
        "resourceClass": "default"
      }
    }
  }
}
```

**Step 3: Build**
```bash
eas build --platform ios --profile production
```

**Output**: `.ipa` file (ready for TestFlight or App Store)

**TestFlight Distribution**:
1. Download `.ipa` from EAS dashboard
2. Upload to App Store Connect via Transporter
3. Add TestFlight testers

### Android (via EAS Build)

**Step 1: Authenticate**
```bash
eas login
```

**Step 2: Build**
```bash
eas build --platform android --profile production
```

Generates both:
- `.apk` (installable on any Android device)
- `.aab` (for Google Play Store)

**Step 3: Test APK**
```bash
adb install app-release.apk
```

**Step 4: Upload AAB to Play Store**
1. Download `.aab` from EAS dashboard
2. Upload to Google Play Console
3. Release to internal testing

## App Store Submission Checklist

### Pre-Submission

- [ ] All tests pass: `npm run test && npm run e2e`
- [ ] Type-check passes: `npm run type-check`
- [ ] No ESLint warnings: `npm run lint`
- [ ] Bundle size verified: `npm run build:web` → < 2 MB
- [ ] Audio latency tested: < 100 ms first cue
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Privacy Policy written and in-app
- [ ] Version bumped: `1.0.0` (semver)
- [ ] CHANGELOG updated with release notes
- [ ] Screenshot assets prepared (app store images)

### iOS App Store

1. **Prepare Assets** (in App Store Connect):
   - App name: "Boxing Timer"
   - Description: (from README.md)
   - Keywords: timer, boxing, gym, training
   - Screenshot: 6.5" display mockup, 3x minimum
   - Preview video: Optional

2. **Build & Upload**:
   ```bash
   eas build --platform ios --profile production
   # Download .ipa
   xcrun altool --upload-app -f app.ipa -t ios \
     -u email@example.com -p app-password
   ```

3. **Submit for Review**:
   - Go to App Store Connect
   - Select build
   - Fill Submission Information
   - Select category: "Sports"
   - Submit for Review
   - Wait 24–48 hours

4. **Post-Approval**:
   - Set release date
   - Release to App Store

### Android Play Store

1. **Prepare Assets** (in Play Console):
   - App name: "Boxing Timer"
   - Short description: < 80 chars
   - Full description: (from README.md)
   - Screenshots: 5–8 x 1080x1920px
   - Graphic (feature image): 1024x500px
   - Category: "Sports"

2. **Upload AAB**:
   ```bash
   eas build --platform android --profile production
   # Download .aab
   ```
   - Go to Play Console → Your app → Release
   - Select "Create new release"
   - Upload `.aab`
   - Fill Release notes: (from CHANGELOG.md)

3. **Submit for Review**:
   - Review content policy
   - Submit for review
   - Wait 2–4 hours

4. **Manage Release**:
   - Staged rollout: 10% → 50% → 100%
   - Monitor crash rates
   - Gradually increase if stable

## Environment Variables

Create `.env` (not tracked by Git):

```bash
EXPO_USERNAME=your-expo-username
EXPO_PASSWORD=your-expo-password
```

Used by EAS CLI for automation.

## Troubleshooting

### Web Won't Start

```bash
# Clear cache
rm -rf node_modules .expo
npm install
npm run web
```

### iOS Build Fails

```bash
# Clear Expo cache
expo start --clear

# Verify Xcode
xcode-select --install
```

### Android Build Fails

```bash
# Verify Android SDK
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list

# Clear Gradle cache
rm -rf ~/.gradle
```

### Audio Not Playing

- Check browser console for errors
- Verify audio assets exist: `src/audio/assets/`
- Test on actual device (simulator audio often unreliable)

## Performance Monitoring

### Bundle Size (Web)

```bash
npm run build:web
du -sh dist/
# Should be < 2 MB
```

### Runtime Metrics

```typescript
// In app code
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

### Memory Profiling

**React Native Debugger**: https://github.com/jhen0409/react-native-debugger

## Deployment Log Template

```
Version: 1.0.0
Date: 2024-01-15
Platforms: Web, iOS, Android

Web (PWA):
- Size: 1.8 MB
- Build time: 45s
- Deploy: Vercel (https://boxing-timer.vercel.app)

iOS:
- Build: EAS (ipa-xxxxx)
- Status: Submitted to App Store
- Reviewed: Pending

Android:
- Build: EAS (aab-xxxxx)
- Status: Staged rollout 10% → 50% → 100%
- Reviewed: 3h (approved)

Notes:
- All tests passed
- Accessibility audit passed
- Audio latency: 85ms
```

---

See [ROADMAP.md](./ROADMAP.md) for release timeline.
