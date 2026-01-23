# TripBi Project State
> **Last Updated:** 2026-01-19
> **Current Phase:** Phase 1 Complete - Awaiting Firebase Setup
> **Next Action:** USER ACTION REQUIRED - Create Firebase projects before continuing

---

## Quick Resume

**If starting a new session, read this first.**

TripBi is a group trip planning platform. We are building a React + TypeScript + Firebase app with Capacitor for mobile deployment (Android first, then iOS).

**Current Status:** Phase 1 (Foundation) is COMPLETE. Design system and version management implemented. **Waiting on user to complete Firebase project setup.**

**What's been built:**
- Vite + React 19 + TypeScript project
- Tailwind CSS with full design system (subtle warm bg, teal primary, Inter font)
- Dark mode support throughout
- Full folder structure (features, components, pages, etc.)
- Firebase config with placeholders (needs real values)
- Firestore security rules and indexes
- Storage security rules
- GitHub Actions CI/CD (dev, prod, PR check)
- AuthContext with Firebase Auth integration
- Home page with design system applied
- TypeScript types for Trip, Proposal, Booking, etc.
- Version management system (version.json, auto-increment build, UI display)
- Daily workflow quick reference guide

**USER TASKS TO COMPLETE (before next coding session):**

1. **Create Firebase projects** (~45 min)
   - Follow `docs/setup/FIREBASE_SETUP.md`
   - Create `tripbi-dev` and `tripbi-prod` projects
   - Enable Auth, Firestore, Storage, Functions, Hosting
   - Register Web apps and **save the config values**

2. **Update .env files** (~5 min)
   - `.env.development` → tripbi-dev config
   - `.env.production` → tripbi-prod config

3. **Push to GitHub** (~5 min)
   - Create repo on github.com
   - `git add . && git commit -m "Initial commit"`
   - `git remote add origin <url> && git push -u origin main`

4. **Set up GitHub secrets** (~15 min)
   - Follow `docs/setup/CICD_SETUP.md`
   - Generate service account keys
   - Run `firebase login:ci`
   - Add all secrets to GitHub

5. **Create dev branch** (~2 min)
   - `git checkout -b dev && git push -u origin dev`

**After completing above, next coding tasks:**
- Test local development (`npm run dev`)
- Build Login, Signup, Password Reset pages (Phase 2)
- Continue to Phase 2 (Authentication completion)

---

## Key Decisions (Locked)

These decisions have been made and should NOT be revisited without explicit user request.

| # | Decision | Choice | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Frontend Framework | React 19 + TypeScript + Vite | Matches Splitbi, modern tooling | 2026-01-18 |
| 2 | Backend | Firebase (Firestore, Auth, Functions, Storage) | Serverless, real-time, familiar | 2026-01-18 |
| 3 | Styling | Tailwind CSS | Utility-first, fast iteration | 2026-01-18 |
| 4 | Mobile Framework | Capacitor | PWA-to-store path, single codebase | 2026-01-18 |
| 5 | Mobile Targets | Android first, then iOS | User preference, Splitbi pattern | 2026-01-18 |
| 6 | Firebase Environments | Separate dev/prod projects | Clean separation, safe testing | 2026-01-18 |
| 7 | CI/CD | GitHub Actions with dev/main branches | Standard, free for public repos | 2026-01-18 |
| 8 | Splitbi Auth | API key (MVP), upgrade later if needed | Simpler for initial integration | 2026-01-18 |
| 9 | Development Approach | Build with placeholders, integrate later | Faster iteration, unblocked work | 2026-01-18 |
| 10 | iOS Builds | Local Mac builds (user has macOS) | More control, no cloud build costs | 2026-01-18 |
| 11 | Design System | Subtle warm bg, teal primary, Inter font | Sibling to Splitbi, dark mode support | 2026-01-18 |
| 12 | Version Management | version.json + build auto-increment | Consistent across web/Android/iOS | 2026-01-18 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        TripBi App                           │
├─────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript + Vite + Tailwind                    │
│  ├── Web (PWA)                                              │
│  ├── Android (Capacitor)                                    │
│  └── iOS (Capacitor)                                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase Services                                          │
│  ├── Authentication (Email/Password + Google)               │
│  ├── Firestore (Database)                                   │
│  ├── Cloud Functions (API, Splitbi bridge)                  │
│  ├── Storage (File uploads)                                 │
│  └── Hosting (Web deployment)                               │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├── Resend (Email via mail.tripbi.app)                     │
│  └── Splitbi API (Expense tracking)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Documentation Index

All docs are organized under `/docs`:

| Document | Location | Purpose |
|----------|----------|---------|
| Product Spec | `docs/product/TripBi_Product_Spec-v01-12182025.md` | Full product specification |
| Prerequisites | `docs/product/TripBi_Prerequisites_Checklist.md` | Pre-development checklist |
| Firebase Setup | `docs/setup/FIREBASE_SETUP.md` | Create Firebase projects |
| CI/CD Setup | `docs/setup/CICD_SETUP.md` | Configure GitHub Actions |
| Splitbi API Spec | `docs/integrations/SPLITBI_API_SPEC.md` | API contract for Splitbi |
| Design System | `docs/architecture/DESIGN_SYSTEM.md` | Colors, typography, components |
| Version Management | `docs/guides/VERSION_MANAGEMENT.md` | Version & build tracking |
| Daily Workflow | `docs/guides/DAILY_WORKFLOW.md` | Quick reference commands |
| Cursor Guide | `docs/guides/TripBi_Cursor_Guide.md` | AI-assisted development |

---

## Splitbi Integration Spec

**Full spec:** `docs/integrations/SPLITBI_API_SPEC.md`

### Quick Reference - Endpoints to Build in Splitbi

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/tripbi/groups` | Create expense group |
| `GET /api/tripbi/groups/{id}/summary` | Get expense summary |
| `POST /api/tripbi/groups/{id}/members` | Add member to group |
| `GET /api/tripbi/groups/{id}/exists` | Verify group exists |
| `DELETE /api/tripbi/groups/{id}` | Delete group (optional) |

### Authentication
- API key in header: `Authorization: Bearer [SPLITBI_API_KEY]`
- Key stored in TripBi Cloud Functions environment (never client-side)

---

## Firebase Projects

| Environment | Project ID | Branch | Hosting URL | Status |
|-------------|------------|--------|-------------|--------|
| Development | `tripbi-dev` | `dev` | tripbi-dev.web.app | **TO CREATE** |
| Production | `tripbi-prod` | `main` | tripbi.app | **TO CREATE** |

---

## Project Structure (Current)

```
tripbi/
├── PROJECT_STATE.md          # THIS FILE - source of truth
├── .cursorrules              # AI assistant rules
├── .github/
│   └── workflows/
│       ├── deploy-dev.yml    # Deploy to dev on push to dev branch
│       ├── deploy-prod.yml   # Deploy to prod on push to main branch
│       └── pr-check.yml      # Run checks on pull requests
├── docs/
│   ├── README.md
│   ├── product/              # Product specs
│   ├── setup/                # Setup guides (Firebase, CI/CD)
│   ├── integrations/         # API specs (Splitbi)
│   ├── guides/               # Implementation guides
│   └── architecture/         # (future) Architecture docs
├── public/
│   ├── TripBi-svg.svg        # Logo
│   ├── favicon.ico           # Favicons
│   ├── manifest.json         # PWA manifest
│   └── ...
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component with routing
│   ├── vite-env.d.ts         # Vite type definitions
│   ├── components/
│   │   ├── ui/               # Basic UI elements
│   │   ├── layout/           # Layout components
│   │   └── shared/           # Shared components (LoadingSpinner)
│   ├── contexts/
│   │   └── AuthContext.tsx   # Firebase Auth context
│   ├── features/
│   │   ├── auth/             # (placeholder)
│   │   ├── trips/            # (placeholder)
│   │   ├── proposals/        # (placeholder)
│   │   ├── voting/           # (placeholder)
│   │   ├── bookings/         # (placeholder)
│   │   ├── timeline/         # (placeholder)
│   │   └── splitbi/          # (placeholder)
│   ├── hooks/
│   │   └── useFirestore.ts   # (placeholder)
│   ├── lib/
│   │   ├── firebase.ts       # Firebase initialization
│   │   └── constants.ts      # App constants
│   ├── pages/
│   │   └── Home.tsx          # Landing/home page
│   ├── styles/
│   │   └── index.css         # Global styles + Tailwind
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils/
│       ├── dateFormat.ts     # Date utilities
│       └── validation.ts     # Validation utilities
├── .env.example              # Environment template
├── .env.development          # Dev config (git-ignored, has placeholders)
├── .env.production           # Prod config (git-ignored, has placeholders)
├── firebase.json             # Firebase config
├── .firebaserc               # Firebase project aliases
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
├── storage.rules             # Storage security rules
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── tsconfig.node.json
```

---

## Development Phases

### Phase 1: Foundation [COMPLETE]
- [x] Initialize Vite + React + TypeScript
- [x] Configure Tailwind CSS
- [x] Create folder structure
- [x] Set up Firebase config (placeholders)
- [x] Set up environment variables
- [x] Create GitHub Actions workflows
- [x] Basic routing with React Router
- [x] Create .cursorrules file
- [x] AuthContext (basic implementation)
- [x] Home page with sign-in button
- [x] TypeScript types defined
- [x] Firestore security rules
- [x] Storage security rules

### Phase 2: Authentication [IN PROGRESS]
- [x] Firebase Auth setup (context created)
- [x] AuthContext provider (implemented)
- [ ] Login page (dedicated page with form)
- [ ] Signup page
- [ ] Protected routes component
- [ ] Password reset flow
- [ ] User profile basics

### Phase 3: Trip Management [NOT STARTED]
- [ ] Trip types/interfaces
- [ ] Create trip flow
- [ ] Trip dashboard (list view)
- [ ] Trip details page
- [ ] Member invitation system
- [ ] Trip settings/admin

### Phase 4: Proposals & Voting [NOT STARTED]
- [ ] Proposal types/interfaces
- [ ] Create proposal (by category)
- [ ] Proposal list view
- [ ] Voting system (yes/no/ranking)
- [ ] Comments system
- [ ] Status transitions (proposed → discussing → decided)

### Phase 5: Booking Tracker [NOT STARTED]
- [ ] Booking types/interfaces
- [ ] Mark as booked flow
- [ ] File upload (confirmations)
- [ ] My Bookings dashboard
- [ ] Group Booking Status view
- [ ] Reminder notifications

### Phase 6: Timeline [NOT STARTED]
- [ ] Timeline data structure
- [ ] Timeline generation logic
- [ ] Timeline UI component
- [ ] Export to PDF
- [ ] Shareable link

### Phase 7: Splitbi Integration [NOT STARTED]
- [ ] Cloud Functions for API calls
- [ ] useSplitbi hook
- [ ] SplitbiCard component
- [ ] Enable/disable integration per trip
- [ ] Error handling & fallbacks

### Phase 8: Mobile & Polish [NOT STARTED]
- [ ] Capacitor setup
- [ ] Android build configuration
- [ ] iOS build configuration
- [ ] Loading states everywhere
- [ ] Error boundaries
- [ ] Responsive design audit
- [ ] Performance optimization

---

## Session Log

| Date | Session Summary | Key Outcomes |
|------|-----------------|--------------|
| 2026-01-18 | Initial planning | Reviewed docs, made architecture decisions, created PROJECT_STATE.md |
| 2026-01-18 | Project scaffolding | Complete Phase 1: Vite project, Tailwind, folder structure, Firebase config, GitHub Actions, types, auth context, home page. Build verified working. |
| 2026-01-18 | Design system | Complete design system: Tailwind config with brand colors, CSS variables for light/dark mode, component classes (buttons, inputs, cards, badges), design system docs, updated Home page with dark mode support. |
| 2026-01-18 | Version management | Implemented version.json as single source of truth, auto-increment build on each build, version display in footer, sync scripts for Capacitor (Android/iOS), full documentation. |
| 2026-01-19 | Workflow docs + session pause | Created daily workflow quick reference guide. Session paused - user to complete Firebase setup tasks before next session. |

---

## Notes & Open Questions

1. **Firebase projects:** Need to create tripbi-dev and tripbi-prod
2. **Splitbi endpoints:** Need to be built in Splitbi project before Phase 7
3. **iOS builds:** User has Mac - can do local builds
4. **Apple Developer Account:** Needed before iOS deployment
5. **Build warning:** Large chunk size (536KB) - will address with code splitting in Phase 8

---

## How to Use This File

### Starting a New Session
```
"Read PROJECT_STATE.md and continue with TripBi development"
```

### During Development
- Update phase checklists as tasks complete
- Add new decisions to the "Key Decisions" table
- Log significant changes in "Session Log"

### Ending a Session
Ask Claude to update PROJECT_STATE.md with current status.

---

*This file is the single source of truth for TripBi development.*
