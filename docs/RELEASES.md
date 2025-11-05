# Releases

This guide covers versioning, changelog management, and app store release procedures.

## Versioning

Boxing Timer uses **Semantic Versioning (semver)**:

```
MAJOR.MINOR.PATCH
1.2.3
```

- **MAJOR**: Breaking changes (rare for user-facing app)
- **MINOR**: New features, non-breaking changes
- **PATCH**: Bug fixes

### Version Bumping

```bash
# View current version
grep '"version"' package.json

# Bump patch (1.0.0 → 1.0.1)
npm version patch

# Bump minor (1.0.0 → 1.1.0)
npm version minor

# Bump major (1.0.0 → 2.0.0)
npm version major
```

This updates `package.json`, `app.json`, creates a git tag, and commits.

## Changelog

**File**: `CHANGELOG.md` (in repo root)

**Format**: Keep a Changelog (https://keepachangelog.com/)

```markdown
# Changelog

## [1.1.0] - 2024-02-15

### Added
- Haptic feedback on state transitions
- Three sound pack options (Boxing Bell, MMA Horn, Beep)

### Fixed
- Audio latency on first cue (now < 50ms)
- Settings not persisting on Android

### Changed
- Yellow threshold default increased to 10 seconds

## [1.0.0] - 2024-01-15

### Added
- Initial release
- Circular timer with monotonic progress
- Three-light system (green/yellow/red)
- Settings persistence
- Web PWA support
```

### Entry Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [Feature description]

### Changed
- [Behavior change]

### Fixed
- [Bug fix]

### Removed
- [Deprecated feature]
```

### Guidelines

- One entry per release
- Group changes by type (Added, Changed, Fixed, Removed)
- Describe from user perspective ("Fixed audio latency" not "Optimized replay queue")
- Link to GitHub issues if public: `Fixes #123`

## Release Process

### 1. Update Version

```bash
npm version minor  # or patch/major
```

This:
- Updates version in `package.json` and `app.json`
- Creates git commit
- Creates git tag (e.g., `v1.1.0`)

### 2. Update Changelog

Edit `CHANGELOG.md`:
- Add new `## [X.Y.Z] - YYYY-MM-DD` section
- List all changes (features, fixes, changes)
- Keep format consistent

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for 1.1.0"
```

### 3. Run Tests & Builds

```bash
npm run lint && npm run type-check && npm run test && npm run e2e
npm run build:web
```

Verify all pass before release.

### 4. Create GitHub Release

```bash
# Push tag to GitHub
git push origin main --follow-tags

# Go to GitHub Releases tab
# Click "Create release from tag"
# Title: v1.1.0
# Description: Copy from CHANGELOG.md
# Publish
```

### 5. Build for App Stores

#### Web PWA

```bash
npm run build:web
# Deploy dist/ to hosting (Vercel, Netlify, etc.)
```

#### iOS

```bash
eas build --platform ios --profile production
# Download .ipa from EAS dashboard
# Upload to App Store Connect → TestFlight
# Submit for review
```

#### Android

```bash
eas build --platform android --profile production
# Download .aab from EAS dashboard
# Upload to Google Play Console
# Submit for review
```

### 6. Monitor Release

- Check crash reports (if analytics enabled)
- Respond to user reviews/feedback
- Plan hotfix if critical issues discovered

### 7. Post-Release

- Close related GitHub issues
- Update in-app version string (if displayed)
- Plan next release features in ROADMAP.md

## Store-Specific Notes

### App Store (iOS)

**Submission Checklist**:
- [ ] Version number incremented (e.g., 1.1.0)
- [ ] Build number incremented (e.g., 1, 2, 3)
- [ ] CHANGELOG reviewed and accurate
- [ ] All tests pass
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy URL set
- [ ] Age rating selected (13+)
- [ ] All required metadata filled

**Review Time**: 24–48 hours typically

**Common Rejection Reasons**:
- Misleading metadata
- Missing privacy policy
- Crashes on launch
- Outdated screenshots

**Release Strategy**:
- Submit to Review
- Once approved, release immediately or schedule

### Google Play (Android)

**Submission Checklist**:
- [ ] Version code incremented (e.g., 1, 2, 3)
- [ ] Version name matches package.json (e.g., 1.1.0)
- [ ] CHANGELOG reviewed
- [ ] All tests pass
- [ ] Screenshots updated (if UI changed)
- [ ] Privacy policy URL set
- [ ] Content rating completed
- [ ] All required metadata filled

**Review Time**: 2–4 hours typically (faster than iOS)

**Release Strategy**:
- Upload → Internal Testing
- Monitor for crashes (24h)
- Rollout: 10% → 25% → 50% → 100% (monitor each stage)

### Web PWA

**No review process**; deploy immediately after testing.

**Deployment**:
```bash
npm run build:web
# Vercel
vercel deploy dist/ --prod
# or
# Netlify drag & drop
```

## Emergency Hotfix

If critical bug discovered post-release:

```bash
# 1. Create hotfix branch
git checkout -b fix/critical-bug

# 2. Fix bug, test thoroughly
# ...

# 3. Bump patch version
npm version patch

# 4. Update CHANGELOG
# Add: "### Fixed" section with bug description

# 5. Commit & push
git push origin fix/critical-bug

# 6. Create PR, merge, and follow normal release process
```

**Patch Versioning**: 1.0.0 → 1.0.1 (patch for hotfix)

## Beta Releases

For testing before public release:

**iOS TestFlight**:
```bash
eas build --platform ios --profile production
# In App Store Connect, add TestFlight testers
# Share TestFlight link with beta testers
```

**Android Internal Testing**:
```bash
eas build --platform android --profile production
# Upload to Google Play Console → Internal Testing
# Share APK download link with testers
```

**Web Staging**:
```bash
npm run build:web
# Deploy to staging domain (e.g., staging.boxing-timer.com)
# Share with testers
```

Version string: Use `-beta.1`, `-rc.1` suffixes (e.g., `1.1.0-beta.1`)

## Rollback

If release has critical issues:

### iOS
1. In App Store Connect, select previous build
2. Submit that build for review
3. Once approved, release

### Android
1. In Google Play Console, pause current rollout
2. Release previous version to 100%
3. Fix bug locally, create hotfix

### Web
1. Rollback deployment: `vercel rollback`
2. Fix bug, rebuild, redeploy

## Versioning Examples

```
Phase 1 Completion:
  1.0.0-rc.1 (release candidate)
  1.0.0 (public release)

Phase 2 Polish:
  1.1.0 (new features: haptics, improved audio)

Phase 3 Hardening:
  1.0.1 (hotfix: error boundary)
  1.1.1 (patch: accessibility improvements)
  2.0.0 (major: if significant breaking changes)
```

## Release Calendar

Suggested schedule (optional):

- **Weekly**: Internal builds, beta testing
- **Bi-weekly**: Minor features, bug fixes
- **Monthly**: Major features, Phase milestones
- **As needed**: Hotfixes for critical issues

Adjust based on feature velocity and stability.

---

See [OPERATIONS.md](./OPERATIONS.md) for build procedures.
