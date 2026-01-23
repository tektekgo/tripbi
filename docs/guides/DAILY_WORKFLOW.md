# TripBi Daily Workflow - Quick Reference

> **Last Updated:** 2026-01-18
> Quick commands and workflows for daily TripBi development

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
# GIT WORKFLOW
# ─────────────────────────────────────────────────────────────

git checkout dev                    # Switch to dev branch
git pull origin dev                 # Get latest changes
git checkout -b feature/my-feature  # Create feature branch
git push -u origin feature/my-feature

# ─────────────────────────────────────────────────────────────
# FIREBASE (LOCAL)
# ─────────────────────────────────────────────────────────────

firebase use dev         # Switch to dev project
firebase use prod        # Switch to prod project
firebase use             # Show current project

firebase deploy          # Deploy everything (hosting, rules)
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

npm run deploy:dev       # Shortcut: switch to dev + deploy
npm run deploy:prod      # Shortcut: switch to prod + deploy

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
git checkout dev
git pull origin dev

# 2. Start dev server
npm run dev

# 3. Open browser to http://localhost:5173
```

### Working on a Feature

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/add-trip-creation

# 2. Make your changes...

# 3. Test locally
npm run dev
npm run lint
npm run build:no-bump

# 4. Commit your changes
git add .
git commit -m "Add trip creation flow"

# 5. Push and create PR
git push -u origin feature/add-trip-creation
# Create PR on GitHub: feature/add-trip-creation → dev
```

### Code Review & Merge

```bash
# After PR is approved:
# 1. Merge PR on GitHub (into dev)
# 2. GitHub Actions auto-deploys to tripbi-dev.web.app

# 3. Test on dev environment
# Visit: https://tripbi-dev.web.app

# 4. If all good, create PR: dev → main
# 5. Merge to main → auto-deploys to production
```

---

## Deployment Workflows

### Automatic Deployments (CI/CD)

| Branch | Trigger | Deploys To |
|--------|---------|------------|
| `dev` | Push/Merge | tripbi-dev.web.app |
| `main` | Push/Merge | tripbi.app (production) |

You don't need to manually deploy for web - just push to the right branch!

### Manual Deployment (Emergency)

```bash
# Deploy to dev
firebase use dev
npm run build:no-bump
firebase deploy

# Deploy to prod
firebase use prod
npm run build
firebase deploy
```

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

### Web Release (via CI/CD)

- [ ] PR from `dev` to `main` created
- [ ] PR reviewed and approved
- [ ] Merged to `main`
- [ ] Verify deployment at tripbi.app
- [ ] Smoke test critical flows

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
firebase login

# Check current project
firebase use

# Re-authenticate if needed
firebase login --reauth
```

### Version Not Showing in App

```bash
# Rebuild with fresh version
npm run build:no-bump
npm run dev
```

---

## Environment Quick Reference

| Environment | URL | Firebase Project | Branch |
|-------------|-----|------------------|--------|
| Local | localhost:5173 | tripbi-dev | any |
| Development | tripbi-dev.web.app | tripbi-dev | dev |
| Production | tripbi.app | tripbi-prod | main |

---

## Key Files

| File | Purpose |
|------|---------|
| `PROJECT_STATE.md` | Project context & decisions |
| `version.json` | App version (single source of truth) |
| `.env.development` | Dev Firebase config |
| `.env.production` | Prod Firebase config |
| `firebase.json` | Firebase deployment config |

---

## Need Help?

- **Project context:** Read `PROJECT_STATE.md`
- **Firebase setup:** Read `docs/setup/FIREBASE_SETUP.md`
- **CI/CD issues:** Read `docs/setup/CICD_SETUP.md`
- **Version management:** Read `docs/guides/VERSION_MANAGEMENT.md`
- **Design system:** Read `docs/architecture/DESIGN_SYSTEM.md`
