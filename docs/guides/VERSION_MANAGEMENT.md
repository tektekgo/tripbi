# Version Management Guide

> **Last Updated:** 2026-01-18

## Overview

TripBi uses a centralized version management system that maintains consistency across:
- **Web** (Vite build)
- **Android** (Capacitor)
- **iOS** (Capacitor)

## Version Format

```
MAJOR.MINOR.PATCH (BUILD)
Example: 1.2.3 (42)
```

| Component | Purpose | When to Bump |
|-----------|---------|--------------|
| **MAJOR** | Breaking changes | Incompatible API changes |
| **MINOR** | New features | Backwards-compatible features |
| **PATCH** | Bug fixes | Backwards-compatible fixes |
| **BUILD** | Build number | Auto-increments on each build |

## Single Source of Truth

All version information lives in `/version.json`:

```json
{
  "version": "1.0.0",
  "build": 42,
  "buildDate": "2026-01-18T12:00:00.000Z"
}
```

This file is:
- Read by Vite at build time
- Synced to `package.json`
- Synced to Android `build.gradle` (after Capacitor setup)
- Synced to iOS `Info.plist` (after Capacitor setup)

## Scripts

### Automatic Build Bump

Every production build automatically increments the build number:

```bash
npm run build        # Bumps build number, then builds
npm run build:no-bump # Builds without bumping (for testing)
```

### Manual Version Bumps

Use these when releasing new versions:

```bash
npm run version:patch  # 1.0.0 → 1.0.1
npm run version:minor  # 1.0.0 → 1.1.0
npm run version:major  # 1.0.0 → 2.0.0
```

### Sync to Native Projects

After Capacitor is initialized, sync versions to native projects:

```bash
npm run version:sync
```

This updates:
- `android/app/build.gradle` → `versionCode` and `versionName`
- `ios/App/App/Info.plist` → `CFBundleVersion` and `CFBundleShortVersionString`

## Accessing Version in Code

```typescript
import { getVersionInfo, getDisplayVersion } from '@/lib/version'

// Full version info
const info = getVersionInfo()
// {
//   version: "1.0.0",
//   build: 42,
//   buildDate: "2026-01-18T12:00:00.000Z",
//   displayVersion: "1.0.0 (42)",
//   shortVersion: "v1.0.0"
// }

// Just the display string
const display = getDisplayVersion() // "1.0.0 (42)"
```

## UI Display

The version is displayed in the app footer:
- Format: `1.0.0 (42)`
- Location: Bottom of every page
- Style: Subtle, secondary text color

## Platform-Specific Notes

### Web (Firebase Hosting)

Version is injected at build time via Vite's `define` option. No runtime fetch needed.

### Android

After Capacitor setup:
1. Run `npm run version:sync` before building
2. `versionCode` (build number) is used for Play Store updates
3. `versionName` (semantic version) is shown to users

```groovy
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 42
        versionName "1.0.0"
    }
}
```

### iOS

After Capacitor setup:
1. Run `npm run version:sync` before building
2. `CFBundleVersion` (build number) is used for App Store updates
3. `CFBundleShortVersionString` (semantic version) is shown to users

```xml
<!-- ios/App/App/Info.plist -->
<key>CFBundleVersion</key>
<string>42</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

## CI/CD Integration

### GitHub Actions (Current Setup)

The build workflow should:
1. Checkout code
2. Run `npm run build` (auto-bumps build number)
3. Commit the updated `version.json` (optional)
4. Deploy

**Note:** If you want build numbers to be tracked in git, add this to your workflow:

```yaml
- name: Commit version bump
  run: |
    git config user.name "GitHub Actions"
    git config user.email "actions@github.com"
    git add version.json
    git commit -m "Bump build number to $(jq -r .build version.json)" || true
    git push
```

### Release Workflow

For version releases:

```bash
# 1. Bump version (commits to git)
npm run version:minor  # or patch/major

# 2. Sync to native (after Capacitor)
npm run version:sync

# 3. Commit native changes
git add .
git commit -m "Release v$(jq -r .version version.json)"
git tag "v$(jq -r .version version.json)"
git push --tags

# 4. Build for each platform
npm run build           # Web
npx cap sync android    # Android
npx cap sync ios        # iOS
```

## Checking Version in Production

Users can see the version in the app footer. For debugging:

```javascript
// In browser console
console.log(__APP_VERSION__, __APP_BUILD__)
```

## Troubleshooting

### Version not updating in app
1. Clear browser cache / reinstall app
2. Check `version.json` has correct values
3. Rebuild: `npm run build:no-bump`

### Native version out of sync
1. Run `npm run version:sync`
2. Rebuild native projects

### Build number not incrementing
1. Check `scripts/bump-build.js` exists
2. Verify `npm run build` runs the script
3. Check file permissions on `version.json`

---

## File Reference

| File | Purpose |
|------|---------|
| `version.json` | Single source of truth |
| `vite.config.ts` | Injects version into web build |
| `src/lib/version.ts` | Version utilities |
| `src/vite-env.d.ts` | TypeScript declarations |
| `scripts/bump-build.js` | Auto-increment build |
| `scripts/bump-version.js` | Semantic version bumps |
| `scripts/sync-version.js` | Sync to native projects |
