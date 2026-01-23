# TripBi Daily Workflow - Quick Reference

> **Last Updated:** 2026-01-23
> Quick commands and workflows for daily TripBi development

---

## TL;DR - Most Important Commands

```bash
# Day-to-day development
npm run dev                            # Start local server at localhost:5173

# Before committing
npx tsc --noEmit                       # Check for TypeScript errors
npm run lint                           # Check for lint errors

# Deploy to tripbi-dev.web.app
npm run deploy:dev                     # Build + deploy (one command)
```

**Key Rule:** Always use `build:dev` or `deploy:dev` when deploying to tripbi-dev. Using plain `build` will fail because `.env.production` has placeholder values.

---

## Quick Commands Cheat Sheet

```bash
# ─────────────────────────────────────────────────────────────
# DEVELOPMENT
# ─────────────────────────────────────────────────────────────

npm run dev              # Start local dev server (http://localhost:5173)
npm run build:no-bump    # Build without incrementing version (for testing)
npm run lint             # Run ESLint
npm run preview          # Preview production build locally

# ─────────────────────────────────────────────────────────────
# VERSION MANAGEMENT
# ─────────────────────────────────────────────────────────────

npm run build            # Build + auto-increment build number
npm run version:patch    # 1.0.0 → 1.0.1 (bug fixes)
npm run version:minor    # 1.0.0 → 1.1.0 (new features)
npm run version:major    # 1.0.0 → 2.0.0 (breaking changes)
npm run version:sync     # Sync version to Android/iOS (after Capacitor setup)

# ─────────────────────────────────────────────────────────────
# GIT WORKFLOW (currently working directly on main)
# ─────────────────────────────────────────────────────────────

git pull origin main                # Get latest changes
git add <files>                     # Stage specific files
git commit -m "feat: description"   # Commit with message
git push origin main                # Push to remote

# ─────────────────────────────────────────────────────────────
# FIREBASE (use npx prefix)
# ─────────────────────────────────────────────────────────────

npx firebase use tripbi-dev   # Switch to dev project
npx firebase use tripbi-prod  # Switch to prod project (when ready)
npx firebase use              # Show current project

npx firebase deploy                        # Deploy everything (hosting, rules)
npx firebase deploy --only hosting         # Deploy hosting only
npx firebase deploy --only firestore:rules # Deploy Firestore rules
npx firebase deploy --only functions       # Deploy Cloud Functions

npm run deploy:dev       # Build with dev env + deploy to tripbi-dev
npm run deploy:prod      # Build with prod env + deploy to tripbi-prod (when ready)

# ─────────────────────────────────────────────────────────────
# CAPACITOR (MOBILE) - After Phase 8 Setup
# ─────────────────────────────────────────────────────────────

npx cap sync             # Sync web assets to native projects
npx cap open android     # Open Android Studio
npx cap open ios         # Open Xcode
npx cap run android      # Build and run on Android device/emulator
npx cap run ios          # Build and run on iOS simulator
```

---

## Daily Development Workflow

### Starting Your Day

```bash
# 1. Pull latest changes
git pull origin main

# 2. Start dev server
npm run dev

# 3. Open browser to http://localhost:5173
```

### Working on a Feature (Current: Direct to Main)

```bash
# 1. Pull latest and start working
git pull origin main

# 2. Make your changes...

# 3. Test locally
npm run dev
npm run lint
npx tsc --noEmit

# 4. Commit your changes
git add <specific-files>
git commit -m "feat: Add trip creation flow"

# 5. Push to main
git push origin main

# 6. Deploy to dev for testing
npm run deploy:dev
```

### Working on a Feature (Future: Branch-Based)

When the team grows, use feature branches:

```bash
git checkout -b feature/add-trip-creation
# Make changes...
git push -u origin feature/add-trip-creation
# Create PR on GitHub: feature/add-trip-creation → main
```

### After Making Changes

```bash
# 1. Verify code compiles and lints
npx tsc --noEmit
npm run lint

# 2. Commit changes
git add <specific-files>
git commit -m "feat: Description of change"
git push origin main

# 3. Deploy to dev for testing
npm run deploy:dev

# 4. Test on dev environment
# Visit: https://tripbi-dev.web.app
```

---

## Deployment Workflows

### Current Setup: Manual Deployment

CI/CD is not set up yet. All deployments are manual.

**IMPORTANT:** Use `build:dev` when deploying to tripbi-dev (uses `.env.development` credentials).

### Deploy to tripbi-dev (Current)

```bash
# Option 1: Single command (recommended)
npm run deploy:dev

# Option 2: Step by step
npm run build:dev                      # Build with .env.development
npx firebase deploy --only hosting     # Deploy to Firebase
```

### Deploy to tripbi-prod (Future - Not Set Up Yet)

```bash
# When tripbi-prod is configured with real credentials in .env.production:
npm run deploy:prod
```

### Why build:dev vs build?

| Command | Environment File | Firebase Project | Use When |
|---------|------------------|------------------|----------|
| `npm run build` | `.env.production` | tripbi-prod | Deploying to production |
| `npm run build:dev` | `.env.development` | tripbi-dev | Deploying to dev |

**Common Mistake:** Using `npm run build` for tripbi-dev will fail with "API key not valid" because `.env.production` has placeholder values.

---

## Mobile Deployment

### Android (Google Play Store)

```bash
# 1. Ensure version is updated
npm run version:minor        # or patch/major
npm run version:sync         # Sync to Android

# 2. Build web assets
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Open Android Studio
npx cap open android

# 5. In Android Studio:
#    - Build → Generate Signed Bundle/APK
#    - Choose Android App Bundle (.aab)
#    - Sign with your upload keystore
#    - Build Release

# 6. Upload to Play Console:
#    - Go to https://play.google.com/console
#    - Select TripBi app
#    - Production → Create new release
#    - Upload the .aab file
#    - Add release notes
#    - Submit for review
```

### iOS (Apple App Store)

```bash
# 1. Ensure version is updated
npm run version:minor        # or patch/major
npm run version:sync         # Sync to iOS

# 2. Build web assets
npm run build

# 3. Sync to iOS
npx cap sync ios

# 4. Open Xcode
npx cap open ios

# 5. In Xcode:
#    - Select "Any iOS Device" as target
#    - Product → Archive
#    - Wait for archive to complete
#    - Organizer opens → Distribute App
#    - Choose "App Store Connect"
#    - Upload

# 6. In App Store Connect:
#    - Go to https://appstoreconnect.apple.com
#    - Select TripBi app
#    - Create new version
#    - Add build from uploaded archive
#    - Fill in metadata
#    - Submit for review
```

---

## Release Checklist

### Before Any Release

- [ ] All tests passing locally
- [ ] Lint errors fixed (`npm run lint`)
- [ ] Build succeeds (`npm run build:no-bump`)
- [ ] Tested on dev environment
- [ ] Version bumped appropriately
- [ ] CHANGELOG updated (if maintaining one)

### Web Release (Manual - Current Process)

- [ ] Code committed and pushed to `main`
- [ ] Run `npm run deploy:dev`
- [ ] Verify deployment at https://tripbi-dev.web.app
- [ ] Smoke test critical flows (login, create trip, proposals)

### Mobile Release

- [ ] Version synced (`npm run version:sync`)
- [ ] Web build complete (`npm run build`)
- [ ] Native sync complete (`npx cap sync`)
- [ ] Signed release build created
- [ ] Uploaded to store
- [ ] Release notes written
- [ ] Submitted for review

---

## Troubleshooting

### Dev Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Build Fails

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint
```

### Firebase Deploy Fails

```bash
# Check you're logged in
npx firebase login

# Check current project
npx firebase use

# Should show: tripbi-dev
# If wrong project, switch:
npx firebase use tripbi-dev

# Re-authenticate if needed
npx firebase login --reauth
```

### "API Key Not Valid" Error After Deploy

**Cause:** You used `npm run build` instead of `npm run build:dev`

**Fix:**
```bash
npm run build:dev                      # Rebuild with dev credentials
npx firebase deploy --only hosting     # Redeploy
```

### Version Not Showing in App

```bash
# Rebuild with fresh version
npm run build:no-bump
npm run dev
```

---

## Environment Quick Reference

| Environment | URL | Firebase Project | Env File | Build Command |
|-------------|-----|------------------|----------|---------------|
| Local | localhost:5173 | tripbi-dev | `.env.development` | `npm run dev` |
| Development | tripbi-dev.web.app | tripbi-dev | `.env.development` | `npm run build:dev` |
| Production | tripbi.app | tripbi-prod | `.env.production` | `npm run build` |

**Note:** Production (tripbi-prod) is not set up yet. Currently deploying to tripbi-dev only.

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context & decisions |
| `version.json` | App version (auto-incremented on build) |
| `.env.development` | Dev Firebase config (tripbi-dev credentials) |
| `.env.production` | Prod Firebase config (placeholder - not set up) |
| `firebase.json` | Firebase deployment config |
| `firestore.rules` | Firestore security rules |
| `src/lib/firebase.ts` | Firebase initialization code |
| `docs/FEATURES.md` | All implemented features documentation |

---

## Need Help?

- **Project context:** Read `CLAUDE.md`
- **Features reference:** Read `docs/FEATURES.md`
- **Firebase setup:** Read `docs/setup/FIREBASE_SETUP.md`
- **Version management:** Read `docs/guides/VERSION_MANAGEMENT.md`
- **Design system:** Read `docs/architecture/DESIGN_SYSTEM.md`
